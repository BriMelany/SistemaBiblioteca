import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent  {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  showPwd = false;
  loading = false;
  loginError: string | null = null;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  async onSubmit() {
  if (this.form.invalid || this.loading) return;
  this.loading = true; this.loginError = null;

  const { username, password } = this.form.value;
  try {
    await firstValueFrom(this.auth.login(username!, password!));
    this.router.navigate(['/inicio']);
  } catch (e:any) {
    this.loginError = e?.error?.mensaje ?? 'No se pudo iniciar sesión.';
  } finally {
    this.loading = false;
  }
}
  // ---- mapeo de códigos de tu API a mensajes amigables
  private getErrorMessage(e: any): string {
    const code: string | undefined = e?.error?.codigo;

    switch (code) {
      case 'CREDENCIALES_INVALIDAS':
        return 'Usuario o contraseña inválidos.';
      case 'CUENTA_BLOQUEADA':
        return 'Tu cuenta está bloqueada. Contacta al administrador.';
      case 'CUENTA_ELIMINADA':
        return 'Tu cuenta fue eliminada. Contacta al administrador.';
      case 'USUARIO_NO_ENCONTRADO':
        return 'El usuario no existe.';
      case 'TOKEN_EXPIRADO':
        return 'Tu sesión expiró. Vuelve a iniciar sesión.';
      case 'TOKEN_NO_ENTREGADO':
        return 'No se envió el token de autenticación. Inicia sesión nuevamente.';
      case 'AUTH_ERROR':
        return 'Ocurrió un error de autenticación. Intenta de nuevo.';
      default:
        return e?.error?.mensaje || 'No se pudo iniciar sesión.';
    }
  }
}