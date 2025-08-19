import { Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type Recurso = {
  id: string;
  tipo: string;
  titulo: string;
  autor: string;
  editorial: string;
  anio: number;
  categoria: string;

  es_consulta_sala: boolean;
  isbn?: string;
  subtitulo?: string;
  descripcion?: string;
  portadaUrl?: string;
};

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './catalogo.html',
  styleUrl: './catalogo.css',
})
export class Catalogo {
  private router = inject(Router);

  recursos: Recurso[] = [
    { id:'1', tipo:'Libro',  titulo:'Cien años de soledad', autor:'Gabriel G. Márquez', editorial:'Sudamericana', anio:1967, categoria:'Novela', es_consulta_sala:true,  isbn:'978-84-376-0494-7', subtitulo:'……', descripcion:'[Texto aquí]', portadaUrl:'https://www.rae.es/sites/default/files/portada_cien_anos_de_soledad_0.jpg' },
    { id:'2', tipo:'Libro',  titulo:'Introducción a Angular', autor:'Autor 7', editorial:'TechPress', anio:2024, categoria:'Tecnología', es_consulta_sala:false, isbn:'978-1-234-56789-0', subtitulo:'……', descripcion:'[Texto aquí]', portadaUrl:'https://edit.org/images/cat/portadas-libros-big-2019101610.jpg' },
    { id:'3', tipo:'Recurso',titulo:'Mapa histórico', autor:'Autor 3', editorial:'GeoEdit', anio:2003, categoria:'Historia', es_consulta_sala:false, isbn:'978-1-234-56789-0', subtitulo:'……', descripcion:'[Texto aquí]', portadaUrl:'https://wl-genial.cf.tsp.li/resize/728x/jpg/ba3/e72/337d485c37af5cf13264ff037c.jpg' },
    { id:'4', tipo:'Libro',  titulo:'Patrones de Diseño', autor:'Autor 5', editorial:'TechPress', anio:1994, categoria:'Tecnología', es_consulta_sala:true,isbn:'978-1-234-56789-0', subtitulo:'……', descripcion:'[Texto aquí]', portadaUrl:'https://i.pinimg.com/736x/5b/55/88/5b5588929b6f46d55f62e775c3e8d101.jpg'   },
    { id:'5', tipo:'Recurso',titulo:'Enciclopedia', autor:'Varios', editorial:'General', anio:2005, categoria:'Referencia', es_consulta_sala:false ,isbn:'978-84-376-0494-7', subtitulo:'……', descripcion:'[Texto aquí]', portadaUrl:'https://gtechdesign.net/images/articu-2/portada-libro-3.webp'},
    { id:'6', tipo:'Libro',  titulo:'El Quijote', autor:'Cervantes', editorial:'Clásicos', anio:1605, categoria:'Literatura', es_consulta_sala:true  },
  ];

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

  seleccion: Recurso | null = null;
  verDetalle(r: Recurso){ this.seleccion = r; }
  cerrarDetalle(){ this.seleccion = null; }

  solicitarReserva(r: Recurso){
    this.router.navigate(
      ['/reservas/acciones/registra-reserva'],
      { state: { recurso: r }, queryParams: { id: r.id } }
    );
    this.cerrarDetalle();
  }

  @HostListener('document:keydown.escape')
  onEsc(){ this.cerrarDetalle(); }
}
