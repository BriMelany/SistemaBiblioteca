// src/app/pages/reservas/reservas.ts
import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservasService } from './data/reservas-service';
import { AuthService, RolBD } from '../../core/auth/auth';
import { ReservaModel } from './model/reserva-model';
import { CatalogoService } from '../../pages/catalogo/data/catalogo-service';

type VistaRol = 'Administrador' | 'Bibliotecario' | 'Usuario';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './reservas.html',
  styleUrls: ['./reservas.css'],
})
export class Reservas implements OnInit {
  private auth = inject(AuthService);
  private reservasService = inject(ReservasService);
  private catalogoService = inject(CatalogoService);
  private router = inject(Router);

  rol: VistaRol = 'Usuario';

  // ================= Propiedades UI =================
  get esBiblioAdmin() { return this.rol === 'Administrador' || this.rol === 'Bibliotecario'; }
  get esUsuario() { return this.rol === 'Usuario'; }

  amodelreserva: ReservaModel[] = [];
  reservasPaginadas: ReservaModel[] = [];
  pageIndex = 1;
  pageSize = 5;
  totalPages = 1;
  pages: number[] = [];

  fechaFiltro: string | null = null;
  estadoFiltro: string | null = null;

  // Modal detalle
  seleccion: ReservaModel | null = null;

  // Modal unificado de acciones
  seleccionAccion: ReservaModel | null = null;
  mostrarAccion = false;
  tipoAccion: 'cancelar' | 'aprobar' | 'rechazar' | null = null;

  // Mensajes
  error: string = '';
  success: string = '';

  // ================= Ciclo de vida =================
  async ngOnInit(): Promise<void> {
    await this.auth.hydrateUser().catch(() => {});
    this.rol = this.mapRol(this.auth.role);
    this.auth.user$.subscribe(u => {
      const nueva = this.mapRol(u?.rol ?? 'ESTUDIANTE');
      if (nueva !== this.rol) this.rol = nueva;
    });
    this.cargarReservas();
  }

  private mapRol(r: RolBD): VistaRol {
    switch (r) {
      case 'ADMINISTRADOR': return 'Administrador';
      case 'BIBLIOTECARIO': return 'Bibliotecario';
      default: return 'Usuario';
    }
  }

  // ================= Helpers UI =================
  codigo(id: number | string): string {
    const n = Number(id) || 0;
    return `RE${n.toString().padStart(3, '0')}`;
  }

  labelEstado(e: string): 'Cumplida' | 'Expirada' | 'Pendiente' | 'Aprobado' | 'Rechazado' | 'Cancelado' {
    switch ((e || '').toLowerCase()) {
      case 'cumplida': return 'Cumplida';
      case 'expirada': return 'Expirada';
      case 'aprobado': return 'Aprobado';
      case 'rechazado': return 'Rechazado';
      case 'cancelado': return 'Cancelado'; // 👈 agregado
      default: return 'Pendiente';
    }
  }

  aplicarPaginacion() {
    const total = this.amodelreserva.length;
    this.totalPages = Math.ceil(total / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.reservasPaginadas = this.amodelreserva.slice(start, end);
  }

  // ================= Carga =================
  cargarReservas(): void {
    this.reservasService.listar().subscribe({
      next: rs => {
        this.amodelreserva = rs ?? [];

        this.catalogoService.listarCatalogo().subscribe(recursos => {
          this.amodelreserva = this.amodelreserva.map(r => {
            const recurso = recursos.find(
              rec => rec.titulo === r.recurso && rec.tipo === r.tipoRecurso
            );
            return {
              ...r,
              portadaUrl: recurso ? recurso.portadaUrl : 'assets/cover-placeholder.png'
            };
          });

          this.aplicarFiltrosYPaginar();
        });
      },
      error: err => {
        console.error('Error cargando reservas', err);
        this.amodelreserva = [];
        this.aplicarFiltrosYPaginar();
      }
    });
  }

  // ================= Acciones =================
  verDetalle(r: ReservaModel): void {
    this.seleccion = r;
    this.mostrarAccion = false;
  }

  abrirAccion(r: ReservaModel, accion: 'cancelar' | 'aprobar' | 'rechazar') {
    this.cerrarTodo();
    this.seleccionAccion = r;
    this.tipoAccion = accion;
    this.mostrarAccion = true;
    this.error = '';
    this.success = '';
  }

  ejecutarAccion() {
    if (!this.seleccionAccion || !this.tipoAccion) return;

    this.error = '';
    this.success = '';

    const id = this.seleccionAccion.id;

    let request$;
    if (this.tipoAccion === 'cancelar') {
      request$ = this.reservasService.cancelarReserva(id);
    } else if (this.tipoAccion === 'aprobar') {
      request$ = this.reservasService.aprobarReserva(id);
    } else {
      request$ = this.reservasService.rechazarReserva(id);
    }

    request$.subscribe({
      next: () => {
        // ✅ actualizar estado local sin esperar al reload
        if (this.seleccionAccion) {
          this.seleccionAccion.estado = this.tipoAccion === 'aprobar'
            ? 'Aprobado'
            : this.tipoAccion === 'rechazar'
              ? 'Rechazado'
              : 'Cancelado';
        }

        this.success = `Reserva ${this.tipoAccion} correctamente.`; 
        this.cargarReservas(); // 👈 por si quieres refrescar toda la lista
        setTimeout(() => this.cerrarTodo(), 1500);
      },
      error: err => this.error = err.error?.mensaje || `Error al ${this.tipoAccion} la reserva.`
    });
  }

  descargar(r: ReservaModel): void {
    this.reservasService.descargarVoucher(r.id).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voucher_${r.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => console.error('Error descargando voucher', err),
    });
  }

  // ================= Filtros y paginación =================
  prev() {
    if (this.pageIndex > 1) {
      this.pageIndex--;
      this.aplicarPaginacion();
    }
  }

  next() {
    if (this.pageIndex < this.totalPages) {
      this.pageIndex++;
      this.aplicarPaginacion();
    }
  }

  goToPage(p: number) {
    this.pageIndex = p;
    this.aplicarPaginacion();
  }

  cambiarFecha(fecha: string) {
    this.fechaFiltro = fecha || null;
    this.aplicarFiltrosYPaginar();
  }

  cambiarEstado(estado: string) {
    this.estadoFiltro = estado || null;
    this.aplicarFiltrosYPaginar();
  }

  abrirCalendario(input: HTMLInputElement) {
    input.showPicker?.();
  }

  aplicarFiltrosYPaginar() {
    let filtradas = [...this.amodelreserva];

    if (this.fechaFiltro) {
      filtradas = filtradas.filter(r => {
        const fechaRes = new Date(r.fechaReserva).toISOString().split('T')[0];
        return fechaRes === this.fechaFiltro;
      });
    }

    if (this.estadoFiltro) {
      filtradas = filtradas.filter(r => (r.estado || '').toLowerCase() === this.estadoFiltro!.toLowerCase());
    }

    this.pageIndex = 1;
    this.totalPages = Math.ceil(filtradas.length / this.pageSize);
    this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

    const start = (this.pageIndex - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.reservasPaginadas = filtradas.slice(start, end);
  }

  // ================= UX =================
  trackByReservaId = (_: number, r: any) => r?.id ?? _;

  @HostListener('document:keydown.escape')
  onEsc(): void { this.cerrarTodo(); }

  cerrarTodo(): void {
    this.seleccion = null;
    this.seleccionAccion = null;
    this.mostrarAccion = false;
    this.tipoAccion = null;
    this.error = '';
    this.success = '';
  }
}
