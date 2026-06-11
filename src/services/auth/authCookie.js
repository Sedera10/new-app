export const ADMIN_AUTH_COOKIE = "admin_auth";

export function setAdminAuth() {
  document.cookie = `${ADMIN_AUTH_COOKIE}=true; path=/myglpi/admin; SameSite=Strict`;
}

export function removeAdminAuth() {
  document.cookie = `${ADMIN_AUTH_COOKIE}=; path=/myglpi/admin; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Strict`;
}

export function isAdminAuthenticated() {
  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${ADMIN_AUTH_COOKIE}=`));
}