// Tempel/merge fungsi headers() ini ke next.config.ts Anda yang sudah ada.
// JANGAN menimpa next.config.ts sepenuhnya dengan file ini - saya tidak punya isi
// aslinya (images.domains, transpilePackages, dll bila ada), jadi gabungkan manual.

const securityHeaders = [
    // CSP TIDAK diletakkan di sini karena butuh nonce acak per request -> lihat proxy.ts.
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Defense-in-depth untuk browser lama yang belum baca frame-ancestors di CSP.
    { key: "X-Frame-Options", value: "DENY" },
    {
        key: "Permissions-Policy",
        // Nonaktifkan API browser yang tidak dipakai aplikasi ini sama sekali.
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    },
    ...(process.env.NODE_ENV === "production"
        ? [
            {
                key: "Strict-Transport-Security",
                // 2 tahun + subdomain + preload. Hanya aktifkan setelah YAKIN semua subdomain
                // (kalau ada) juga selalu HTTPS - HSTS preload sulit dibatalkan.
                value: "max-age=63072000; includeSubDomains; preload",
            },
        ]
        : []),
];

// Di dalam objek config Next.js Anda:
async function headers() {
    return [
        {
            source: "/:path*",
            headers: securityHeaders,
        },
    ];
}