import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ReservasService } from '../../data/reservas-service';
import { ReservaModel } from '../../model/reserva-model';
import { ReservaUpdate } from '../../model/reserva-update.dto';
import { ReservaDetalle } from '../../model/reserva-detalle';
import { AuthService, SessionUser, RolBD } from '../../../../core/auth/auth';
import { take } from 'rxjs/operators';

type Estado = 'Cumplida' | 'Expirada' | 'Pendiente';

interface Usuario {
  codigo: string; nombre: string; tipo: string; estado: string;
}
interface Recurso {
  portadaUrl?: string; tipo?: string; titulo?: string; autor?: string; editorial?: string;
}

@Component({
  selector: 'app-actualiza-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, DatePipe],
  templateUrl: './actualiza-reserva.html',
  styleUrls: ['./actualiza-reserva.css']
})
export class ActualizaReserva {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private srv   = inject(ReservasService);
  private auth = inject(AuthService);
  private me: SessionUser | null = null;

  cargando = true;
  error = '';

  reservaId = 0;
  reservaCodigo = '';

  usuario: Usuario = { codigo: '—', nombre: '—', tipo: '—', estado: '—' };
  recurso: Recurso = { portadaUrl: '', tipo: '', titulo: '', autor: '', editorial: '' };

  fechaReserva: Date | null = null;
  fechaExpiracion: Date | null = null;

  tienePenalidades = false;
  montoPenalidad = 0;

  get resultadoPenalidadTexto() {
    return this.tienePenalidades ? 'Presenta penalidades' : 'No presenta penalidades';
  }

  notificacion: 'Sí' | 'No' = 'No';
  notificacionBloqueada = false;
  fechaNotificacion: Date | null = null;
  estadoReserva: Estado = 'Pendiente';
  sustento = '';
  notificadoPor = '';

  readonly ESTADOS_TODOS: Estado[] = ['Cumplida', 'Expirada', 'Pendiente'];
  estadosDisponibles: Estado[] = [...this.ESTADOS_TODOS];
  opcionesNotificacion: Array<'Sí'|'No'> = ['No', 'Sí'];

  soloLecturaTotal = false;
  prioridad = '001 (Orden en la lista de espera)';

  ngOnInit() {
    this.auth.hydrateUser().catch(() => {});
    this.auth.user$.pipe(take(1)).subscribe(u => this.me = u ?? null);
    const st = (history.state as { reserva?: any } | undefined)?.reserva;
    const id = Number(this.route.snapshot.paramMap.get('id') || 0);

    if (st) {
      this.mountFromAny(st);
      this.cargando = false;
      return;
    }
    if (id > 0) {
      this.srv.getDetalle(id).subscribe({
        next: (det: any) => {
          const first = Array.isArray(det) ? det[0] : det;
          this.mountFromAny(first);
          this.cargando = false;
        },
        error: () => {
          this.error = 'No se pudo cargar la reserva.';
          this.cargando = false;
        }
      });
      return;
    }
    this.error = 'No se recibieron datos de la reserva.';
    this.cargando = false;
  }

  private mapRolUi(r?: RolBD | string): string {
    switch ((r ?? '').toString().toUpperCase()) {
      case 'ADMINISTRADOR': return 'Administrador';
      case 'BIBLIOTECARIO': return 'Bibliotecario';
      case 'PROFESOR':      return 'Usuario';
      case 'ESTUDIANTE':    return 'Usuario';
      default:              return 'Usuario';
    }
  }

  private fillUsuario(row: any) {
    const uNombre  = row?.usuarioNombre ?? row?.usuario ?? this.me?.nombreCompleto ?? '—';
    const uCodigo  = row?.usuarioCodigo ?? row?.usuarioId ?? this.me?.usuario ?? String(this.me?.id ?? '—');
    const uRolSrc  = row?.usuarioRol ?? this.me?.rol;
    const uEstado  = row?.usuarioEstado ?? '—';

    this.usuario = {
      nombre: uNombre,
      codigo: String(uCodigo),
      tipo: this.mapRolUi(uRolSrc),
      estado: uEstado
    };
  }

  /** Normaliza ReservaDetalle | ReservaModel a un solo shape */
private mountFromAny(row: ReservaModel | ReservaDetalle | any) {
  const isApiShape = 'reservaId' in row;
  const normalizado: ReservaModel = isApiShape
    ? {
        id: row.reservaId,
        recurso: row.tituloRecurso,
        tipoRecurso: row.tipoRecursoNombre,
        fecha: row.fechaReserva,
        expiracion: row.fechaExpiracion,
        estado: row.estado,
        usuario: row.usuario,
        notificado: row.notificado,
        notificadoPor: row.notificadoPor ?? '',
      }
    : row;

  this.reservaId = normalizado.id;
  this.reservaCodigo = this.codigo(normalizado.id);

  // Datos parciales del recurso
  this.recurso = {
    tipo: normalizado.tipoRecurso,
    titulo: normalizado.recurso,
    portadaUrl: (row as any).portadaUrl ?? '',
    autor: '',
    editorial: ''
  };

  // Traer autor/editorial de otra API si no vienen
  if (!(row as any).autor && !(row as any).editorial && (row as any).recursoId) {
    this.srv.getRecurso((row as any).recursoId).subscribe({
      next: (res: any) => {
        this.recurso.autor = res.autor ?? '';
        this.recurso.editorial = res.editorial ?? '';
      },
      error: () => {
        this.recurso.autor = '';
        this.recurso.editorial = '';
      }
    });
  }

  this.fillUsuario(row);

  this.fechaReserva = this.parseFechaLocal(normalizado.fechaReserva);
  this.fechaExpiracion = this.parseFechaLocal(normalizado.fechaExpiracion);
  this.estadoReserva = this.mapEstadoUi(normalizado.estado);
  this.notificacion = normalizado.notificado ? 'Sí' : 'No';
  this.fechaNotificacion = (row as any).fechaNotificacion
    ? this.parseFechaLocal((row as any).fechaNotificacion)
    : null;

  this.tienePenalidades = false;
  this.montoPenalidad = 0;

  this.soloLecturaTotal = this.estadoReserva === 'Cumplida';
  if (!this.soloLecturaTotal) {
    this.aplicarReglas();
  } else {
    this.notificacionBloqueada = true;
    this.estadosDisponibles = [this.estadoReserva];
  }
}

  onNotificacionChange(val: 'Sí' | 'No') {
    if (this.soloLecturaTotal) return;
    this.notificacion = val;
    this.fechaNotificacion = val === 'Sí' ? this.hoyLocal() : null;
  }

  private aplicarReglas() {
    this.estadosDisponibles = [...this.ESTADOS_TODOS];
    if (!this.estadosDisponibles.includes(this.estadoReserva)) {
      this.estadoReserva = 'Pendiente';
    }

    if (this.tienePenalidades) {
      this.notificacionBloqueada = true;
      this.notificacion = 'No';
      this.fechaNotificacion = null;
    } else {
      this.notificacionBloqueada = false;
    }
  }

  private mapEstadoUi(e: string): Estado {
    switch ((e || '').toLowerCase()) {
      case 'cumplida': return 'Cumplida';
      case 'expirada': return 'Expirada';
      case 'pendiente':
      default:          return 'Pendiente';
    }
  }
  private toApiEstado(e: Estado): 'cumplida' | 'expirada' | 'pendiente' {
    switch (e) {
      case 'Cumplida': return 'cumplida';
      case 'Expirada': return 'expirada';
      default:         return 'pendiente';
    }
  }

  codigo(id: number | string): string {
    const n = Number(id) || 0;
    return `RE${n.toString().padStart(3, '0')}`;
  }

  private parseFechaLocal(s?: string): Date | null {
    if (!s) return null;
    const mIso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (mIso) return new Date(+mIso[1], +mIso[2] - 1, +mIso[3], 0, 0, 0, 0);
    const mLat = s.match(/^(\d{2})\/(\d{2})\/(\d{2}|\d{4})$/);
    if (mLat) {
      const yyyy = mLat[3].length === 2 ? 2000 + +mLat[3] : +mLat[3];
      return new Date(yyyy, +mLat[2] - 1, +mLat[1], 0, 0, 0, 0);
    }
    const dAny = new Date(s);
    if (!isNaN(dAny.getTime()))
      return new Date(dAny.getUTCFullYear(), dAny.getUTCMonth(), dAny.getUTCDate(), 0, 0, 0, 0);
    return null;
  }

  private addDays(d: Date, n: number) {
    const r = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    r.setDate(r.getDate() + n);
    return r;
  }
  private hoyLocal() {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate(), 0, 0, 0, 0);
  }
  private toYMD(d: Date) {
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}
