// src/app/core/auth/auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, map, tap, firstValueFrom } from 'rxjs';

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

  /** Rehidrata tras F5 pidiendo el perfil al backend; no guarda nada en storage */
  async hydrateUser(): Promise<void> {
    if (!this.token || this._user$.value?.nombreCompleto) return;
    const me = await firstValueFrom(this.http.get<SessionUser>(PROFILE_URL));
    // solo en memoria
    this._user$.next({
      id: me.id,
      usuario: me.usuario,
      nombreCompleto: me.nombreCompleto,
      rol: (me.rol ?? 'ESTUDIANTE') as RolBD
    });
  }

  logout() {
    sessionStorage.removeItem(TOKEN_KEY);
    this._user$.next(null);
  }

  hasRole(...roles: (RolBD | string)[]) {
    const mine = (this.role as string).toUpperCase();
    return roles.map(r => (r as string).toUpperCase()).includes(mine);
  }
}
