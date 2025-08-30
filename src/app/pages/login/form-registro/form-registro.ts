import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

type RolBD = 'ESTUDIANTE' | 'PROFESOR' | 'BIBLIOTECARIO' | 'ADMINISTRADOR';
type TipoDoc = 'DNI' | 'CE' | 'PASAPORTE';

@Component({
  selector: 'app-form-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-registro.html',
  styleUrls: ['./form-registro.css']
})
export class FormRegistro implements OnInit { private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  cargando = false;
  adminMode = false;

  // Combos
  tiposDocumento: TipoDoc[] = ['DNI', 'CE', 'PASAPORTE'];
  roles: RolBD[] = ['ESTUDIANTE', 'PROFESOR']; // por defecto

  fg = this.fb.group({
    nombres:        ['', [Validators.required, Validators.maxLength(80)]],
    apellidos:      ['', [Validators.required, Validators.maxLength(80)]],
    tipoDocumento:  ['DNI' as TipoDoc, [Validators.required]],
    numeroDocumento:['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
    rol:            ['ESTUDIANTE' as RolBD, [Validators.required]],
    direccion:      ['', [Validators.maxLength(160)]],
    telefono:       ['', [Validators.pattern(/^[0-9 +()-]{6,20}$/)]],
    correo:         ['', [Validators.required, Validators.email]],
    usuario:        ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    password:       ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    // Si vienes como admin, permite más roles: /registro?admin=1
    this.adminMode = this.route.snapshot.queryParamMap.get('admin') === '1';
    if (this.adminMode) {
      this.roles = ['ESTUDIANTE', 'PROFESOR', 'BIBLIOTECARIO', 'ADMINISTRADOR'];
    }
  }

  get f() { return this.fg.controls; }

  async submit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }
    this.cargando = true;

    // Mapea al DTO que espere tu backend
    const body = {
      nombre:           this.f.nombres.value,
      apellidos:        this.f.apellidos.value,
      tipoDocumento:    this.f.tipoDocumento.value,
      numeroDocumento:  this.f.numeroDocumento.value,
      rol:              this.f.rol.value,
      direccion:        this.f.direccion.value,
      telefonoMovil:    this.f.telefono.value,
      correoElectronico:this.f.correo.value,
      usuario:          this.f.usuario.value,
      password:         this.f.password.value,
    };

    this.http.post('/auth/register', body).subscribe({
      next: () => {
        this.cargando = false;
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        this.router.navigate(['/login']);
      },
      error: (e) => {
        this.cargando = false;
        console.error(e);
        alert('No se pudo completar el registro.');
      }
    });
  }
}