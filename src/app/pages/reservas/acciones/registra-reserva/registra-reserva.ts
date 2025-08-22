import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  styleUrl: './registra-reserva.css'
})
export class RegistraReserva {
private route = inject(ActivatedRoute);
  private router = inject(Router);
  // private recursosSrv = inject(RecursosService);  // <- si tienes servicio
  // private reservasSrv = inject(ReservasService);  // <- si tienes servicio

  cargando = false;
  error = '';

  // Datos de usuario (pon aquí lo que te dé tu auth)
  usuario = {
    codigo: 'U-0001',
    nombre: 'Nombre Apellido',
    tipo: 'Estudiante / Docente',
    estado: 'Activo'
  };

  recurso?: Recurso;

  fechaReserva = this.isoHoy();
  fechaExpiracion = this.isoMasDias(7);
  estadoReserva = 'Pendiente';

  ngOnInit(): void {
    // 1) Intenta obtener el recurso desde router state
    const st: any = history.state?.recurso;
    if (st) this.recurso = st as Recurso;

    // 2) Si no hay state (p.ej. F5), usa :id y trae desde API
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!this.recurso && id) {
      this.cargando = true;
      // TODO: reemplaza por tu servicio real
      // this.recursosSrv.getById(id).subscribe({
      //   next: r => { this.recurso = r; this.cargando = false; },
      //   error: e => { this.error = e.message ?? 'Error'; this.cargando = false; }
      // });
      setTimeout(() => {
        // demo sin API:
        this.recurso = { id, titulo: 'Título demo', tipo: 'Libro', autor: 'Autor', editorial: 'Editorial' };
        this.cargando = false;
      }, 300);
    }
  }

  guardar() {
    if (!this.recurso) return;
    const dto = {
      recursoId: this.recurso.id,
      fechaReserva: this.fechaReserva,
      fechaExpiracion: this.fechaExpiracion,
      estado: this.estadoReserva,
      usuarioCodigo: this.usuario.codigo
    };

    // TODO: llamar a tu API real
    // this.reservasSrv.crear(dto).subscribe({
    //   next: () => this.router.navigate(['/reservas']),
    //   error: e => this.error = e.message ?? 'Error'
    // });

    console.log('enviar reserva', dto);
    this.router.navigate(['/reservas']);
  }

  private isoHoy() {
    return new Date().toISOString().slice(0,10);
  }
  private isoMasDias(n: number) {
    const d = new Date(); d.setDate(d.getDate() + n);
    return d.toISOString().slice(0,10);
  }
}
