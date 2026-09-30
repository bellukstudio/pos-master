"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Card, CardContent } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { TextArea } from "@/components/tailgrids/core/text-area";
import { TextField } from "@/components/tailgrids/core/text-field";
import PageHeader from "@/components/common/page-header";

export default function SettingsPage() {
  return (
    <div className="mt-6 space-y-5">
      <PageHeader title="Pengaturan" description="Konfigurasi umum toko dan preferensi sistem." />

      <div className="grid grid-cols-1 gap-5 px-2 lg:grid-cols-2 lg:px-5">
        <Card>
          <CardContent className="p-0">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Profil Toko</h3>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <TextField className="w-full flex-col gap-1.5">
                <Label>Nama Toko</Label>
                <Input className="w-full px-3 py-2.5 text-sm" />
              </TextField>
              <TextField className="w-full flex-col gap-1.5">
                <Label>Alamat</Label>
                <TextArea
                  className="w-full px-3 py-2.5 text-sm"
                  rows={3}
                />
              </TextField>
              <div className="grid grid-cols-2 gap-4">
                <TextField className="w-full flex-col gap-1.5">
                  <Label>Telepon</Label>
                  <Input className="w-full px-3 py-2.5 text-sm" />
                </TextField>
                <TextField className="w-full flex-col gap-1.5">
                  <Label>Email</Label>
                  <Input className="w-full px-3 py-2.5 text-sm" />
                </TextField>
              </div>
              <Button variant="primary" appearance="fill" size="md" type="submit" className="mt-1 w-fit">
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <h3 className="mb-4 text-base font-semibold text-text-primary">Transaksi & Struk</h3>
            <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-4">
                <TextField className="w-full flex-col gap-1.5">
                  <Label>Mata Uang</Label>
                  <select

                    className="w-full rounded-lg border border-card-border bg-input-background px-3 py-2.5 text-sm text-title-50 outline-none focus:border-input-primary-focus-border focus:ring-4 focus:ring-input-primary-focus-border/20"
                  >
                    <option value="IDR">Rupiah (IDR)</option>
                    <option value="USD">US Dollar (USD)</option>
                  </select>
                </TextField>
                <TextField className="w-full flex-col gap-1.5">
                  <Label>Pajak (PPN)</Label>
                  <Input type="number" className="w-full px-3 py-2.5 text-sm" />
                </TextField>
              </div>
              <TextField className="w-full flex-col gap-1.5">
                <Label>Catatan Kaki Struk</Label>
                <TextArea
                  className="w-full px-3 py-2.5 text-sm"
                  rows={3}
                />
              </TextField>
              <Button variant="primary" appearance="fill" size="md" type="submit" className="mt-1 w-fit">
                Simpan Perubahan
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
