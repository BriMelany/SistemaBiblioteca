// src/app/pages/reservas/data/reservas.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, filter, take } from 'rxjs/operators';
import { AuthService, SessionUser } from '../../../core/auth/auth';
import { ReservaModel } from '../model/reserva-model';
import { ReservaDetalle } from '../model/reserva-detalle';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private apiUrl = 'http://localhost:8080';
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  private mapApiToModel = (row: any): ReservaModel => ({
    id: Number(row?.reservaId ?? row?.id ?? 0),
    fechaReserva: String(row?.fechaReserva ?? row?.fecha ?? ''),
    fechaExpiracion: String(row?.fechaExpiracion ?? ''),
    recurso: String(row?.tituloRecurso ?? row?.titulo ?? ''),
    tipoRecurso: String(row?.tipoRecursoNombre ?? row?.tipo ?? ''),
    estado: String(row?.estado ?? ''),
    usuario: String(row?.usuarioNombre ?? row?.nombreUsuario ?? row?.usuario ?? ''),
    notificado: Boolean(row?.notificado),
    notificadoPor: String(row?.notificadoPor ?? ''),
    fechaNotificacion: row?.fechaNotificacion ?? null,
    penalidades: row?.usuarioConDeudas ?? '—'
  });

  // ---------- API ----------
  listar(): Observable<ReservaModel[]> {
    return this.http.get<any>(`${this.apiUrl}/reservas/listar`).pipe(
      map(res => Array.isArray(res) ? res : (res?.data ?? res?.items ?? res?.rows ?? [])),
      map((arr: any[]) => arr.map(this.mapApiToModel))
    );
  }

  // Previsualizar reserva antes de crear
  previsualizarPorListar(recursoId: number): Observable<ReservaModel | null>;
  previsualizarPorListar(usuarioId: number, recursoId: number): Observable<ReservaModel | null>;
  previsualizarPorListar(a: number, b?: number): Observable<ReservaModel | null> {
    const recursoId = Number(b ?? a);
    const usuarioIdOverride = b ? Number(a) : undefined;

    return this.requireUser().pipe(
      switchMap(u => {
        const usuarioId = Number(usuarioIdOverride ?? u.id);
        const params = new HttpParams()
          .set('usuarioId', String(usuarioId))
          .set('recursoId', String(recursoId));

        return this.http.get<any[]>(`${this.apiUrl}/reservas/listar`, { params });
      }),
      map(arr => (Array.isArray(arr) && arr.length ? this.mapApiToModel(arr[0]) : null))
    );
  }

  crearReserva(recursoId: number, usuarioIdOverride?: number | string): Observable<any> {
    return this.requireUser().pipe(
      switchMap(u => {
        const usuarioId = Number(usuarioIdOverride ?? u.id);
        const body = { recursoId: Number(recursoId), usuarioId };
        return this.http.post(`${this.apiUrl}/reservas/crear`, body, {
          headers: { 
            Authorization: `Bearer ${this.auth.token}`,
            'Content-Type': 'application/json'
          }
        });
      })
    );
  }

  cancelarReserva(reservaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/cancelar/${reservaId}`, {}, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  aprobarReserva(reservaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/aprobar/${reservaId}`, {}, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  rechazarReserva(reservaId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservas/rechazar/${reservaId}`, {}, {
      headers: { Authorization: `Bearer ${this.auth.token}` }
    });
  }

  getDetalle(id: number): Observable<ReservaDetalle[]> {
    return this.http.get<ReservaDetalle[]>(`${this.apiUrl}/reservas/${id}/detalle`);
  }

  descargarVoucher(reservaId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reservas/${reservaId}/voucher`, { responseType: 'blob' });
  }

  getRecurso(recursoId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/recursos/${recursoId}`);
  }

  // ---------- auth helper ----------
  private requireUser(): Observable<SessionUser> {
    if (this.auth.currentUser) return of(this.auth.currentUser as SessionUser);
    if (!this.auth.isLoggedIn) return throwError(() => new Error('NO_TOKEN'));
    return this.auth.user$.pipe(filter((u): u is SessionUser => !!u), take(1));
  }
}
