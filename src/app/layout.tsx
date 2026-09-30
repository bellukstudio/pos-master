import Providers from "@/app/providers";
import { cn } from "@/utils/cn";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ThemeProvider } from "next-themes";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistInter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Pos Master",
    default: "Pos Master - Aplikasi Kasir & Manajemen Toko",
  },
  description:
    "Pos Master adalah aplikasi kasir (POS) dan manajemen toko: penjualan, stok, pembelian, member, laporan, hingga multi-cabang dalam satu dashboard.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Diisi oleh proxy.ts di setiap request (lihat lib/server/csp.ts).
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      suppressHydrationWarning
      lang="id"
      className={cn("h-full overflow-hidden antialiased", geistInter.className)}
    >
      <body className="h-full overflow-hidden bg-background-gray-secondary_alt_2">
        {/*
          next-themes menyisipkan <script> SENDIRI (di luar Next) untuk mencegah flash
          tema sebelum hydrate. Tanpa nonce ini, script tsb diblokir oleh CSP strict-dynamic.
          Cek versi next-themes di node_modules mendukung prop "nonce" (v0.3+). Kalau versi
          Anda tidak mendukungnya, lihat catatan hash SHA-256 di lib/server/csp.ts.
        */}
        <ThemeProvider defaultTheme="light" enableSystem nonce={nonce}>
          <Providers>{children}</Providers>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}