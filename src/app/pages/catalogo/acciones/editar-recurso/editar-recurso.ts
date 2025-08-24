import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-recurso',
  imports: [FormsModule,CommonModule],
  templateUrl: './editar-recurso.html',
  styleUrl: './editar-recurso.css'
})
export class EditarRecurso {

cargarFormulario(recurso: any) {
  this.form = {
    titulo: recurso.titulo || '',
    subtitulo: recurso.subtitulo || '',
    tipo: recurso.tipo || '',
    genero: recurso.genero || '',
    isbn: recurso.isbn || '',
    editorial: recurso.editorial || '',
    edicion: recurso.edicion || '',
    anioPublicacion: recurso.anio || '',   
    clasificacion: recurso.categoria || '',
    fechaIngreso: recurso.fecha_ingreso 
      ? new Date(recurso.fecha_ingreso).toISOString().substring(0, 10) 
      : '',  
    descripcion: recurso.descripcion || '',
    estado: recurso.estado || 'activo',
    consultaSala: recurso.es_consulta_sala || false, 
    observaciones: recurso.observaciones || ''
  };

  if (recurso.autores) {
    this.autores = recurso.autores;
  }
}

  constructor(private router: Router) {
  const recurso = history.state.recurso;

  if (!recurso) {
    this.router.navigate(['/catalogo']);
    return;
  }

  this.cargarFormulario(recurso);
}



  pagina = 1;
  totalPaginas = 2;

  // Formulario del recurso
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
    fechaIngreso: new Date(),
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

  // ================== MODALS ==================
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

  listarAutores() {
    this.abrirModal('lista');
  }
  crearAutor() {
    this.abrirModal('crear');
  }

  guardarNuevoAutor() {
    this.autoresDisponibles.push({ ...this.nuevoAutor });
    this.cerrarModal();
  }

  seleccionarAutor(autor: any) {
    this.autorSeleccionado = `${autor.nombre} ${autor.apellido}`;
    this.cerrarModal();
  }

  agregarAutor() {
    if (this.autorSeleccionado && this.tipoAutor) {
      const partes = this.autorSeleccionado.split(' ');
      this.autores.push({
        nombre: partes[0],
        apellido: partes[1] || '',
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

  // Guardar cambios
  registrar() {
    this.guardando = true;
    setTimeout(() => {
      this.guardando = false;
      alert('Recurso actualizado con éxito ✅');
      this.router.navigate(['/catalogo']);
    }, 1500);
  }

  volver() {
    this.router.navigate(['/catalogo']);
  }

  
}
