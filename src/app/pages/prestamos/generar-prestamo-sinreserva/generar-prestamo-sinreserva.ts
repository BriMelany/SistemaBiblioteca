import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrestamoRecurso } from '../model/prestamos/prestamo-recurso';
import { PrestamoService } from '../prestamo-service';
import { DataUsuario } from '../model/prestamos/data-usuario';
import { Ejemplar } from '../model/prestamos/ejemplar';
import { PrestamoCreate } from '../model/prestamos/prestamo-create';
import { PrestamoResponse } from '../model/prestamos/prestamo-errormessage';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generar-prestamo-sinreserva',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './generar-prestamo-sinreserva.html',
  styleUrls: ['./generar-prestamo-sinreserva.css']
})
export class GenerarPrestamoSinreserva  implements OnInit {

  recursoId!: number;
  prestamoRecurso?: PrestamoRecurso;
  estados: string[] = [];
  tipos: string[] = [];
  nroDocumento: string = '';
  usuario?: DataUsuario;
  multas: number[] = [];
  mensaje: string = ''; 
  ejemplares: Ejemplar[] = [];   
  ejemplar?: Ejemplar;  
  codigoBarras: string = '';
  
  //CrearPrestamo
  reservaId: number | null = null;
  ejemplarId!: number;
  usuarioId!: number;
  devolucion!: string;
  esError: boolean = false;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private prestamosService: PrestamoService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.recursoId = +params['id'];

        
        this.cargarDatos(this.recursoId);
      }
    });
  }

  cargarDatos(id: number) {
   
    this.prestamosService.getPrestamosRecurso(id).subscribe({
      next: (data) => {
        this.prestamoRecurso = data
        this.devolucion = this.prestamoRecurso.fechaLimite; 
      },
      error: (err) => console.error('Error cargando recurso', err)
    });

    
    this.prestamosService.getEstadosPrestamo(id).subscribe({
      next: (data) => this.estados = data,
      error: (err) => console.error('Error cargando estados', err)
    });

    
    this.prestamosService.getTiposRecurso(id).subscribe({
      next: (data) => this.tipos = data,
      error: (err) => console.error('Error cargando tipos', err)
    });
  }

 BuscarUsuario() {
    this.mensaje = '';

    if (!this.nroDocumento) {
      this.mensaje = 'Ingrese un número de documento';
      return;
    }

    this.prestamosService.getUsuario(this.nroDocumento).subscribe({
      next: (data) => {
        this.usuario = data;
        this.usuarioId = data.idUsuario; 
      },
      error: (err) => {
        console.error('Error al obtener usuario', err);
        this.usuario = undefined;
        this.mensaje = 'No se encontró el usuario o ocurrió un error';
      }
    });

    this.prestamosService.getMultas(this.nroDocumento).subscribe({
      next: (data) => {
        this.multas = data;
      },
      error: (err) => {
        console.error('Error al obtener multas', err);
        this.multas = [];
      }
    });
  }

  buscarPorCodigo() {
    this.mensaje = '';
    if (!this.codigoBarras) {
      this.mensaje = 'Ingrese un código de barras';
      return;
    }

    this.prestamosService.getEjemplar(this.codigoBarras).subscribe({
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

  getMontoMultas(): number {
    return this.multas.reduce((total, m) => total + m, 0);
  }

  isGeneroPrestamo = false; 

  generarPrestamo() {
  if (!this.ejemplarId || !this.usuarioId || !this.devolucion) {
    this.mensaje = 'Debe completar todos los campos';
    this.esError = true;
    return; 
  }

  const request: PrestamoCreate = {
    reservaId: null,
    ejemplarId: this.ejemplarId,
    usuarioId: this.usuarioId,
    devolucion: this.devolucion
  };

  this.prestamosService.crearPrestamo(request).subscribe({
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
  console.log('Abrir modal con recurso:', recursoId);
  this.mostrarModal = true;
  this.prestamosService.getListadoEjemplares(recursoId).subscribe({
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
















