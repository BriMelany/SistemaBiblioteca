import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Estado = 'Activa' | 'Pendiente' | 'Cancelada' | 'Vencida';

interface Usuario {
  codigo: string; nombre: string; tipo: string; estado: string;
}
interface Recurso {
  portadaUrl?: string; tipo?: string; titulo?: string; autor?: string; editorial?: string;
}
type ReservaFilaLista = {
  id?: string|number; codigo?: string; fecha?: string; estado?: Estado|string;
  tipo?: string; titulo?: string; portadaUrl?: string; autor?: string; editorial?: string;
  usuario?: Usuario;
  tienePenalidades?: boolean; penalidades?: 'Sí'|'No'; penaliza?: boolean; montoPenalidad?: number;
  prioridad?: string; notificacion?: 'Sí'|'No'; fechaNotificacion?: string; sustento?: string;
};

@Component({
  selector: 'app-actualiza-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './actualiza-reserva.html',
  styleUrl: './actualiza-reserva.css'
})
export class ActualizaReserva {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cargando = true;
  error = '';

  reservaId = '';
  reservaCodigo = '';

  usuario: Usuario = { codigo: 'U-0001', nombre: 'Nombre Apellido', tipo: 'Estudiante / Docente', estado: 'Activo' };
  recurso: Recurso = { portadaUrl: '', tipo: '', titulo: '', autor: '', editorial: '' };

  // Fechas
  fechaReserva: Date | null = null;
  fechaExpiracion: Date | null = null;

  // Penalidades
  tienePenalidades = false;
  montoPenalidad = 0;
  get resultadoPenalidadTexto() { return this.tienePenalidades ? 'Presenta penalidades' : 'No presenta penalidades'; }

  // Editables
  notificacion: 'Sí' | 'No' = 'No';
  notificacionBloqueada = false;
  fechaNotificacion: Date | null = null;
  estadoReserva: Estado = 'Pendiente';
  sustento = '';

  // Listas de estado
  readonly ESTADOS_TODOS: Estado[] = ['Activa', 'Pendiente', 'Cancelada', 'Vencida'];
  readonly ESTADOS_SIN_ACTIVA: Estado[] = ['Pendiente', 'Cancelada', 'Vencida']; // <- SIEMPRE estos 3
  estadosDisponibles: Estado[] = [...this.ESTADOS_SIN_ACTIVA];
  opcionesNotificacion: Array<'Sí'|'No'> = ['No','Sí'];

  // Modo lectura total si estado llega Activa
  soloLecturaTotal = false;

  // Solo lectura
  prioridad = '001 (Orden en la lista de espera)';

  ngOnInit() {
    const fila = (history.state?.reserva || {}) as ReservaFilaLista;

    if (!fila || (!fila.id && !fila.codigo && !fila.titulo && !fila.tipo)) {
      this.error = 'No se recibieron datos desde la lista de reservas.';
      this.cargando = false;
      return;
    }

    // Mapear base
    this.reservaId = (fila.id ?? '').toString();
    this.reservaCodigo = fila.codigo ?? '';
    this.recurso = {
      tipo: fila.tipo ?? '', titulo: fila.titulo ?? '', portadaUrl: fila.portadaUrl ?? '',
      autor: fila.autor ?? '', editorial: fila.editorial ?? ''
    };
    if (fila.usuario) this.usuario = fila.usuario;

    // Fechas (LOCAL)
    this.fechaReserva = this.parseFechaLocal(fila.fecha);
    this.fechaExpiracion = this.fechaReserva ? this.addDays(this.fechaReserva, 7) : null;

    this.prioridad = fila.prioridad ?? this.prioridad;

    // Estado inicial
    const esValido = this.ESTADOS_TODOS.includes(fila.estado as Estado);
    this.estadoReserva = esValido ? (fila.estado as Estado) : this.estadoReserva;

    // Solo lectura si llega Activa
    this.soloLecturaTotal = this.estadoReserva === 'Activa';

    // Notificación inicial
    this.notificacion = fila.notificacion === 'Sí' ? 'Sí' : 'No';
    this.fechaNotificacion = this.notificacion === 'Sí'
      ? (this.parseFechaLocal(fila.fechaNotificacion) ?? this.hoyLocal())
      : null;

    // Penalidades
    this.tienePenalidades = !!fila.tienePenalidades || fila.penalidades === 'Sí' || !!fila.penaliza;
    this.montoPenalidad = typeof fila.montoPenalidad === 'number' ? Math.max(0, fila.montoPenalidad) : (this.tienePenalidades ? 50 : 0);

    // Reglas:
    if (!this.soloLecturaTotal) {
      this.aplicarReglas();
    } else {
      // lectura total: bloquear todo y mostrar estado actual
      this.notificacionBloqueada = true;
      this.estadosDisponibles = [this.estadoReserva];
    }

    this.sustento = fila.sustento ?? '';

         // === DEMO: forzar penalidades aquí ===
    this.tienePenalidades = true;           // <--- cambia a false para el otro caso
    this.montoPenalidad   = this.tienePenalidades ? 50 : 0;  // monto demo
    this.aplicarReglas();          // bloquea Notificación y limita Estado si corresponde

    this.cargando = false;
  }

  onNotificacionChange(val: 'Sí' | 'No') {
    if (this.soloLecturaTotal) return;
    this.notificacion = val;
    this.fechaNotificacion = val === 'Sí' ? this.hoyLocal() : null;
  }

  /** Nueva regla: SIEMPRE 3 estados (sin 'Activa'). Penalidades solo bloquea Notificación. */
  private aplicarReglas() {
    // Estado siempre entre estos 3
    this.estadosDisponibles = [...this.ESTADOS_SIN_ACTIVA];

    // Si el estado actual no está en la lista (ej. venía 'Activa'), muévelo a 'Pendiente'
    if (!this.estadosDisponibles.includes(this.estadoReserva)) {
      this.estadoReserva = 'Pendiente';
    }

    // Penalidades: solo afectan Notificación (bloquear), NO la lista de estados
    if (this.tienePenalidades) {
      this.notificacionBloqueada = true;
      this.notificacion = 'No';
      this.fechaNotificacion = null;
    } else {
      this.notificacionBloqueada = false;
    }
  }

  actualizar() {
    if (this.soloLecturaTotal || !this.reservaId) return;

    this.cargando = true;
    const body = {
      estado: this.estadoReserva,
      notificacion: this.notificacion === 'Sí',
      fechaNotificacion: this.fechaNotificacion ? this.toYMD(this.fechaNotificacion) : null,
      sustento: this.sustento?.trim() || null,
      penalidades: this.tienePenalidades,
      montoPenalidad: this.montoPenalidad
    };

    console.log('PATCH demo', { id: this.reservaId, ...body });
    this.cargando = false;
    this.router.navigate(['/reservas']);
  }

  // ==== Fechas (LOCAL) ====
  private parseFechaLocal(s?: string): Date | null {
    if (!s) return null;
    const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (mIso) return new Date(+mIso[1], +mIso[2]-1, +mIso[3], 0,0,0,0);
    const mLat = s.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
    if (mLat) { const yyyy = mLat[3].length===2 ? 2000 + +mLat[3] : +mLat[3]; return new Date(yyyy, +mLat[2]-1, +mLat[1], 0,0,0,0); }
    const dAny = new Date(s); if (!isNaN(dAny.getTime())) return new Date(dAny.getUTCFullYear(), dAny.getUTCMonth(), dAny.getUTCDate(), 0,0,0,0);
    return null;
  }
  private addDays(d: Date, n: number) { const r = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0,0,0,0); r.setDate(r.getDate()+n); return r; }
  private hoyLocal() { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0,0,0,0); }
  private toYMD(d: Date) { const y=d.getFullYear(); const m=(d.getMonth()+1).toString().padStart(2,'0'); const dd=d.getDate().toString().padStart(2,'0'); return `${y}-${m}-${dd}`; }
}
