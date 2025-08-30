import { Routes } from '@angular/router';
import { authGuard } from './auth-guard'; 

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Público (antes de login)
  {
    path: '',
    loadComponent: () => import('./layouts/public/public').then(m => m.PublicComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
      {path: 'login/registro',loadComponent: () => import('./pages/login/form-registro/form-registro').then(m => m.FormRegistro)},
      {path: 'login/recuperar',loadComponent: () => import('./pages/login/form-recuperar/form-recuperar').then(m => m.FormRecuperar)},
    ]
  },

  // App (después de login)
  {
    path: '',
    loadComponent: () => import('./layouts/app/app').then(m => m.AppComponentLayout),
    canActivate: [authGuard],// protege todo lo de abajo
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },//logueado: manda a inicio
      { path: 'inicio',    loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio) },
      { path: 'catalogo',  loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo) },
      { path: 'reservas',  loadComponent: () => import('./pages/reservas/reservas').then(m => m.Reservas) },
      { path: 'prestamos', loadComponent: () => import('./pages/prestamos/prestamo/prestamo').then(m => m.PrestamoComponent) },
      { path: 'prestamos/generar-prestamo-sinreserva', loadComponent: () => import('./pages/prestamos/generar-prestamo-sinreserva/generar-prestamo-sinreserva').then(m => m.GenerarPrestamoSinreserva) },
      { path: 'prestamos/generar-prestamo-conreserva', loadComponent: () => import('./pages/prestamos/generar-prestamo-conreserva/generar-prestamo-conreserva').then(m => m.GenerarPrestamoConreserva) },
      { path: 'prestamos/registrar-devolucion', loadComponent: () => import('./pages/prestamos/registrar-devolucion/registrar-devolucion').then(m => m.RegistrarDevolucion) },
      { path: 'multas', data: { roles: ['ADMINISTRADOR','BIBLIOTECARIO'] },loadComponent: () => import('./pages/multas/multas').then(m => m.Multas)},
      { path: 'usuarios', data: { roles: ['ADMINISTRADOR'] },  loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.Usuarios),},
      { path: 'catalogo/acciones/editar-recurso', loadComponent: () =>import('./pages/catalogo/acciones/editar-recurso/editar-recurso').then(m => m.EditarRecurso)},
      { path: 'catalogo/acciones/nuevo-recurso', loadComponent: () =>import('./pages/catalogo/acciones/nuevo-recurso/nuevo-recurso').then(m => m.NuevoRecurso)},
      { path: 'catalogo/acciones/registrar-ejemplar', loadComponent: () =>import('./pages/catalogo/acciones/registrar-ejemplar/registrar-ejemplar').then(m => m.RegistrarEjemplar)},
      { path: 'reservas/acciones/registra-reserva', loadComponent: () =>import('./pages/reservas/acciones/registra-reserva/registra-reserva').then(m => m.RegistraReserva)},
      { path: 'reservas/acciones/actualiza-reserva/:id',  loadComponent: () => import('./pages/reservas/acciones/actualiza-reserva/actualiza-reserva').then(m => m.ActualizaReserva)},
      { path: 'multas/acciones/configuracion', loadComponent: () =>import('./pages/multas/acciones/configuracion/configuracion').then(m => m.Configuracion)},
      { path: 'usuarios/acciones/editar',  loadComponent: () => import('./pages/usuarios/acciones/editar-usuario/editar-usuario').then(m => m.EditarUsuario)},
    ]
  },

  { path: '**', redirectTo: 'login' }
];
