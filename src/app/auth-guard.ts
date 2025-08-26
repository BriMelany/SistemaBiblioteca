
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './core/auth/auth';

export const authGuard: CanActivateFn = async (_r, s) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn) {
    router.navigate(['/login'], { queryParams: { redirect: s.url } });
    return false;
  }

  try {
    await auth.hydrateUser();      // ← pide /auth/me y deja todo en memoria
    return true;
  } catch {
    auth.logout();
    router.navigate(['/login'], { queryParams: { redirect: s.url } });
    return false;
  }
};
