"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Checkbox } from "@/components/tailgrids/core/checkbox";
import { FieldError } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "@/components/tailgrids/core/input-group";
import { Label } from "@/components/tailgrids/core/label";
import { TextField } from "@/components/tailgrids/core/text-field";
import { BrandLogo } from "@/utils/brand";
import { Eye, EyeDisabled } from "@tailgrids/icons";
import { useLogin } from "@/hooks/api/use-auth";
import { isApiError, toUserMessage } from "@/lib/api/errors";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as React from "react";

function formString(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value : "";
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const loginMutation = useLogin();
  const isSubmitting = loginMutation.isPending;

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    loginMutation.mutate(
      { email: formString(form.get("email")), password: formString(form.get("password")) },
      {
        onSuccess: () => {
          // Hanya izinkan path internal (anti open-redirect).
          const next = new URLSearchParams(window.location.search).get("next");
          router.replace(next && next.startsWith("/") && !next.startsWith("//") ? next : "/");
          router.refresh();
        },
        onError: (err) => {
          // 401/429 dari login membawa pesan spesifik (mis. "Email atau password salah.").
          const useServerMessage = isApiError(err) && [401, 429].includes(err.status) && err.message;
          toast.error(useServerMessage ? err.message : toUserMessage(err));
        },
      },
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background-gray-secondary_alt_2">
      {/* Left: brand panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#322E8B] p-12 text-white lg:flex">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, #5750F1 0%, transparent 55%), radial-gradient(circle at 80% 80%, #5750F1 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <BrandLogo />
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <h2 className="text-3xl leading-tight font-semibold">
            Kelola kasir, stok, dan penjualan tokomu dalam satu dashboard.
          </h2>
          <ul className="space-y-3 text-sm text-white/80">
            <li className="flex items-center gap-2.5">
              <span className="size-1.5 shrink-0 rounded-full bg-white" />
              <p> Transaksi kasir cepat, multi-cabang</p>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="size-1.5 shrink-0 rounded-full bg-white" />
              <p>
                Pantau stok, mutasi, dan retur barang
              </p>
            </li>
            <li className="flex items-center gap-2.5">
              <span className="size-1.5 shrink-0 rounded-full bg-white" />
              <p>
                Laporan penjualan &amp; keuangan real-time
              </p>
            </li>
          </ul>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          &copy; {new Date().getFullYear()} Pos Master. Semua hak dilindungi.
        </p>
      </div>

      {/* Right: form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 lg:hidden">
          <BrandLogo />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="mb-1.5 text-2xl leading-8 font-semibold text-text-primary">
              Masuk ke akun Anda
            </h1>
            <p className="text-sm leading-5 text-text-tertiary">
              Masukkan email dan kata sandi staf toko Anda untuk melanjutkan.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <TextField className="w-full flex-col gap-1.5" required>
              <Label className="text-sm font-medium text-input-label-text">Email</Label>
              <Input
                type="email"
                name="email"
                placeholder="nama@tokoanda.com"
                autoComplete="username"
                className="w-full px-3 py-2.5 text-sm"
              />
              <FieldError />
            </TextField>

            <TextField className="w-full gap-1.5" required>
              <Label className="text-sm font-medium text-input-label-text">Kata Sandi</Label>
              <InputGroup>
                <InputGroupInput
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan kata sandi"
                  autoComplete="current-password"
                  className="w-full px-3 py-2.5 text-sm"
                />
                <InputGroupButton
                  size="icon-sm"
                  className="mr-1 text-text-secondary hover:text-text-primary"
                  onPress={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeDisabled className="size-5" /> : <Eye className="size-5" />}
                </InputGroupButton>
              </InputGroup>
              <FieldError />
            </TextField>

            <div className="flex items-center justify-between">
              <Checkbox name="remember">
                <span className="text-sm text-text-secondary">Ingat saya</span>
              </Checkbox>
              <a href="#" className="text-sm font-medium text-neutral-brand-color hover:underline">
                Lupa kata sandi?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              appearance="fill"
              size="md"
              isDisabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-text-tertiary">
            Belum punya akun?{" "}
            <span className="font-medium text-text-secondary">
              Hubungi admin toko Anda untuk dibuatkan akun.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}