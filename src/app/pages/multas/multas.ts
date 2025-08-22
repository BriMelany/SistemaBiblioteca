import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

type EstadoMulta = 'Pendiente' | 'Pagada' | 'Condonada';
type EstadoFiltro = 'Todas' | EstadoMulta;
type Rol = 'Bibliotecario' | 'Administrador';

interface Multa {
  id: number;
  codigo: string;
  usuario: string;
  codPrestamo: string;
  monto: number;
  fechaGeneracion: string; // 'yyyy-MM-dd' o ISO
  diasRetraso: number;
  estado: EstadoMulta;
}

@Component({
  selector: 'app-multas',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, RouterLink],
  templateUrl: './multas.html',
  styleUrl: './multas.css'
})
export class Multas {
  rol: 'Bibliotecario' | 'Administrador' = 'Administrador';
  termino = '';
  estadoSel: 'Todas' | 'Pendiente' | 'Pagada' | 'Condonada' = 'Pendiente';
  pageIndex = 1;
  pageSize = 6;

  // Demo de datos (reemplaza por tu API)
  lista: Multa[] = [
    { id:1,  codigo:'M001', usuario:'Nombre de usuario 1',  codPrestamo:'PRE001', monto:15, fechaGeneracion:'2025-08-01', diasRetraso:4, estado:'Pendiente' },
    { id:2,  codigo:'M002', usuario:'Nombre de usuario 2',  codPrestamo:'PRE002', monto:15, fechaGeneracion:'2025-08-02', diasRetraso:3, estado:'Pendiente' },
    { id:3,  codigo:'M003', usuario:'Nombre de usuario 3',  codPrestamo:'PRE003', monto:15, fechaGeneracion:'2025-08-03', diasRetraso:1, estado:'Pagada' },
    { id:4,  codigo:'M004', usuario:'Nombre de usuario 4',  codPrestamo:'PRE004', monto:15, fechaGeneracion:'2025-08-04', diasRetraso:1, estado:'Condonada' },
    { id:5,  codigo:'M005', usuario:'Nombre de usuario 5',  codPrestamo:'PRE005', monto:15, fechaGeneracion:'2025-08-05', diasRetraso:1, estado:'Pendiente' },
    { id:6,  codigo:'M006', usuario:'Nombre de usuario 6',  codPrestamo:'PRE006', monto:15, fechaGeneracion:'2025-08-06', diasRetraso:1, estado:'Pendiente' },
    { id:7,  codigo:'M007', usuario:'Nombre de usuario 7',  codPrestamo:'PRE007', monto:15, fechaGeneracion:'2025-08-07', diasRetraso:1, estado:'Pendiente' },
    { id:8,  codigo:'M008', usuario:'Nombre de usuario 8',  codPrestamo:'PRE008', monto:15, fechaGeneracion:'2025-08-08', diasRetraso:2, estado:'Pendiente' },
    { id:9,  codigo:'M009', usuario:'Nombre de usuario 9',  codPrestamo:'PRE009', monto:15, fechaGeneracion:'2025-08-09', diasRetraso:1, estado:'Pendiente' },
    { id:10, codigo:'M010', usuario:'Nombre de usuario 10', codPrestamo:'PRE010', monto:15, fechaGeneracion:'2025-08-10', diasRetraso:5, estado:'Pendiente' },
    { id:11, codigo:'M011', usuario:'Nombre de usuario 11', codPrestamo:'PRE011', monto:15, fechaGeneracion:'2025-08-11', diasRetraso:1, estado:'Pendiente' },
  ];

  // Base filtrada (sin paginar)
  get baseFiltrada(): Multa[] {
    let arr = this.lista;

    if (this.estadoSel !== 'Todas') {
      arr = arr.filter(m => m.estado === this.estadoSel);
    }

    const t = this.termino.trim().toLowerCase();
    if (t) {
      arr = arr.filter(m =>
        m.codigo.toLowerCase().includes(t) ||
        m.usuario.toLowerCase().includes(t)
      );
    }
    return arr;
  }

  // Paginación
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
  prev()      { if (this.pageIndex > 1) this.pageIndex--; }
  next()      { if (this.pageIndex < this.totalPages) this.pageIndex++; }
  goToPage(p: number) { this.pageIndex = p; }

  // Acciones habilitadas
  puedePagar(m: Multa)    { return m.estado === 'Pendiente'; }
  puedeCondonar(m: Multa) { return this.rol === 'Administrador' && m.estado === 'Pendiente'; }

  // Acciones
  verDetalle(m: Multa) { alert(`Detalle de ${m.codigo} (demo)`); }

// ==== MODAL: estado y helpers ====
  modalAbierto = false;
  modalTipo: 'pago' | 'condonacion' | '' = '';
  sel: Multa | null = null;

  abrirPago(m: Multa){
    if (!this.puedePagar(m)) return;
    this.sel = m;
    this.modalTipo = 'pago';
    this.modalAbierto = true;
  }
  abrirCondonacion(m: Multa){
    if (!this.puedeCondonar(m)) return;
    this.sel = m;
    this.modalTipo = 'condonacion';
    this.modalAbierto = true;
  }
  cerrarModal(){
    this.modalAbierto = false;
    this.modalTipo = '';
    this.sel = null;
  }

  // Confirmar acciones (puedes conectar PATCH real aquí)
  confirmarModal(){
    if (!this.sel) return;
    if (this.modalTipo === 'pago'){
      // TODO: PATCH real
      this.sel.estado = 'Pagada';
    } else if (this.modalTipo === 'condonacion'){
      // TODO: PATCH real
      this.sel.estado = 'Condonada';
    }
    this.cerrarModal();
  }
}
