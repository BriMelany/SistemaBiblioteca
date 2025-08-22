import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // ← quité RouterLink

type Rol = 'Administrador' | 'Bibliotecario' | 'Usuario';  // ← incluye 'Usuario'
type EstadoCuenta = 'Activo' | 'Bloqueo temporal';
type TipoDocumento = 'DNI' | 'CE' | 'Pasaporte';

interface UsuarioForm {
  id?: string | null;
  // Datos del usuario
  tipoDocumento: TipoDocumento;
  documento: string;
  nombre: string;
  apePaterno: string;
  apeMaterno: string;
  direccion: string;
  telefono: string;
  email: string;

  // Datos de la cuenta
  username: string;
  rol: Rol;
  passwordGenerada: string;
  fechaRegistro?: string | null;
  estadoCuenta: EstadoCuenta;
}

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormsModule], // ← quité RouterLink
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css'
})
export class EditarUsuario {
  rol: Rol = 'Administrador'; // demo

  private route = inject(ActivatedRoute);
  private router = inject(Router);

  titulo = 'Editar Usuarios';
  esNuevo = false;       
  guardando = false;
  error = '';

  tiposDoc: TipoDocumento[] = ['DNI', 'CE', 'Pasaporte'];
  roles: Rol[] = ['Administrador', 'Bibliotecario', 'Usuario']; // ahora válido
  estados: EstadoCuenta[] = ['Activo', 'Bloqueo temporal'];

  form: UsuarioForm = {
    id: null,
    tipoDocumento: 'DNI',
    documento: '',
    nombre: '',
    apePaterno: '',
    apeMaterno: '',
    direccion: '',
    telefono: '',
    email: '',
    username: '',
    rol: 'Usuario', // ahora coincide con el tipo Rol
    passwordGenerada: 'Contraseña temporal',
    fechaRegistro: null,
    estadoCuenta: 'Activo',
  };

 ngOnInit() {
    const isNuevo = this.route.snapshot.queryParamMap.get('nuevo') === '1';
    const stateUser = (history.state?.user ?? null) as Partial<UsuarioForm> | null;

   this.esNuevo = isNuevo || !stateUser;

  if (this.esNuevo) {
    this.titulo = 'Nuevo Usuario';
    return;
  }
  const st = stateUser!;

    this.titulo = 'Editar Usuarios';
    this.form = {
      ...this.form,
      id: (st.id as any)?.toString?.() ?? (st.id ?? null as any),
      tipoDocumento: (st.tipoDocumento as TipoDocumento) ?? 'DNI',
      documento: st.documento ?? '',
      nombre: st['nombre'] ?? '',
      apePaterno: st['apePaterno'] ?? '',
      apeMaterno: st['apeMaterno'] ?? '',
      direccion: st['direccion'] ?? '',
      telefono: st['telefono'] ?? '',
      email: st['email'] ?? '',
      username: st['username'] ?? '',
      rol: (st.rol as Rol) ?? 'Usuario',
      passwordGenerada: 'Contraseña temporal',
      fechaRegistro: this.ensureYYYYMMDD(st['fechaRegistro']),
      estadoCuenta: (st['estadoCuenta'] as EstadoCuenta) ?? 'Activo',
    };
  }

  private ensureYYYYMMDD(val?: string | null): string | null {
    if (!val) return null;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    return null;
  }

 guardar() {
    this.guardando = true;
    this.error = '';
    setTimeout(() => {
      this.guardando = false;
      this.router.navigate(['/usuarios'], {
        state: {
          toast: this.form.id
            ? `Usuario ${this.form.documento} actualizado correctamente`
            : 'Usuario creado correctamente'
        }
      });
    }, 400);
  }

  volver() { this.router.navigate(['/usuarios']); }
}
