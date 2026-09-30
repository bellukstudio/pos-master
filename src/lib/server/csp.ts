import "server-only";

/**
 * CSP dibangun per-request (butuh nonce acak), makanya di proxy.ts, bukan next.config.ts
 * yang headernya statis. Nonce yang sama dipakai di dua tempat:
 *  1. Header respons "Content-Security-Policy" -> browser hanya izinkan script bernonce ini.
 *  2. Header request "x-nonce" -> diteruskan ke Server Component, Next otomatis menempelkan
 *     nonce ini ke <script> miliknya sendiri saat mendeteksinya di header CSP respons.
 *
 * Skrip pihak ketiga yang menyisipkan <script> SENDIRI TANPA melalui Next (mis. next-themes,
 * untuk mencegah flash tema sebelum hydrate) TIDAK otomatis mendapat nonce ini. Untuk itu:
 *  - kalau library-nya menerima prop `nonce`, oper nonce yang sama ke situ (lihat layout.tsx)
 *  - kalau tidak, browser akan memblokirnya dan console menampilkan hash SHA-256-nya;
 *    tempel hash itu (format "sha256-....") ke SCRIPT_EXTRA_SOURCES di bawah.
 */
const SCRIPT_EXTRA_SOURCES: string[] = [
    // Contoh setelah cek console (isi hash yang sebenarnya dari devtools bila diperlukan):
    // "'sha256-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX='",
];

export function generateNonce(): string {
    // 16 byte acak -> base64. crypto.randomUUID() TIDAK dipakai di sini karena formatnya
    // (dengan tanda "-") tidak seunik/acak byte-for-byte dan lazim direview sebagai nonce lemah.
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Buffer.from(bytes).toString("base64");
}

export function buildCsp(nonce: string): string {
    const isProd = process.env.NODE_ENV === "production";

    const scriptSrc = [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'", // script yang dimuat OLEH script bernonce ikut dipercaya (chunk loading Next)
        ...SCRIPT_EXTRA_SOURCES,
        // Wajib untuk Fast Refresh/HMR di dev (eval dipakai Turbopack/webpack dev). JANGAN pernah di production.
        !isProd && "'unsafe-eval'",
    ]
        .filter(Boolean)
        .join(" ");

    const directives = [
        `default-src 'self'`,
        `script-src ${scriptSrc}`,
        // 'unsafe-inline' di sini HANYA untuk atribut style="..." (Tailwind arbitrary values,
        // gradient di halaman login, dst). Nonce tidak berlaku untuk atribut style, hanya <style>/<link>.
        `style-src 'self' 'unsafe-inline'`,
        `img-src 'self' data: blob:`,
        // next/font (dipakai untuk Inter) MENG-HOST font sendiri saat build, jadi TIDAK perlu
        // mengizinkan fonts.googleapis.com / fonts.gstatic.com di sini.
        `font-src 'self'`,
        // Semua panggilan API browser hanya ke /api/* (same-origin) lewat proxy - lihat
        // lib/api/http.ts. Tidak ada fetch langsung ke domain lain dari browser.
        `connect-src 'self'`,
        `object-src 'none'`,
        `base-uri 'self'`,
        `form-action 'self'`,
        `frame-ancestors 'none'`, // setara X-Frame-Options: DENY, mencegah clickjacking
        isProd && `upgrade-insecure-requests`,
    ].filter(Boolean);

    return directives.join("; ");
}