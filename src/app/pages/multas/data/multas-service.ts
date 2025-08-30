import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { AuthService, SessionUser } from '../../../core/auth/auth';
import { Multa } from '../model/multa-model';

@Injectable({ providedIn: 'root' })
export class MultasService {
  private apiUrl = 'http://localhost:8080';
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  listar(usuario?: string, estado?: string): Observable<Multa[]> {
    let params = new HttpParams();
    if (usuario) params = params.set('usuario', usuario);
    if (estado) params = params.set('estado', estado);

    return this.http.get<Multa[]>(`${this.apiUrl}/multas/listar`, {
      params,
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }
  pagar(multaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/multas/pagar/${multaId}`, {}, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  condonar(multaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/multas/condonar/${multaId}`, {}, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

 generarMultasRetraso(): Observable<any> {
  console.log('Token que se enviará:', this.auth.token); 
  return this.http.post(`${this.apiUrl}/multas/generar-multas-retraso`, {}, {
    headers: { Authorization: `Bearer ${this.auth.token}` }
  });
}

 obtenerTiposRecurso(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recursos/datafiltros`);
  }

}
