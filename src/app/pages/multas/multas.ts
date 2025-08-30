import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MultasService } from './data/multas-service';
import { Multa } from './model/multa-model';

type EstadoMulta = 'Pendiente' | 'Pagada' | 'Condonada';
type EstadoFiltro = 'Todas' | EstadoMulta;
type Rol = 'Bibliotecario' | 'Administrador';

@Component({
  selector: 'app-multas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './multas.html',
  styleUrls: ['./multas.css']
})
export class Multas implements OnInit {
  private srv = inject(MultasService);

  rol: Rol = 'Administrador';
  termino = '';
  estadoSel: EstadoFiltro = 'Todas';
  pageIndex = 1;
  pageSize = 6;

  lista: Multa[] = [];
  cargando = false;
  modalVerAbierto = false;
  selVer: Multa | null = null;
  mensaje: string = '';

  // ==== MODAL ====
  modalAbierto = false;
  modalTipo: 'pago' | 'condonacion' | '' = '';
  sel: Multa | null = null;

  ngOnInit() {
    this.cargarMultas();
  }

  // === Cargar desde API ===
cargarMultas() {
  this.cargando = true;
  this.srv.listar().subscribe({
    next: data => {
      // Map directo, sin renombrar
      this.lista = data.map(d => ({
        prestamoId: d.prestamoId,
        estado: this.formatearEstado(d.estado), // opcional si quieres normalizar
        motivo: d.motivo,
        monto: d.monto,
        fechaGeneracion: d.fechaGeneracion,
        usuarioDocumento: d.usuarioDocumento,
        multaId: d.multaId,
        usuarioId: d.usuarioId,
        usuarioNombre: d.usuarioNombre,
        fechaPago: d.fechaPago,
        diasRetraso: d.diasRetraso
      }));
      this.cargando = false;
    },
    error: e => {
      console.error('Error al cargar multas', e);
      this.cargando = false;
    }
  });
}
recargarTabla(): void {
  this.srv.generarMultasRetraso().subscribe({
    next: () => {
      this.mensaje = 'Tabla recargada correctamente';
      this.cargarMultas();
    },
    error: (err) => {
      console.error('Error recargando tabla', err);
      this.mensaje = 'Error al recargar la tabla';
    }
  });
}
formatearEstado(e: string): 'Pendiente' | 'Pagada' | 'Condonada' {
  switch(e.toLowerCase()) {
    case 'pagada': return 'Pagada';
    case 'condonada': return 'Condonada';
    default: return 'Pendiente';
  }
}
get baseFiltrada(): Multa[] {
  let arr = this.lista;

  if (this.estadoSel !== 'Todas') {
    arr = arr.filter(m => m.estado === this.estadoSel);
  }

  const t = this.termino.trim().toLowerCase();
  if (t) {
    arr = arr.filter(m =>
      String(m.multaId).toLowerCase().includes(t) ||
      m.usuarioNombre.toLowerCase().includes(t)
    );
  }

  return arr;
}
  // === Paginación ===
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.baseFiltrada.length / this.pageSize));
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get filtrada(): Multa[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.baseFiltrada.slice(start, start + this.pageSize);
  }

  resetPage() { this.pageIndex = 1; }
  prev() { if (this.pageIndex > 1) this.pageIndex--; }
  next() { if (this.pageIndex < this.totalPages) this.pageIndex++; }
  goToPage(p: number) { this.pageIndex = p; }

  // === Acciones habilitadas ===
  puedePagar(m: Multa) { return m.estado === 'Pendiente'; }
  puedeCondonar(m: Multa) { return this.rol === 'Administrador' && m.estado === 'Pendiente'; }

  // === Modal ===
  abrirPago(m: Multa) {
    if (!this.puedePagar(m)) return;
    this.sel = m;
    this.modalTipo = 'pago';
    this.modalAbierto = true;
  }

  abrirCondonacion(m: Multa) {
    if (!this.puedeCondonar(m)) return;
    this.sel = m;
    this.modalTipo = 'condonacion';
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
    this.modalTipo = '';
    this.sel = null;
  }

  // === Confirmar acciones con API real ===
  confirmarModal() {
    if (!this.sel) return;

    const accion$ = this.modalTipo === 'pago'
      ? this.srv.pagar(this.sel.multaId)
      : this.srv.condonar(this.sel.multaId);

    accion$.subscribe({
      next: () => {
        this.sel!.estado = this.modalTipo === 'pago' ? 'Pagada' : 'Condonada';
        this.cerrarModal();
      },
      error: e => {
        console.error('Error al actualizar multa', e);
      }
    });
  }

verDetalle(m: Multa) {
  this.selVer = m;
  this.modalVerAbierto = true;
}

cerrarModalVer() {
  this.modalVerAbierto = false;
  this.selVer = null;
}

}
