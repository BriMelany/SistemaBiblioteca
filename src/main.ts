import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './app/core/auth/auth-interceptor';
import { App } from './app/app';
import { routes } from './app/app.routes';

// 🔹 Limpieza de restos antiguos (se ejecuta una vez al cargar la app)
(() => {
  try {
    localStorage.removeItem('auth_user');   // si quedó de versiones previas
    sessionStorage.removeItem('auth_user'); // si lo guardaste accidentalmente
  } catch {}
})();
bootstrapApplication(App, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
  ]
});