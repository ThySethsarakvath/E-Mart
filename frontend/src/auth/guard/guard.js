import authService from '../auth.service.js';

export function authGuard(to, from, next) {
  const isAuthenticated = authService.isAuthenticated();

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if route requires auth and user is not logged in
    next('/login');
  } else if (to.meta.guestOnly && isAuthenticated) {
    // Redirect to home if route is for guests only and user is logged in
    next('/');
  } else {
    next();
  }
}
