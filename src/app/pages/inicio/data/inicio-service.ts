import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface EstadisticasGenerales {
  cantidadUsuariosActivos: number;
  cantidadRecursosTotales: number;
  cantidadMultasPendientes: number;
}


@Injectable({
  providedIn: 'root'
})
export class InicioService {

  private apiUrl = 'http://localhost:8080/estadisticas/generales';

  constructor(private http: HttpClient) {}

  getEstadisticasGenerales(): Observable<EstadisticasGenerales> {
    return this.http.get<EstadisticasGenerales>(this.apiUrl);
  }
  
}
