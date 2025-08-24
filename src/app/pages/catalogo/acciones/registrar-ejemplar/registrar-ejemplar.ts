import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registrar-ejemplar',
  imports: [FormsModule],
  templateUrl: './registrar-ejemplar.html',
  styleUrl: './registrar-ejemplar.css'
})
export class RegistrarEjemplar {

   tituloRecurso: string = '';

  // Datos del formulario
  form = {
  codigoBarras: '',
  estadoFisico: '',
  ubicacion: '',
  fechaIngreso: '',
  costo_adquisicion: 0,
  proveedor_id: '',
  disponiblePrestamo: true,
  observaciones: ''
};

  // Listas para selects
  estadosFisicos: string[] = ['Nuevo', 'Usado', 'Dañado','Perdido'];
  ubicaciones: string[] = ['Sala Lectura', 'Depósito', 'Préstamo Externo'];
  proveedores = [
  { id: 1, nombre: 'Proveedor 1' },
  { id: 2, nombre: 'Proveedor 2' },
  { id: 3, nombre: 'Proveedor 3' }
];

  // Estados de UI
  guardando = false;
  error: string | null = null;

  constructor(private router: Router) {
     const recurso = history.state.recurso;
    if (recurso) {
      this.tituloRecurso = recurso.titulo; // 👈 aquí obtienes el título
    }
  }

  registrar() {
  this.guardando = true;
  this.error = null;

  setTimeout(() => {
    this.guardando = false;

    if (!this.form.codigoBarras) {
      this.error = 'El Código de Barras es obligatorio';
      return;
    }

    console.log('Ejemplar registrado:', {
      titulo: this.tituloRecurso,  // se envía como referencia
      ...this.form
    });

    alert('Ejemplar registrado correctamente ✅');
    this.router.navigate(['/ejemplares']);
  }, 1200);
}

  
  volver() {
    this.router.navigate(['/catalogo']);
  }


}
