import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

type Rol = 'Administrador' | 'Bibliotecario';
type EstadoCuenta = 'Activo' | 'Bloqueo temporal';
type EstadoContrasena = 'Activa' | 'Caducado';

interface UsuarioRow {
  id: number;
  documento: string;
  nombre: string;
  rol: string;                   // etiqueta de la tabla (Rol1/Rol2) solo visual
  telefono: string;
  direccion: string;
  passwordEstado: EstadoContrasena;
  estadoCuenta: EstadoCuenta;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.css',
})
export class Usuarios {
  // Perfil que visualiza la página (demo)
  rol: Rol = 'Administrador';
  get canCreate() { return this.rol === 'Administrador'; }

  private router = inject(Router);

  // Demo de datos
  rows: UsuarioRow[] = [
    { id:1, documento:'12345678', nombre:'Nombre completo 1', rol:'Rol1', telefono:'999-999-999', direccion:'Dirección 1', passwordEstado:'Activa',   estadoCuenta:'Activo' },
    { id:2, documento:'22245678', nombre:'Nombre completo 2', rol:'Rol2', telefono:'999-999-999', direccion:'Dirección 2', passwordEstado:'Caducado', estadoCuenta:'Activo' },
    { id:3, documento:'33345678', nombre:'Nombre completo 3', rol:'Rol2', telefono:'999-999-999', direccion:'Dirección 3', passwordEstado:'Caducado', estadoCuenta:'Bloqueo temporal' },
    { id:4, documento:'44445678', nombre:'Nombre completo 4', rol:'Rol2', telefono:'999-999-999', direccion:'Dirección 4', passwordEstado:'Activa',   estadoCuenta:'Activo' },
    { id:5, documento:'55545678', nombre:'Nombre completo 5', rol:'Rol1', telefono:'999-999-999', direccion:'Dirección 5', passwordEstado:'Activa',   estadoCuenta:'Activo' },
    { id:6, documento:'66666678', nombre:'Nombre completo 6', rol:'Rol2', telefono:'999-999-999', direccion:'Dirección 6', passwordEstado:'Activa',   estadoCuenta:'Activo' },
    { id:7, documento:'77777778', nombre:'Nombre completo 7', rol:'Rol1', telefono:'999-999-999', direccion:'Dirección 7', passwordEstado:'Activa',   estadoCuenta:'Bloqueo temporal' },
    { id:8, documento:'12322228', nombre:'Nombre completo 8', rol:'Rol1', telefono:'999-999-999', direccion:'Dirección 8', passwordEstado:'Activa',   estadoCuenta:'Activo' },
  ];

  // -------- Buscador --------
  termino = '';

  // -------- Paginación --------
  pageSize = 6;
  pageIndex = 1;

  get filtrada(): UsuarioRow[] {
    const t = this.termino.trim().toLowerCase();
    if (!t) return this.rows;
    return this.rows.filter(r =>
      r.nombre.toLowerCase().includes(t) || r.documento.includes(t)
    );
  }
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtrada.length / this.pageSize));
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  get paginada(): UsuarioRow[] {
    const start = (this.pageIndex - 1) * this.pageSize;
    return this.filtrada.slice(start, start + this.pageSize);
  }
  resetPage() { this.pageIndex = 1; }
  goToPage(p: number) { this.pageIndex = Math.min(Math.max(1, p), this.totalPages); }
  next() { this.goToPage(this.pageIndex + 1); }
  prev() { this.goToPage(this.pageIndex - 1); }

  // -------- Helpers UI --------
  estadoBadgeClass(estado: string) {
    const s = (estado || '').trim().toLowerCase();
    return s === 'activo' ? 'is-activo'
         : s === 'bloqueo temporal' ? 'is-bloq'
         : '';
  }

  // -------- Modales / acciones --------
  sel: UsuarioRow | null = null;
  modalBloquear = false;
  modalEliminar = false;

  abrirBloqueo(r: UsuarioRow) { this.sel = r; this.modalBloquear = true; this.modalEliminar = false; }
  abrirEliminar(r: UsuarioRow) { this.sel = r; this.modalEliminar = true; this.modalBloquear = false; }
  cerrarModales() { this.modalBloquear = this.modalEliminar = false; this.sel = null; }

  confirmarBloqueo() {
    if (!this.sel) return;
    this.sel.estadoCuenta = this.sel.estadoCuenta === 'Activo' ? 'Bloqueo temporal' : 'Activo';
    this.cerrarModales();
  }

  confirmarEliminar() {
    if (!this.sel) return;
    const id = this.sel.id;
    this.rows = this.rows.filter(r => r.id !== id);
    this.cerrarModales();
    // Ajustar paginación si se vacía la página actual
    if ((this.pageIndex - 1) * this.pageSize >= this.filtrada.length) {
      this.goToPage(this.pageIndex - 1);
    }
  }

  // -------- Editar: navega con state al formulario --------
  editar(r: UsuarioRow) {
    // Mapeo mínimo a lo que espera EditarUsuario. Campos que no tengas quedarán por defecto.
    const user = {
      id: String(r.id),
      tipoDocumento: 'DNI' as const,
      documento: r.documento,
      nombre: r.nombre,
      apePaterno: '',
      apeMaterno: '',
      direccion: r.direccion,
      telefono: r.telefono,
      email: '',
      username: '',
      // El campo 'rol' del listado es solo etiqueta (Rol1/Rol2); el form asigna 'Usuario' por defecto.
      // Si necesitas diferenciar, ajusta aquí según tus reglas.
      rol: 'Usuario' as any,
      fechaRegistro: null,
      estadoCuenta: r.estadoCuenta
    };

    this.router.navigate(['/usuarios/acciones/editar'], { state: { user } });
  }
}
