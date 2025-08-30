import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
  FormGroup
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-form-recuperar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-recuperar.html',
  styleUrls: ['./form-recuperar.css']
})
export class FormRecuperar implements OnInit {
  private fb   = inject(FormBuilder);
  private http = inject(HttpClient);

  // Estado UI
  showNew = false;
  showConf = false;
  cargando = false;
  success  = false;
  error    = '';
  ocultarUsuario = false;

  fg!: FormGroup;

  ngOnInit(): void {
    this.fg = this.fb.group({
      usuario:         ['', [Validators.required]],
      passwordActual:  ['', [Validators.required, Validators.minLength(6)]],
      password:        ['', [Validators.required, Validators.minLength(6)]],
      confirm:         ['', [Validators.required]]
    }, { validators: this.passwordsMatch });
  }

  // Validador cruzado: password === confirm
  private passwordsMatch = (group: AbstractControl): ValidationErrors | null => {
    const p = group.get('password')?.value;
    const c = group.get('confirm')?.value;
    return p && c && p !== c ? { mismatch: true } : null;
  };

onSubmit(): void {
  if (this.fg.invalid) { this.fg.markAllAsTouched(); return; }

  const { usuario, passwordActual, password } = this.fg.value;
  const body = {
    userActual:     usuario,
    passwordActual: passwordActual,
    nuevoPassword:  password
  };
  this.cargando = true;
  this.error = '';
  this.success = false;
  this.http.post('/auth/cambiar-password', body).subscribe({
    next: () => {
      this.cargando = false;
      this.success = true;
      this.fg.reset({
        usuario,
        passwordActual: '',
        password: '',
        confirm: ''
      });
      this.fg.markAsPristine();
      this.fg.markAsUntouched();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => this.success = false, 4000);
    },
    error: (e) => {
      this.cargando = false;
      const raw = (e?.error?.mensaje || e?.error?.message || e?.error?.error_description || e?.message || '').toString().toLowerCase();

      if (e.status === 0) {
        this.error = 'No hay conexión con el servidor.';
      } else if (e.status === 401 || raw.includes('bad credentials')) {
        this.error = 'Usuario o contraseña actual incorrectos.';
      } else {
        this.error = e?.error?.mensaje ?? 'No se pudo cambiar la contraseña.';
      }
    }
  });
}

}
