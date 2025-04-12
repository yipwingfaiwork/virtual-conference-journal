
// This file re-exports functions from auth-service.ts for compatibility
import { AuthService, getAuthenticatedUser, getCachedUser } from '../services/auth-service';

export const login = AuthService.login;
export const logout = AuthService.logout;
export const getCurrentUser = getAuthenticatedUser;
export { getCachedUser };
export const isAuthenticated = AuthService.isAuthenticated;
