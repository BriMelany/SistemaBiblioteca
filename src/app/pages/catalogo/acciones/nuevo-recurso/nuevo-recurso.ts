import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-recurso',
  imports: [FormsModule, CommonModule],
  templateUrl: './nuevo-recurso.html',
  styleUrl: './nuevo-recurso.css'
})
export class NuevoRecurso {


  constructor(private router: Router) {}

  pagina = 1;
  totalPaginas = 2;

  form: any = {
    titulo: '',
    subtitulo: '',
    tipo: '',
    genero: '',
    isbn: '',
    editorial: '',
    edicion: '',
    anioPublicacion: '',
    clasificacion: '',
    fechaIngreso: '',
    descripcion: '',
    estado: 'activo',
    consultaSala: false,
    observaciones: ''
  };

  tipos = ['Libro', 'Revista', 'Artículo', 'Tesis'];
  generos = ['Ciencia', 'Historia', 'Tecnología', 'Arte'];
  tiposAutor = ['Autor Principal', 'Colaborador'];

  autores: any[] = [];
  autorSeleccionado = '';
  tipoAutor = '';

  guardando = false;

  siguiente() {
    if (this.pagina < this.totalPaginas) this.pagina++;
  }

  anterior() {
    if (this.pagina > 1) this.pagina--;
  }

  // Modals

  
  listarAutores() {
  this.abrirModal('lista');
}

crearAutor() {
  this.abrirModal('crear');
}

  agregarAutor() {
    if (this.autorSeleccionado && this.tipoAutor) {
      this.autores.push({
        nombre: 'Sergio Manuel',
        apellido: 'Castilla Alvarez',
        pais: 'Perú',
        tipo: this.tipoAutor
      });
      this.autorSeleccionado = '';
      this.tipoAutor = '';
    }
  }

  eliminarAutor(i: number) {
    this.autores.splice(i, 1);
  }

  subirImagen(event: any) {
    const file = event.target.files[0];
    console.log('Imagen subida:', file);
  }

  registrar() {
    this.guardando = true;
    setTimeout(() => {
      this.guardando = false;
      alert('Recurso registrado con éxito ✅');
    }, 1500);
  }


  volver() {
    this.router.navigate(['/catalogo']);
  }


modalAbierto: string | null = null;
nuevoAutor = { nombre: '', apellido: '', pais: '', biografia: '' };
filtro = '';
autoresDisponibles = [
  { nombre: 'Ciro', apellido: 'Alegría', pais: 'Perú' },
  { nombre: 'Mario', apellido: 'Vargas Llosa', pais: 'Perú' }
];

get autoresFiltrados() {
  if (!this.filtro) return this.autoresDisponibles;
  return this.autoresDisponibles.filter(a =>
    a.nombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
    a.apellido.toLowerCase().includes(this.filtro.toLowerCase()) ||
    a.pais.toLowerCase().includes(this.filtro.toLowerCase())
  );
}

abrirModal(tipo: string) {
  this.modalAbierto = tipo;
}
cerrarModal() {
  this.modalAbierto = null;
}
guardarNuevoAutor() {
  this.autoresDisponibles.push({ ...this.nuevoAutor });
  this.cerrarModal();
}
seleccionarAutor(autor: any) {
  this.autorSeleccionado = `${autor.nombre} ${autor.apellido}`;
  this.cerrarModal();
}

}
