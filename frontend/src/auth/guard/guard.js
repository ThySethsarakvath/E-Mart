import authService from '../auth.service.js';

export function authGuard(to, from, next) {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  // 1. Check Admin Access
  // If the route requires admin rights and the user isn't an admin, kick them to home
  if (to.meta.requiresAdmin && !isAdmin) {
    return next('/');
  }

  // 2. Check Authentication
  // If the route requires auth and the user isn't logged in, send them to login
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  // 3. Guest-Only Routes (Login/Register)
  // If a logged-in user tries to access guest-only pages:
  if (to.meta.guestOnly && isAuthenticated) {
    if (isAdmin) {
      // Admins go to their dashboard
      return next('/admin/dashboard');
    } else {
      // Regular users go to home
      return next('/');
    }
  }

  // 4. Proceed as normal
  next();
}
