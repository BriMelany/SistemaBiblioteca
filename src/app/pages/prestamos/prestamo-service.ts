import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrestamoModel } from '../model/prestamo-model';
import { PrestamoDetalle } from '../model/prestamo-detalle';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataInit } from '../model/data-init';
import { Bibliotecario } from '../model/bibliotecarios';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private apiUrl= 'http://localhost:8080/prestamos';

  constructor(private http: HttpClient) {
   }

  listarPrestamo(): Observable<PrestamoModel[]> {
    return this.http.get<PrestamoModel[]>(`${this.apiUrl}/listar`);
  }

  listarFiltrarPrestamo(params: any): Observable<PrestamoModel[]> {
  let httpParams = new HttpParams();

  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      httpParams = httpParams.set(key, String(params[key]));
    }
  });
  
  return this.http.get<PrestamoModel[]>(`${this.apiUrl}/filtrados`, { params: httpParams });
}

  
  listarPrestamoDetalle(usuarioId: number | string): Observable<PrestamoDetalle[]> {
    return this.http.get<PrestamoDetalle[]>(`${this.apiUrl}/listardetalle/${usuarioId}`);
  }

  
  listarPrestamoDetalleFiltrado(usuarioId: number | string , filtros: any): Observable<PrestamoDetalle[]> {
  let params = new HttpParams();

  Object.keys(filtros).forEach(key => {
    if (filtros[key]) {
      params = params.set(key, filtros[key]);
    }
  });

  return this.http.get<PrestamoDetalle[]>(
    `${this.apiUrl}/listardetallefiltrado/${usuarioId}`,
    { params }
  );
  }

  private getDataInit(): Observable<DataInit> {
  return this.http.get<DataInit>(`${this.apiUrl}/datainit`);
  }

  listarBibliotecarios(): Observable<Bibliotecario[]> {
  return this.getDataInit().pipe(
    map(data => data.bibliotecarios)
  );
  }

   listarEstados(): Observable<string[]> {
  return this.getDataInit().pipe(
    map(data => data.estados)
  );
  }

}



  
