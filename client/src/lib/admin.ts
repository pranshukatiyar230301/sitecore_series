const TOKEN_KEY = "ss_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("admin-auth-changed"));
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("admin-auth-changed"));
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}
