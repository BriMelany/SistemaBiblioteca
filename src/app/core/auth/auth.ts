// src/app/core/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, tap, firstValueFrom , of} from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { catchError } from 'rxjs/operators';


export type RolBD = 'ADMINISTRADOR' | 'PROFESOR' | 'ESTUDIANTE' | 'BIBLIOTECARIO';
export interface SessionUser { id?: number | string; usuario?: string; nombreCompleto?: string; rol: RolBD; }

const TOKEN_KEY = 'auth_token'; 
const PROFILE_URL = '/auth/me'; 

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user$ = new BehaviorSubject<SessionUser | null>(null);
  readonly user$ = this._user$.asObservable();

  get currentUser() { return this._user$.value; }
  get role(): RolBD { return this.currentUser?.rol ?? 'ESTUDIANTE'; }
  get token() { return sessionStorage.getItem(TOKEN_KEY); }
  get isLoggedIn() { return !!this.token; }

  login(usuario: string, password: string) {
  return this.http.post<any>('/auth/login', { usuario, password }, { observe: 'response' }).pipe(
    tap(async (resp: HttpResponse<any>) => {
      const raw = resp.headers.get('Authorization') ?? resp.headers.get('authorization') ?? '';
      const token = raw.replace(/Bearer\s+/i, '').replace(/^"+|"+$/g, '').trim();
      if (!token) throw { error: { codigo: 'TOKEN_NO_ENTREGADO' } };
      sessionStorage.setItem(TOKEN_KEY, token);

      //llama a hydrateUser inmediatamente después de loguear
      await this.hydrateUser();
    }),
    map(r => r.body)
  );
}
  async hydrateUser(): Promise<void> {
    if (!this.token || this._user$.value?.nombreCompleto) return;
    const me = await firstValueFrom(this.http.get<SessionUser>(PROFILE_URL));
    this._user$.next({
      id: me.id,
      usuario: me.usuario,
      nombreCompleto: me.nombreCompleto,
      rol: (me.rol ?? 'ESTUDIANTE') as RolBD
    });
  }

logout(): void {
  const token = this.token;
  sessionStorage.removeItem(TOKEN_KEY);
  this._user$.next(null);
  sessionStorage.removeItem('reserva_edit');
  if (!token) return;
  this.http.post('/auth/logout', {}, {
    headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
  })
  .pipe(
    catchError(() => of(null))
  )
  .subscribe();
}

  hasRole(...roles: (RolBD | string)[]) {
    const mine = (this.role as string).toUpperCase();
    return roles.map(r => (r as string).toUpperCase()).includes(mine);
  }
}
