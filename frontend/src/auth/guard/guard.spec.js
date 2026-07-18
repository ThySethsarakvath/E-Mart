import { beforeEach, describe, expect, it, vi } from 'vitest';
import authService from '../auth.service.js';
import { authGuard } from './guard.js';

vi.mock('../auth.service.js', () => ({
  default: {
    isAuthenticated: vi.fn(),
    isAdmin: vi.fn(),
  },
}));

describe('authGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authService.isAuthenticated.mockReturnValue(false);
    authService.isAdmin.mockReturnValue(false);
  });

  it('redirects anonymous users away from protected routes', () => {
    const next = vi.fn();
    authGuard({ meta: { requiresAuth: true } }, {}, next);
    expect(next).toHaveBeenCalledWith('/login');
  });

  it('allows authenticated users through protected routes', () => {
    authService.isAuthenticated.mockReturnValue(true);
    const next = vi.fn();
    authGuard({ meta: { requiresAuth: true } }, {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('prevents non-admin users from opening admin routes', () => {
    authService.isAuthenticated.mockReturnValue(true);
    const next = vi.fn();
    authGuard({ meta: { requiresAdmin: true } }, {}, next);
    expect(next).toHaveBeenCalledWith('/');
  });
});

