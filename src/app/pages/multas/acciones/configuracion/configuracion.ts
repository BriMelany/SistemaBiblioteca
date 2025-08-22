import { Component, inject  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type Rol = 'Estudiante' | 'Profesor';
type ToastType = 'ok' | 'err';

interface ItemConfig {
  id: number;
  rol: Rol;
  tipoRecurso: string;
  montoDia: number;   // S/.
  diasMax: number;    // días
}

@Component({
  selector: 'app-multas-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuracion.html',
  styleUrl: './configuracion.css'
})
export class Configuracion {
  private router = inject(Router);
  // Opciones (puedes poblar desde API)
  roles: Rol[] = ['Estudiante', 'Profesor'];
  tiposRecurso = ['Libro', 'Revista', 'DVD', 'Atlas'];

  // Formulario
  form: ItemConfig = { id: 0, rol: 'Estudiante', tipoRecurso: '', montoDia: 0, diasMax: 0 };
  editId: number | null = null;

  // Lista (demo inicial)
  lista: ItemConfig[] = [
    { id: 1, rol: 'Estudiante', tipoRecurso: 'Libro',   montoDia: 2, diasMax: 7 },
    { id: 2, rol: 'Estudiante', tipoRecurso: 'Revista', montoDia: 2, diasMax: 4 },
    { id: 3, rol: 'Profesor',   tipoRecurso: 'Libro',   montoDia: 2, diasMax: 6 },
    { id: 4, rol: 'Profesor',   tipoRecurso: 'DVD',     montoDia: 2, diasMax: 6 },
    { id: 5, rol: 'Profesor',   tipoRecurso: 'Atlas',   montoDia: 2, diasMax: 4 },
  ];

  // Modal eliminar
  showDelete = false;
  toDelete: ItemConfig | null = null;

  // === Helpers ===
  get btnLabel() { return this.editId ? 'Actualizar' : 'Crear'; }
  get isValid() {
    return !!this.form.tipoRecurso && this.form.montoDia > 0 && this.form.diasMax >= 0;
  }
  montoMax(item: ItemConfig) { return item.montoDia * item.diasMax; }

  resetForm() {
    this.form = { id: 0, rol: 'Estudiante', tipoRecurso: '', montoDia: 0, diasMax: 0 };
    this.editId = null;
  }
// --- Paginación ---
  pageSize = 5;
  pageIndex = 1;

  get totalPages() {
    return Math.max(1, Math.ceil(this.lista.length / this.pageSize));
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get paginada() {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.lista.slice(start, start + this.pageSize);
  }
  goToPage(p: number) {
    this.pageIndex = Math.min(Math.max(1, p), this.totalPages);
  }
  next() { this.goToPage(this.pageIndex + 1); }
  prev() { this.goToPage(this.pageIndex - 1); }

  // --- TOAST ---
  toast = { show: false, text: '', type: 'ok' as ToastType };
  private toastTimer: any;

  private showToast(msg: string, type: ToastType = 'ok', ms = 2800) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast = { show: true, text: msg, type };
    this.toastTimer = setTimeout(() => this.toast.show = false, ms);
  }
  hideToast() {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toast.show = false;
  }

  // Helper para formatear el código como M00X/M0XX/MXXX
  private codeFrom(id: number) {
    return `M${String(id).padStart(3, '0')}`;
  }

crearActualizar() {
    if (!this.isValid) return;

    if (this.editId) {
      const i = this.lista.findIndex(x => x.id === this.editId);
      if (i >= 0) {
        this.lista[i] = { ...this.form, id: this.editId };
        this.showToast(`Registro ${this.codeFrom(this.editId)} actualizado correctamente`, 'ok');
      }
    } else {
      const nextId = this.lista.length ? Math.max(...this.lista.map(x => x.id)) + 1 : 1;
      this.lista.unshift({ ...this.form, id: nextId });
      this.pageIndex = 1; // ver el nuevo en la primera página
      this.showToast(`Registro ${this.codeFrom(nextId)} creado correctamente`, 'ok');
    }
    this.resetForm();
  }

  editar(item: ItemConfig) {
    this.editId = item.id;
    this.form = { ...item };
    // scroll suave hacia el formulario (opcional)
    document.querySelector('.cfg-wrap')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  pedirEliminar(item: ItemConfig) {
    this.toDelete = item;
    this.showDelete = true;
  }
  cerrarModal() {
    this.showDelete = false;
    this.toDelete = null;
  }
  volver() {this.router.navigate(['/multas']);}

   confirmarEliminar() {
    if (!this.toDelete) return;
    const deletedId = this.toDelete.id;
    this.lista = this.lista.filter(x => x.id !== deletedId);
    this.cerrarModal();
    if (this.editId === deletedId) this.resetForm();
    if ((this.pageIndex - 1) * this.pageSize >= this.lista.length) this.goToPage(this.pageIndex - 1);
    this.showToast(`Registro ${this.codeFrom(deletedId)} eliminado`, 'ok');
  }
  
}
