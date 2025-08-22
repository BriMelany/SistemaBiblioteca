// src/app/pages/reservas/reservas.ts
import { Component, inject, HostListener } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router'; 
import { Router } from '@angular/router';

type Estado = 'Activa' | 'Pendiente' | 'Cancelada' | 'Vencida';
type Rol = 'Administrador' | 'Bibliotecario' | 'Usuario';

interface Reserva {
  id: string;
  codigo: string;
  fecha: string;  
  fechaExpiracion?: string; 
  notificado?: boolean;
  fechaNotificacion?: string | null; 
  portadaUrl?: string;
  tipo: string;
  titulo: string;
  estado: Estado;

  //para admin/biblio:
  usuario?: string;
  notificacion?: string;
  
}

const API = 'http://localhost:3000/api'; 

type ColKey =
  | 'codigo' | 'fecha' | 'tipo' | 'titulo'
  | 'usuario' | 'estado' | 'notificacion' | 'acciones';

type Accion = 'ver' | 'cancelar' | 'actualizar' | 'descargar';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './reservas.html',
  styleUrl: './reservas.css',
})
export class Reservas {
  private http = inject(HttpClient);
  private router = inject(Router);
  readonly Math = Math;

  // ======== rol ========
  rol: Rol = 'Usuario'; // 'Administrador' | 'Bibliotecario' | 'Usuario'

  readonly headers: Record<ColKey, string> = {
    codigo: 'Código',
    fecha: 'Fecha Reserva',
    tipo: 'Tipo de recurso',
    titulo: 'Título',
    usuario: 'Usuario',
    estado: 'Estado',
    notificacion: 'Notificación',
    acciones: 'Acciones',
  };

  private readonly COLS_USUARIO: ColKey[]       = ['codigo','fecha','tipo','titulo','estado','acciones'];
  private readonly COLS_BIBLIOTECARIO: ColKey[] = ['codigo','fecha','tipo','titulo','usuario','estado','notificacion','acciones'];
  private readonly COLS_ADMIN: ColKey[]         = ['codigo','fecha','tipo','titulo','usuario','estado','notificacion','acciones'];

  get columns(): ColKey[] {
    switch (this.rol) {
      case 'Administrador': return this.COLS_ADMIN;
      case 'Bibliotecario': return this.COLS_BIBLIOTECARIO;
      default:              return this.COLS_USUARIO;
    }
  }

  // Acciones por rol
  get accionesFila(): Accion[] {
    switch (this.rol) {
      case 'Administrador': return ['ver', 'actualizar','descargar'];
      case 'Bibliotecario': return ['ver', 'actualizar','descargar'];
      default:              return ['ver', 'cancelar', 'descargar']; // Usuario
    }
  }

  // ======== Filtros ========
  estadoFiltro: Estado | 'Todas' = 'Activa';
  fechaFiltro = ''; // yyyy-mm-dd

  // ======== Carga ========
  cargando = false;
  error: string | null = null;

  // ======== Datos (demo local) ========
reservas: Reserva[] = [
  { id:'1',  codigo:'RE001',fecha:'2025-08-09',fechaExpiracion:'2025-08-16',notificado:false,fechaNotificacion:null,tipo:'Libro',titulo:'Cien años de soledad',estado:'Activa',
    portadaUrl: 'https://www.rae.es/sites/default/files/portada_cien_anos_de_soledad_0.jpg'
  },
  {
    id:'2',codigo:'RE002',fecha:'2025-08-11',fechaExpiracion:'2025-08-18',notificado:true,fechaNotificacion:'2025-08-12',tipo:'Libro',titulo:'Otro título',estado:'Pendiente',
    portadaUrl: 'https://edit.org/images/cat/portadas-libros-big-2019101610.jpg'
  },
];

  // ======== Selección / Modales ========
  seleccion: Reserva | null = null;
  mostrarConfirmar = false;

  // ======== Paginación (cliente) ========
  pageIndex = 1; // 1-based
  pageSize  = 5;

  get filtrada() {
    return this.reservas.filter(r =>
      (this.estadoFiltro === 'Todas' || r.estado === this.estadoFiltro) &&
      (!this.fechaFiltro || r.fecha === this.fechaFiltro)
    );
  }
  get totalPages() { return Math.max(1, Math.ceil(this.filtrada.length / this.pageSize)); }
  get pageStart()  { return (this.pageIndex - 1) * this.pageSize; }
  get pageEnd()    { return this.pageStart + this.pageSize; }
  get lista()      { return this.filtrada.slice(this.pageStart, this.pageEnd); }
  get pages() {
    const out: number[] = [];
    const total = this.totalPages;
    let start = Math.max(1, this.pageIndex - 2);
    let end   = Math.min(total, start + 4);
    start = Math.max(1, end - 4);
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  }
  goToPage(n: number) { if (n < 1 || n > this.totalPages) return; this.pageIndex = n; }
  prev()              { this.goToPage(this.pageIndex - 1); }
  next()              { this.goToPage(this.pageIndex + 1); }

  // ======== Ciclo de vida ========
  ngOnInit() { this.cargar(); }

  private get scope() {
    // Ajusta a tu backend:
    // - Usuario        -> solo sus reservas
    // - Bibliotecario  -> su sede/biblioteca
    // - Administrador  -> todas
    switch (this.rol) {
      case 'Administrador': return 'all';
      case 'Bibliotecario': return 'branch';
      default:              return 'mine';
    }
  }

  cargar() {
    this.cargando = true; this.error = null;
    this.http.get<Reserva[]>(`${API}/reservas?scope=${this.scope}`).subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length) this.reservas = data;
        this.pageIndex = 1;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.error = 'No se pudieron cargar las reservas (mostrando datos de prueba).';
      },
    });
  }

  // ======== Filtros ========
  cambiarEstado(val: string) { this.estadoFiltro = val as any; this.pageIndex = 1; }
  cambiarFecha(val: string)  { this.fechaFiltro  = val;        this.pageIndex = 1; }

  verDetalle(r: Reserva)     { this.seleccion = r; }
  pedirCancelar(r: Reserva)  { this.seleccion = r; this.mostrarConfirmar = true; }

  cancelar() {
    if (!this.seleccion) return;
    // Llamada real:
    // this.http.post(`${API}/reservas/${this.seleccion.id}/cancel`, {}).subscribe({
    //   next: () => { this.seleccion!.estado = 'Cancelada'; this.cerrarTodo(); },
    //   error: () => alert('No se pudo cancelar')
    // });
    // Demo local:
    this.seleccion.estado = 'Cancelada';
    this.cerrarTodo();
  }
abrirCalendario(el: HTMLInputElement) {
  if ((el as any).showPicker) { (el as any).showPicker(); }
  else { el.focus(); el.click(); }
}

actualizar(r: any) {
  sessionStorage.setItem('selReserva', JSON.stringify(r));
  this.router.navigate(
    ['/reservas/acciones/actualiza-reserva'],
    { state: { reserva: r }, queryParams: { id: r.id } }
  );
}
  descargar(r: Reserva) {
    // TODO: llamar API para generar/descargar comprobante (PDF)
    // this.http.get(`${API}/reservas/${r.id}/voucher`, { responseType:'blob' }).subscribe(...)
    console.log('Descargar comprobante de', r.id);
  }
  cerrarTodo()    { this.mostrarConfirmar = false; this.seleccion = null; }
  cerrarDetalle() { this.seleccion = null; }
  @HostListener('document:keydown.escape')
  onEsc() { this.cerrarTodo(); }
}
