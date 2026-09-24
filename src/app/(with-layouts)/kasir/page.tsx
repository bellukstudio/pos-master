"use client";

import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import formatCurrency from "@/utils/format-currency";
import * as React from "react";

interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

const CATEGORIES = ["Semua", "Sembako", "Minuman", "Kebersihan", "ATK"];

const CATALOG: CatalogProduct[] = [
  { id: "1", name: "Indomie Goreng", category: "Sembako", price: 3500, stock: 240 },
  { id: "2", name: "Aqua Botol 600ml", category: "Minuman", price: 4000, stock: 180 },
  { id: "3", name: "Kopi Kapal Api", category: "Minuman", price: 2000, stock: 12 },
  { id: "4", name: "Sabun Lifebuoy", category: "Kebersihan", price: 4500, stock: 0 },
  { id: "5", name: "Beras Premium 5kg", category: "Sembako", price: 72000, stock: 34 },
  { id: "6", name: "Buku Tulis", category: "ATK", price: 3000, stock: 96 },
  { id: "7", name: "Teh Botol Sosro", category: "Minuman", price: 5000, stock: 8 },
  { id: "8", name: "Minyak Goreng 2L", category: "Sembako", price: 34000, stock: 51 },
  { id: "9", name: "Pulpen Standard", category: "ATK", price: 2500, stock: 120 },
  { id: "10", name: "Sabun Cuci Piring", category: "Kebersihan", price: 6000, stock: 40 },
];

interface CartItem extends CatalogProduct {
  qty: number;
}

export default function KasirPage() {
  const [activeCategory, setActiveCategory] = React.useState("Semua");
  const [search, setSearch] = React.useState("");
  const [cart, setCart] = React.useState<CartItem[]>([]);

  const filtered = CATALOG.filter(
    (p) =>
      (activeCategory === "Semua" || p.category === activeCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase()),
  );

  function addToCart(product: CatalogProduct) {
    if (product.stock === 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
  }

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = Math.round(subtotal * 0.11);
  const total = subtotal + tax;

  return (
    <div className="mt-6 flex h-[calc(100%-1.5rem)] flex-col gap-5 px-2 lg:flex-row lg:px-5">
      {/* Product catalog */}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div>
          <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Kasir</h1>
          <p className="text-sm leading-5 text-text-tertiary">
            Pilih produk untuk ditambahkan ke keranjang transaksi.
          </p>
        </div>

        <Input
          placeholder="Cari produk atau scan barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 text-sm"
        />

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                cat === activeCategory
                  ? "rounded-full bg-[#5750F1] px-3.5 py-1.5 text-sm font-medium text-white"
                  : "rounded-full border border-card-border px-3.5 py-1.5 text-sm font-medium text-text-secondary hover:bg-background-gray-secondary_alt"
              }
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pb-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
              className="flex flex-col items-start gap-2 rounded-xl border border-card-border bg-card-background p-3.5 text-left transition hover:border-[#5750F1] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="flex h-16 w-full items-center justify-center rounded-lg bg-background-gray-secondary_alt text-2xl">
                🛒
              </div>
              <p className="line-clamp-2 text-sm font-medium text-text-primary">{product.name}</p>
              <p className="text-sm font-semibold text-[#5750F1]">{formatCurrency(product.price)}</p>
              {product.stock === 0 ? (
                <Badge color="error" size="sm" className="px-2">
                  Stok Habis
                </Badge>
              ) : (
                <span className="text-xs text-text-tertiary">Stok: {product.stock}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cart panel */}
      <Card className="flex w-full flex-col p-0 lg:w-96">
        <div className="border-b border-card-border p-4">
          <h2 className="text-base font-semibold text-text-primary">Keranjang</h2>
          <p className="text-xs text-text-tertiary">{cart.length} jenis produk</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <p className="py-10 text-center text-sm text-text-tertiary">Keranjang masih kosong.</p>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-text-primary">{item.name}</p>
                  <p className="text-xs text-text-tertiary">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="flex size-6 items-center justify-center rounded-md border border-card-border text-sm hover:bg-background-gray-secondary_alt"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-medium">{item.qty}</span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="flex size-6 items-center justify-center rounded-md border border-card-border text-sm hover:bg-background-gray-secondary_alt"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-1 text-xs text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 border-t border-card-border p-4">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Pajak (11%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold text-text-primary">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button
            variant="primary"
            appearance="fill"
            size="md"
            isDisabled={cart.length === 0}
            className="w-full"
          >
            Bayar
          </Button>
        </div>
      </Card>
    </div>
  );
}
