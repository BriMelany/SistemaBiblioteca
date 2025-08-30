import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RolBD } from '../../core/auth/auth';
import { CatalogoService } from './data/catalogo-service'; 
import { CatalogoVista } from './models/catalogo-vista';

type Recurso = CatalogoVista;

type UIRol = 'Administrador' | 'Bibliotecario' | 'Usuario';
type AccionFila = 'Ver' | 'EditarRecurso' | 'RegistrarEjemplar';
type AccionDetalle = 'reservar' | 'prestamo';
type TableCol =  | 'tipo'  | 'titulo'  | 'autor'  | 'editorial'  | 'anio'  | 'categoria'  | 'ejemplares'  | 'acciones';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private router = inject(Router);
  private auth   = inject(AuthService);
  private catalogoService = inject(CatalogoService);

ngOnInit() {
  this.catalogoService.listarCatalogo().subscribe({
    next: (recursos) => {
      this.recursos = recursos;
    },
    error: (err) => {
      console.error('Error al cargar catálogo:', err);
    }
  });
}

  // ================== ROL (desde AuthService) ==================
  private readonly ROLE_UI: Record<RolBD, UIRol> = {
    ADMINISTRADOR: 'Administrador',
    BIBLIOTECARIO: 'Bibliotecario',
    ESTUDIANTE:    'Usuario',
    PROFESOR:      'Usuario',
  };

  get rolBD(): RolBD { return this.auth.role; }
  get rol(): UIRol   { return this.ROLE_UI[this.rolBD]; }

  get isStaff()   { return this.auth.hasRole('ADMINISTRADOR','BIBLIOTECARIO'); }
  get isUsuario() { return this.auth.hasRole('ESTUDIANTE','PROFESOR'); }

  // ================== DATA API ==================
  recursos: Recurso[] = [];

  // ================== TABLA ==================
  seleccion: Recurso | null = null;

  readonly headers: Record<TableCol, string> = {
    tipo: 'Tipo',
    titulo: 'Título',
    autor: 'Autor',
    editorial: 'Editorial',
    anio: 'Año',
    categoria: 'Categoría',
    ejemplares: 'Cantidad de Ejemplares',
    acciones: 'Acciones',
  };

  private readonly COLS_USUARIO: TableCol[] = ['tipo','titulo','autor','editorial','anio','categoria','acciones'];
  private readonly COLS_STAFF:   TableCol[] = ['tipo','titulo','autor','editorial','anio','categoria','ejemplares','acciones'];

  get columns(): TableCol[] {
    return this.isStaff ? this.COLS_STAFF : this.COLS_USUARIO;
  }

  get accionesFila(): AccionFila[] {
    return this.isStaff ? ['Ver','EditarRecurso','RegistrarEjemplar'] : ['Ver'];
  }

  get accionesDetalle(): AccionDetalle[] {
    return this.isUsuario ? ['reservar'] : ['prestamo'];
  }

  // ================== ACCIONES ==================
  verDetalle(r: Recurso) { this.seleccion = r; }

  editarRecurso(r: Recurso) {
    this.router.navigate(['catalogo/acciones/editar-recurso'], { state: { recurso: r } });
  }

  registrarEjemplar(r: Recurso) {
    this.router.navigate(['catalogo/acciones/registrar-ejemplar'], { state: { recurso: r }, queryParams: { id: r.id } });
  }

  cerrarDetalle() { this.seleccion = null; }

  accionButton() { this.router.navigate(['catalogo/acciones/nuevo-recurso']); }

  solicitarReserva(r: Recurso) {
    this.router.navigate(
  ['/reservas/acciones/registra-reserva'], 
  { state: { recurso: r } }
);

  }

realizarPrestamo(r: Recurso) {
    this.router.navigate(['prestamos/generar-prestamo-sinreserva'], { queryParams: { id: r.id } });
    this.cerrarDetalle();
  }
  // ================== FILTROS & PAGINACIÓN ==================
  q = '';
  showTipo = true;
  showEdit = false;
  showCat  = false;
  showAnio = false;

  openOnly(which: 'tipo'|'edit'|'cat'|'anio'): void {
    const wasOpen =
      (which==='tipo' && this.showTipo) ||
      (which==='edit' && this.showEdit) ||
      (which==='cat'  && this.showCat)  ||
      (which==='anio' && this.showAnio);

    this.showTipo = this.showEdit = this.showCat = this.showAnio = false;
    if (!wasOpen) {
      if (which==='tipo') this.showTipo = true;
      if (which==='edit') this.showEdit = true;
      if (which==='cat')  this.showCat  = true;
      if (which==='anio') this.showAnio = true;
    }
  }

  tipoSel      = new Set<string>();
  editorialSel = new Set<string>();
  categoriaSel = new Set<string>();
  anioMin?: number;
  anioMax?: number;

  get tipos()       { return Array.from(new Set(this.recursos.map(r => r.tipo))).sort(); }
  get editoriales() { return Array.from(new Set(this.recursos.map(r => r.editorial))).sort(); }
  get categorias()  { return Array.from(new Set(this.recursos.map(r => r.categoria))).sort(); }

  pageIndex = 1;
  pageSize  = 6;

  get filtrada() {
    const txt = this.q.trim().toLowerCase();
    return this.recursos.filter(r => {
      const okTxt = !txt || r.titulo.toLowerCase().includes(txt);
      const okTip = this.tipoSel.size===0 || this.tipoSel.has(r.tipo);
      const okEd  = this.editorialSel.size===0 || this.editorialSel.has(r.editorial);
      const okCat = this.categoriaSel.size===0 || this.categoriaSel.has(r.categoria);
      const okAn  = (this.anioMin==null || r.anio>=this.anioMin) && (this.anioMax==null || r.anio<=this.anioMax);
      return okTxt && okTip && okEd && okCat && okAn;
    });
  }
  get totalPages() { return Math.max(1, Math.ceil(this.filtrada.length / this.pageSize)); }
  get pageStart()  { return (this.pageIndex - 1) * this.pageSize; }
  get pageEnd()    { return this.pageStart + this.pageSize; }
  get lista()      { return this.filtrada.slice(this.pageStart, this.pageEnd); }
  get pages() {
    const out:number[] = [];
    const total = this.totalPages;
    let start = Math.max(1, this.pageIndex-2);
    let end   = Math.min(total, start+4);
    start = Math.max(1, end-4);
    for (let i=start;i<=end;i++) out.push(i);
    return out;
  }
  goToPage(n:number){ if (n<1 || n>this.totalPages) return; this.pageIndex=n; }
  prev(){ this.goToPage(this.pageIndex-1); }
  next(){ this.goToPage(this.pageIndex+1); }

  toggle(set: Set<string>, value: string, checked: boolean){
    checked ? set.add(value) : set.delete(value);
    this.pageIndex = 1;
  }
  limpiarFiltros(){
    this.q=''; this.tipoSel.clear(); this.editorialSel.clear(); this.categoriaSel.clear();
    this.anioMin=this.anioMax=undefined; this.pageIndex=1;
  }

  // ================== UX ==================
  @HostListener('document:keydown.escape')
  onEsc(){ this.cerrarDetalle(); }
}
