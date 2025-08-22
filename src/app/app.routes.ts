import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Público (antes de login)
  {
    path: '',
    loadComponent: () => import('./layouts/public/public').then(m => m.PublicComponent),
    children: [
      { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) }
    ]
  },

  // App (después de login)
  {
    path: '',
    loadComponent: () => import('./layouts/app/app').then(m => m.AppComponentLayout),
    children: [
      { path: 'inicio',    loadComponent: () => import('./pages/inicio/inicio').then(m => m.Inicio) },
      { path: 'catalogo',  loadComponent: () => import('./pages/catalogo/catalogo').then(m => m.Catalogo) },
      { path: 'reservas',  loadComponent: () => import('./pages/reservas/reservas').then(m => m.Reservas) },
      { path: 'prestamos', loadComponent: () => import('./pages/prestamos/prestamos').then(m => m.Prestamos) },
      { path: 'multas',    loadComponent: () => import('./pages/multas/multas').then(m => m.Multas)},
      { path: 'usuarios',  loadComponent: () => import('./pages/usuarios/usuarios').then(m => m.Usuarios),},
      { path: 'reservas/acciones/registra-reserva', loadComponent: () =>import('./pages/reservas/acciones/registra-reserva/registra-reserva').then(m => m.RegistraReserva)},
      { path: 'reservas/acciones/actualiza-reserva', loadComponent: () =>import('./pages/reservas/acciones/actualiza-reserva/actualiza-reserva').then(m => m.ActualizaReserva)},
      { path: 'multas/acciones/configuracion', loadComponent: () =>import('./pages/multas/acciones/configuracion/configuracion').then(m => m.Configuracion)},
      { path: 'usuarios/acciones/editar',  loadComponent: () => import('./pages/usuarios/acciones/editar-usuario/editar-usuario').then(m => m.EditarUsuario)},
    ]
  },

  { path: '**', redirectTo: 'login' }
];
