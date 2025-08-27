import { inject } from '@angular/core';
import { ActivatedRouteSnapshot,CanActivateFn,Router,RouterStateSnapshot,UrlTree} from '@angular/router';
import { AuthService, RolBD } from './core/auth/auth';

// helper: toma el snapshot más profundo (ruta hija real a cargar)
function getDeepest(s: ActivatedRouteSnapshot): ActivatedRouteSnapshot {
  while (s.firstChild) s = s.firstChild;
  return s;
}
export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } });
  }

  if (!auth.currentUser) {
    try { await auth.hydrateUser(); }
    catch { return router.createUrlTree(['/login'], { queryParams: { redirect: state.url } }); }
  }

  const deepest = getDeepest(state.root);
  const roles = (deepest.data?.['roles'] as (RolBD | string)[]) ?? [];

  if (roles.length && !auth.hasRole(...roles)) {
    return router.createUrlTree(['/forbidden']);
  }
  return true;
};
