import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth';
import { ReservasService } from '../../data/reservas-service';
import { firstValueFrom } from 'rxjs';


type Recurso = {
  id: number;
  titulo: string;
  tipo: string;
  autor?: string;
  editorial?: string;
  portadaUrl?: string;
};

@Component({
  selector: 'app-registra-reserva',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './registra-reserva.html',
  styleUrls: ['./registra-reserva.css']
})
export class RegistraReserva {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);
  private reservasSrv = inject(ReservasService);

  // --- estado ---
  cargando = false;
  error = '';
  usuario = { codigo: '', nombre: '', tipo: '', estado: '' };
  recurso?: Recurso;

  fechaReserva = this.isoHoy();
  fechaExpiracion = this.isoMasDias(7);
  estadoReserva: 'Pendiente'|'Expirada'|'Cumplida' = 'Pendiente';

  async ngOnInit(): Promise<void> {
    // Asegura que el usuario esté logueado y disponible
    await this.auth.hydrateUser().catch(() => {});
    const userId = Number(this.auth.currentUser?.id ?? 0);
    if (!userId) { this.error = 'Sesión no válida.'; return; }

    // Obtiene ID del recurso desde state, paramMap o queryParam
    const recursoId = this.resolveRecursoId();
    if (!recursoId) { this.error = 'No se seleccionó un recurso.'; return; }

    console.log('ID Recurso detectado:', recursoId);
    console.log('Usuario logueado:', this.auth.currentUser);
    console.log('ID Usuario detectado:', userId);
    console.log('Token actual:', this.auth.token);

    // Asignar datos al formulario (solo lectura)
    this.usuario = {
      codigo: this.auth.currentUser?.usuario ?? String(userId),
      nombre: this.auth.currentUser?.nombreCompleto ?? '',
      tipo: this.auth.currentUser?.rol ?? '',
      estado: ''
    };
  // --- Recurso ---
  const estadoReserva = await firstValueFrom(this.reservasSrv.previsualizarPorListar(userId, recursoId));
  this.recurso = {
  id: recursoId,
  titulo: history.state?.recurso?.titulo ?? estadoReserva?.recurso ?? '',
  tipo: history.state?.recurso?.tipo ?? estadoReserva?.tipoRecurso ?? '',
  autor: estadoReserva?.autor ?? history.state?.recurso?.autor ?? '',
  editorial: estadoReserva?.editorial ?? history.state?.recurso?.editorial ?? '',
  portadaUrl: estadoReserva?.portadaUrl ?? history.state?.recurso?.portadaUrl ?? ''
};


  this.fechaReserva = estadoReserva?.fechaReserva ?? this.isoHoy();
  this.fechaExpiracion = estadoReserva?.fechaExpiracion ?? this.isoMasDias(7);
  this.estadoReserva = this.toUiEstado(estadoReserva?.estado?? 'Pendiente');
  console.log('Respuesta API recurso:', estadoReserva);
}

  // Resolver ID recurso
  private resolveRecursoId(): number {
    const st: any = history.state ?? {};
    const fromState = st.recurso?.id;               // navegación desde catálogo
    const paramId = this.route.snapshot.paramMap.get('id'); // /registra-reserva/:id
    const qId = this.route.snapshot.queryParamMap.get('id'); // ?id=...
    return Number(fromState ?? paramId ?? qId ?? 0);
  }

guardar() {
  const userId = Number(this.auth.currentUser?.id);
  if (!userId) { 
    this.error = 'Sesión no válida.'; 
    return; 
  }

  if (!this.recurso) {
    this.error = 'No hay recurso seleccionado.';
    return;
  }

  this.reservasSrv.crearReserva(this.recurso.id, userId).subscribe({
    next: () => this.router.navigate(['/reservas']),
    error: (e) => {
      this.error = e.error?.mensaje || 'No se pudo registrar la reserva.';
      console.error(e);
    }
  });
}

showModal() {
  const modal = document.getElementById('errorModal');
  if (modal) modal.style.display = 'flex'; // tu modal centrado con CSS
}

  // helpers
  private isoHoy() { return new Date().toISOString().slice(0,10); }
  private isoMasDias(n: number) { const d = new Date(); d.setDate(d.getDate()+n); return d.toISOString().slice(0,10); }
  private toUiEstado(api: string): 'Pendiente'|'Expirada'|'Cumplida' {
    switch ((api || '').toLowerCase()) {
      case 'expirada': return 'Expirada';
      case 'cumplida': return 'Cumplida';
      default: return 'Pendiente';
    }
  }
}
