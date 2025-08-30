import { Component } from '@angular/core';
import { PrestamoService } from '../prestamo-service';
import { ReservaDetalle } from '../model/reservas/reserva-detallle';
import { Ejemplar } from '../model/prestamos/ejemplar';
import { PrestamoRecurso } from '../model/prestamos/prestamo-recurso';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PrestamoCreate } from '../model/prestamos/prestamo-create';
import { Router } from '@angular/router';

@Component({
  selector: 'app-generar-prestamo-conreserva',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './generar-prestamo-conreserva.html',
  styleUrls: ['./generar-prestamo-conreserva.css']
})
export class GenerarPrestamoConreserva {

  
  recursoId!: number;
  reserva?: ReservaDetalle; 
  prestamoRecurso?: PrestamoRecurso;
  mensaje: string = ''; 
  ejemplares: Ejemplar[] = [];   
  ejemplar?: Ejemplar;  
  codigoBarras: string = '';


  //CrearPrestamo
  reservaId!: number;  
  ejemplarId!: number;
  usuarioId!: number;
  devolucion!: string;
  esError: boolean = false;


  constructor(
    private prestamoService: PrestamoService,
    private router: Router
  ) {}


BuscarReserva() {
  this.prestamoService.getReservaDetalle(this.reservaId)
    .subscribe((data) => {
      this.reserva = data;  
      this.reservaId = data.reservaId;
      this.usuarioId = data.usuarioId;
      this.recursoId = data.recursoId;

      this.prestamoService.getPrestamosRecurso(this.recursoId)
        .subscribe((prestamoRecurso) => {
          this.prestamoRecurso = prestamoRecurso;
          this.devolucion = prestamoRecurso.fechaLimite;
        });
    });
}

buscarPorCodigo() {
    this.mensaje = '';
    if (!this.codigoBarras) {
      this.mensaje = 'Ingrese un código de barras';
      return;
    }

    this.prestamoService.getEjemplar(this.codigoBarras).subscribe({
      next: (data) => {
        this.ejemplar = data;
        this.ejemplarId = data.id; 
      },
      error: (err) => {
        console.error('Error al buscar ejemplar', err);
        this.mensaje = 'No se encontró el ejemplar con ese código';
        this.ejemplar = undefined;
      }
    });
  }

  isGeneroPrestamo = false; 
  generarPrestamo() {
  if (!this.ejemplarId || !this.usuarioId || !this.devolucion) {
    this.mensaje = 'Debe completar todos los campos';
    this.esError = true;
    return; 
  }

  const request: PrestamoCreate = {
    reservaId: this.reservaId,
    ejemplarId: this.ejemplarId,
    usuarioId: this.usuarioId,
    devolucion: this.devolucion
  };

  this.prestamoService.crearPrestamo(request).subscribe({
    next: () => { 
      this.mensaje = 'Préstamo creado con éxito';
      this.esError = false;
      this.isGeneroPrestamo = true; 
    },
    error: (err: HttpErrorResponse) => {
      console.error('Error al crear préstamo', err);

      if (err.status === 401) {
        this.mensaje = err.error?.mensaje || 'Sesión expirada. Vuelva a iniciar sesión.';
      } else if (err.status === 400) {
        this.mensaje = err.error?.mensaje || 'Error en la solicitud';
      } else {
        this.mensaje = err.error?.mensaje || 'Error inesperado en el servidor';
      }
      this.esError = true;
    }
  });
}

Volver(){
  this.router.navigate(['prestamos']);
}

// Paginacion y Modal

currentStep: number = 1;
totalSteps: number = 2;

goNext() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  goPrev() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isLastStep(): boolean {
    return this.currentStep === this.totalSteps;
  }

  isFirstStep(): boolean {
    return this.currentStep === 1;
  }

mostrarModal: boolean = false;

abrirModal(recursoId: number) {
  this.mostrarModal = true;
  this.prestamoService.getListadoEjemplares(recursoId).subscribe({
    next: (data) => {
      this.ejemplares = data;
      this.mensaje = '';
    },
    error: (err) => {
      console.error('Error al listar ejemplares', err);
      this.mensaje = 'No se pudieron cargar los ejemplares';
      this.ejemplares = [];
    }
  });
}

closeModal() {
  this.mostrarModal = false;
  this.ejemplares = [];
  this.mensaje = '';
}


}
