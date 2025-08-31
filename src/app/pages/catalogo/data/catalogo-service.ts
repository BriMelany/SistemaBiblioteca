import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CatalogoApi } from '../models/catalogo-api';
import { CatalogoVista } from '../models/catalogo-vista';

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private apiUrl = 'http://localhost:8080/recursos';

  constructor(private http: HttpClient) {}

  // listar (POST vacio, backend espera POST)
  listarCatalogo(): Observable<CatalogoVista[]> {
    return this.http.post<CatalogoApi[]>(`${this.apiUrl}/listar`, {})
      .pipe(
        map(apiData => this.mapToView(apiData)),
      );
  }

  // listar con filtros (en body, no params)
  listarFiltrado(filtros: any): Observable<CatalogoVista[]> {
    const body = filtros ?? {}; // envía {} si no hay filtros
    return this.http.post<CatalogoApi[]>(`${this.apiUrl}/listar`, body)
      .pipe(
        tap(apiData => console.log('API bruto listarFiltrado:', apiData)),
        map(apiData => this.mapToView(apiData))
      );
  }

  private mapToView(apiData: CatalogoApi[]): CatalogoVista[] {
    if (!Array.isArray(apiData)) return [];
    return apiData.map(item => ({
      id: item.id,
      tipo: item.nombreTipo ?? '',
      titulo: item.titulo ?? '',
      autor: item.autores ?? '',
      editorial: item.nombreEditorial ?? '',
      anio: typeof item.anoPublicacion === 'number'
             ? item.anoPublicacion
             : Number(item.anoPublicacion) || 0,
      isbn: item.isbnIssn ?? '',
      categoria: item.nombreGenero ?? '',
      subtitulo: item.subtitulo ?? undefined,
      descripcion: item.descripcion ?? undefined,
      fecha_ingreso: item.fechaIngreso ? new Date(item.fechaIngreso) : undefined,
      ejemplares: item.cantidadEjemplares ?? undefined,
      es_consulta_sala: item.esConsultaSala ?? false,
      portadaUrl: item.pathImagen ?? undefined,
      estado: item.estado ?? undefined
    }));
  }
}
