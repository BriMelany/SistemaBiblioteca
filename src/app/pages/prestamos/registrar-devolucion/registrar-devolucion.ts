import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PrestamoModel } from '../model/prestamos/prestamo-model';
import { Ejemplar } from '../model/prestamos/ejemplar';
import { PrestamoService } from '../prestamo-service';
import { ReservaDetalle } from '../model/reservas/reserva-detallle';
import { HttpErrorResponse } from '@angular/common/http';
import { PrestamoResponse } from '../model/prestamos/prestamo-errormessage';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registrar-devolucion',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './registrar-devolucion.html',
  styleUrls: ['./registrar-devolucion.css']
})
export class RegistrarDevolucion {

  prestamo?: PrestamoModel;
  ejemplar?: Ejemplar;
  reserva?: ReservaDetalle | null = null;
  mensaje: string = '';
  esError: boolean = false;
  fechaActual: string = '';


  constructor(
    private router: Router,
    private prestamoService: PrestamoService,
  ) { }

  ngOnInit(): void {
  const nav = this.router.getCurrentNavigation();
  const state = nav?.extras.state as { prestamo?: PrestamoModel };

  const hoy = new Date();
  this.fechaActual = hoy.toISOString().split('T')[0];

  if (state?.prestamo) {
    this.prestamo = state.prestamo;
    sessionStorage.setItem('prestamo', JSON.stringify(this.prestamo));
  } else {
    const saved = sessionStorage.getItem('prestamo');
    if (saved) {
      this.prestamo = JSON.parse(saved);
    }
  }

  if (this.prestamo) {
    if (this.prestamo.codigoBarras) {
      this.prestamoService.getEjemplar(this.prestamo.codigoBarras).subscribe({
        next: (data) => this.ejemplar = data,
        error: (err) => console.error('Error cargando ejemplar:', err)
      });
    }

    if (this.prestamo.idReserva != null) {
      this.prestamoService.getReservaDetalle(this.prestamo.idReserva).subscribe({
        next: (data) => this.reserva = data,
        error: (err) => console.error('Error cargando reserva:', err)
      });
    }
  }
}



isDevolucionRegistrada = false; 
RegistrarDevolucion(): void {
  if (!this.prestamo?.prestamoId) return;

  this.prestamoService.devolverPrestamo(this.prestamo.prestamoId).subscribe({
    next: () => {
      this.mensaje = 'Préstamo devuelto con éxito';
      this.esError = false;
      this.isDevolucionRegistrada = true; 
    },
    error: (err: HttpErrorResponse) => {
      const errorResp = err.error as PrestamoResponse;

      if (err.status === 401) {
        this.mensaje = errorResp?.mensaje || 'Sesión expirada. Vuelva a iniciar sesión.';
      } else if (err.status === 400) {
        this.mensaje = errorResp?.mensaje || 'Error en la solicitud';
      } else {
        this.mensaje = errorResp?.mensaje || 'Error inesperado en el servidor';
      }

      this.esError = true;
    }
  });
}

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

  Volver(){
  this.router.navigate(['prestamos']);
   }


}
