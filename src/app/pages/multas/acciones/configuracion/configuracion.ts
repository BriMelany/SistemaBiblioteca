import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type Rol = 'Estudiante' | 'Profesor';
type ToastType = 'ok' | 'err';

interface ItemConfig {
  id: number;
  rol: Rol;
  tipoRecurso: string;
  montoDia: number;
  diasMax: number;
}

@Component({
  selector: 'app-multas-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion implements OnInit {
  private router = inject(Router);

  roles: Rol[] = ['Estudiante', 'Profesor'];
  tiposRecurso: string[] = ['Libro', 'Revista', 'DVD', 'Atlas'];

  form: ItemConfig = { id: 0, rol: 'Estudiante', tipoRecurso: '', montoDia: 0, diasMax: 0 };
  editId: number | null = null;

  lista: ItemConfig[] = [];

  // Modal eliminar
  showDelete = false;
  toDelete: ItemConfig | null = null;

  // Paginación
  pageSize = 5;
  pageIndex = 1;

  // TOAST
  toast = { show: false, text: '', type: 'ok' as ToastType };
  private toastTimer: any;

  ngOnInit() {
    // Inicializar lista vacía para probar agregar
    this.lista = [];
  }

  get btnLabel() { return this.editId ? 'Actualizar' : 'Crear'; }
  get isValid() { return !!this.form.tipoRecurso && this.form.montoDia > 0 && this.form.diasMax >= 0; }

  get totalPages() { return Math.max(1, Math.ceil(this.lista.length / this.pageSize)); }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get paginada() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.lista.slice(start, start + this.pageSize);
  }

  goToPage(p: number) { this.pageIndex = Math.min(Math.max(1, p), this.totalPages); }
  next() { this.goToPage(this.pageIndex + 1); }
  prev() { this.goToPage(this.pageIndex - 1); }
montoMax(item: ItemConfig) {
  return item.montoDia * item.diasMax;
}

  resetForm() { this.form = { id: 0, rol: 'Estudiante', tipoRecurso: '', montoDia: 0, diasMax: 0 }; this.editId = null; }

  private codeFrom(id: number) { return `M${String(id).padStart(3, '0')}`; }

  showToast(msg: string, type: ToastType = 'ok', ms = 2800) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { show: true, text: msg, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, ms);
  }
  hideToast() { if (this.toastTimer) clearTimeout(this.toastTimer); this.toast.show = false; }

  crearActualizar() {
    if (!this.isValid) return;
    if (this.editId) {
      const i = this.lista.findIndex(x => x.id === this.editId);
      if (i >= 0) this.lista[i] = { ...this.form, id: this.editId };
      this.showToast(`Registro ${this.codeFrom(this.editId!)} actualizado correctamente`);
    } else {
      const nextId = this.lista.length ? Math.max(...this.lista.map(x => x.id)) + 1 : 1;
      this.lista.unshift({ ...this.form, id: nextId });
      this.pageIndex = 1;
      this.showToast(`Registro ${this.codeFrom(nextId)} creado correctamente`);
    }
    this.resetForm();
  }

  editar(item: ItemConfig) { this.editId = item.id; this.form = { ...item }; }
  pedirEliminar(item: ItemConfig) { this.toDelete = item; this.showDelete = true; }
  cerrarModal() { this.showDelete = false; this.toDelete = null; }

  confirmarEliminar() {
    if (!this.toDelete) return;
    const deletedId = this.toDelete.id;
    this.lista = this.lista.filter(x => x.id !== deletedId);
    if (this.editId === deletedId) this.resetForm();
    if ((this.pageIndex - 1) * this.pageSize >= this.lista.length) this.goToPage(this.pageIndex - 1);
    this.cerrarModal();
    this.showToast(`Registro ${this.codeFrom(deletedId)} eliminado`);
  }

  volver() { this.router.navigate(['/multas']); }
}
