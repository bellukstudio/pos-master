export const LEGACY_COOKIE_NAME = "pm_token";
export const LEGACY_REFRESH_COOKIE_NAME = "pm_refresh_token";

/**
 * Di production memakai awalan __Host-: browser memaksa Secure + Path=/ + tanpa Domain,
 * sehingga cookie tidak bisa ditimpa dari subdomain lain.
 * Bisa dioverride lewat env SESSION_COOKIE_NAME (hapus env itu di production agar prefix aktif).
 */
export const SESSION_COOKIE_NAME =
    process.env.SESSION_COOKIE_NAME ??
    (process.env.NODE_ENV === "production" ? "__Host-pm_token" : LEGACY_COOKIE_NAME);

export const REFRESH_COOKIE_NAME =
    process.env.REFRESH_COOKIE_NAME ??
    (process.env.NODE_ENV === "production" ? "__Host-pm_refresh_token" : LEGACY_REFRESH_COOKIE_NAME);