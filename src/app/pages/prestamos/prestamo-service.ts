import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PrestamoModel } from './model/prestamos/prestamo-model';
import { PrestamoDetalle } from './model/prestamos/prestamo-detalle';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataInit } from './model/prestamos/data-init';
import { Bibliotecario } from './model/prestamos/bibliotecarios';
import { PrestamoRecurso } from './model/prestamos/prestamo-recurso';
import { DataUsuario } from './model/prestamos/data-usuario';
import { DataUsuarioMultas } from './model/prestamos/data-usuario-multas';
import { Ejemplar } from './model/prestamos/ejemplar';
import { PrestamoResponse } from './model/prestamos/prestamo-errormessage';
import { PrestamoCreate } from './model/prestamos/prestamo-create';
import { ReservaDetalle } from './model/reservas/reserva-detallle';

@Injectable({
  providedIn: 'root'
})
export class PrestamoService {

  private apiUrl= 'http://localhost:8080/prestamos';

  constructor(private http: HttpClient) {
   }


 // Prestamos-paginaPrincipal
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

   listarEstadosLibros(): Observable<string[]> {
  return this.getDataInit().pipe(
    map(data => data.estados)
  );
  }

 // Nuevo Prestamo sin Reserva 
  getPrestamosRecurso(recursoId: number): Observable<PrestamoRecurso>{
    return this.http.get<PrestamoRecurso>(`${this.apiUrl}/nuevo/sinre/${recursoId}`);
  }

  
  getEstadosPrestamo(recursoId: number): Observable<string[]> {
    return this.getPrestamosRecurso(recursoId).pipe(
      map(resp => resp.estadosPrestamo)
    );
  }

  
  getTiposRecurso(recursoId: number): Observable<string[]> {
    return this.getPrestamosRecurso(recursoId).pipe(
      map(resp => resp.tiposRecurso)
    );
  }

   getDataUser(nroDocumento: string): Observable<DataUsuarioMultas>{
    return this.http.get<DataUsuarioMultas>(`${this.apiUrl}/nuevo/sinre/datauser/${nroDocumento}`);
  }

  
  getUsuario(nroDocumento: string): Observable<DataUsuario> {
    return this.getDataUser(nroDocumento).pipe(
      map(resp => resp.DataUsuario)
    );
  }

  
  getMultas(nroDocumento: string): Observable<number[]> {
    return this.getDataUser(nroDocumento).pipe(
      map(resp => resp.Multas)
    );
  }

  getEjemplar(codigoBarras: string): Observable<Ejemplar> {
    return this.http.get<Ejemplar>(`${this.apiUrl}/nuevo/ejemplar/${codigoBarras}`);
  }

  
  getListadoEjemplares(recursoId: number): Observable<Ejemplar[]> {
    return this.http.get<Ejemplar[]>(`${this.apiUrl}/nuevo/listadoejem/${recursoId}`);
  }

  crearPrestamo(request: PrestamoCreate): Observable<PrestamoResponse> {
    return this.http.post<PrestamoResponse>(`${this.apiUrl}/crear`, request);
  }


  // Nuevo Prestamo con Reserva

   getReservaDetalle(reservaId: number): Observable<ReservaDetalle> {
    return this.http.get<ReservaDetalle>(`${this.apiUrl}/nuevo/reserva/${reservaId}`);
  }

  // Devolucion de Prestamo

  devolverPrestamo(prestamoId: number): Observable<void | PrestamoResponse> {
  return this.http.post<void | PrestamoResponse>(`${this.apiUrl}/devolucion/${prestamoId}`,null);
  }

}



  
