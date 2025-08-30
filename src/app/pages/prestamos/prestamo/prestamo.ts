import { Component, OnInit } from '@angular/core';
import { PrestamoService } from '../prestamo-service';
import { PrestamoModel } from '../model/prestamos/prestamo-model';
import { PrestamoDetalle } from '../model/prestamos/prestamo-detalle';
import { AuthService } from '../../../core/auth/auth';
import { Router } from '@angular/router';
import { Bibliotecario } from '../model/prestamos/bibliotecarios';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-prestamo',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './prestamo.html',
  styleUrls: ['./prestamo.css']
})
export class PrestamoComponent implements OnInit {
prestamos: PrestamoModel[] = [];
prestamosDetalle: PrestamoDetalle[] = [];

esBiblioAdmin: boolean = false;
esUsuario: boolean = false;

// Listas desde servicio
bibliotecarios: Bibliotecario[] = [];
estados: string[] = [];

// Filtros 
usuarioFiltro: string = '';
bibliotecarioFiltro: string = '';
estadoFiltro: string = '';
fechaFiltro?: string;   

// Paginación
pageIndex = 1;
pageSize  = 6;

// detalle seleccionado (para modal)
seleccion: PrestamoDetalle | null = null;



constructor(
  private auth: AuthService,
  private prestamoService: PrestamoService,
  private router: Router
) {}

ngOnInit(): void {
  // cargar listas auxiliares
  this.prestamoService.listarBibliotecarios()
    .subscribe(b => this.bibliotecarios = b);

  this.prestamoService.listarEstadosLibros()
    .subscribe(e => this.estados = e);

  const rol = this.auth.currentUser?.rol;
  this.esBiblioAdmin = rol === 'ADMINISTRADOR' || rol === 'BIBLIOTECARIO';
  this.esUsuario     = rol === 'PROFESOR' || rol === 'ESTUDIANTE';


 
  this.auth.user$.subscribe(user => {
  console.log("Usuario cargado:", user);

  if (this.esUsuario && user?.id) {
    this.prestamoService.listarPrestamoDetalle(user.id)
      .subscribe(det => {
        console.log("Respuesta backend:", det);
        this.prestamosDetalle = det;
        this.pageIndex = 1;
      });
  }
});

  if (this.esBiblioAdmin) {
    this.prestamoService.listarPrestamo()
      .subscribe(p => {
        console.log("Prestamos recibidos:", p);
        this.prestamos = p;
        this.pageIndex = 1;
      });
  }
}


// --------------------
// FILTRADO desde servicio
// --------------------
aplicarFiltros() {
  if (this.esBiblioAdmin) {
    const filtros: any = {
      usuario: this.usuarioFiltro,
      bibliotecario: this.bibliotecarioFiltro,
      estado: this.estadoFiltro,
      fecha: this.fechaFiltro
    };

    this.prestamoService.listarFiltrarPrestamo(filtros)
      .subscribe(p => {
        this.prestamos = p;
        this.pageIndex = 1;
      });
  }

  if (this.esUsuario) {
    const userId = this.auth.currentUser?.id;
    if (userId != null) {
      const filtros: any = {
        estado: this.estadoFiltro,
        fecha: this.fechaFiltro
      };

      this.prestamoService.listarPrestamoDetalleFiltrado(userId, filtros)
        .subscribe(det => {
          this.prestamosDetalle = det;
          this.pageIndex = 1;
        });
    }
  }
}

// --------------------
// PAGINACIÓN (helpers)
// --------------------
get totalPages() { return Math.max(1, Math.ceil(this.listaBase.length / this.pageSize)); }
get pageStart()  { return (this.pageIndex - 1) * this.pageSize; }
get pageEnd()    { return this.pageStart + this.pageSize; }
get lista()      { return this.listaBase.slice(this.pageStart, this.pageEnd); }

get listaBase(): Array<any> {
  return this.esBiblioAdmin ? this.prestamos : this.prestamosDetalle;
}

get pages(): number[] {
  const out: number[] = [];
  const total = this.totalPages;
  let start = Math.max(1, this.pageIndex - 2);
  let end = Math.min(total, start + 4);
  start = Math.max(1, end - 4);
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

goToPage(n: number) { if (n < 1 || n > this.totalPages) return; this.pageIndex = n; }
prev() { this.goToPage(this.pageIndex - 1); }
next() { this.goToPage(this.pageIndex + 1); }

// --------------------
// ACCIONES
// --------------------
limpiarFiltros() {
  this.usuarioFiltro = '';
  this.bibliotecarioFiltro = '';
  this.estadoFiltro = '';
  this.fechaFiltro = undefined;
  this.pageIndex = 1;

  // recargar todo sin filtros
  this.ngOnInit();
}

generarPrestamoConReserva() {
  if (!this.esBiblioAdmin) return;
  this.router.navigate(
    ['prestamos/generar-prestamo-conreserva']
  );
}



verDetalle(item: any) {
  this.seleccion = item;
}

cerrarDetalle() {
  this.seleccion = null;
}

prestamoCancelarId: number | null = null;

abrirCancelar(prestamo: PrestamoModel) {
  if (!this.esBiblioAdmin) return;
  this.prestamoCancelarId = prestamo.prestamoId; 
}

cerrarCancelar() {
  this.prestamoCancelarId = null; 
}

confirmarCancelar() {
}

registrarDevolucion(prestamo: PrestamoModel) {
  sessionStorage.setItem('prestamo', JSON.stringify(prestamo));
  this.router.navigate(['prestamos/registrar-devolucion']);
}

calcularRetraso(fechaPrestamo: string | Date, fechaDevolucion: string | Date): number {
  const fPrestamo = new Date(fechaPrestamo);
  const fDevolucion = new Date(fechaDevolucion);

  const diffMs = fDevolucion.getTime() - fPrestamo.getTime(); 
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24)); 
  return diffDias;
}

}
