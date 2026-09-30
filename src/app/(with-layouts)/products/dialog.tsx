"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
    Dialog,
    DialogBody,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { FieldError } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import {
    Select,
    SelectContent,
    SelectErrorMessage,
    SelectIndicator,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/tailgrids/core/select";
import { TextField } from "@/components/tailgrids/core/text-field";
import { Toggle } from "@/components/tailgrids/core/toggle";
import { useBranches } from "@/hooks/api/use-branch";
import { useCategoryProducts } from "@/hooks/api/use-category-product";
import type { Product, ProductInput } from "@/services/api/product";
import { productInputSchema, toFieldErrors, type ProductFieldErrors } from "@/services/api/product/validation";
import { useState } from "react";
import type * as React from "react";

/**
 * Bentuk state form. Berbeda dari `ProductInput` (yang dipakai untuk komunikasi ke backend)
 * pada tiga field numerik: input HTML selalu mengetik dalam bentuk STRING (mis. "100", boleh
 * kosong sementara saat user masih mengetik), sedangkan `ProductInput` mewajibkan `number`.
 * `productInputSchema` sudah dibuat memakai `z.coerce.number()` untuk field-field itu, jadi
 * string di sini otomatis dikonversi ke number saat `safeParse` dipanggil pada submit.
 */
interface ProductFormValues {
    name: string;
    description: string;
    image: string;
    status: boolean;
    code: string;
    stock: string;
    unit: string;
    barcode: string;
    purchase_price: string;
    sale_price: string;
    category_id: string;
    branch_id: string;
}

const EMPTY_INPUT: ProductFormValues = {
    name: "",
    description: "",
    image: "",
    status: true,
    code: "",
    stock: "",
    unit: "",
    barcode: "",
    purchase_price: "",
    sale_price: "",
    category_id: "",
    branch_id: "",
};

function toFormValues(product: Product): ProductFormValues {
    return {
        name: product.name,
        description: product.description,
        image: product.image ?? "",
        status: product.status,
        code: product.code,
        stock: String(product.stock),
        unit: product.unit,
        barcode: product.barcode,
        purchase_price: String(product.purchase_price),
        sale_price: String(product.sale_price),
        category_id: product.category.id,
        branch_id: product.branch.id,
    };
}

interface ProductFormDialogProps {

    target: Product | null | undefined;
    isPending: boolean;
    onCancel: () => void;
    onSubmit: (input: ProductInput) => void
}

export function ProductFormDialog({ target, isPending, onCancel, onSubmit }: Readonly<ProductFormDialogProps>) {
    const isOpen = target !== null;
    const isEdit = Boolean(target);

    const [values, setValues] = useState<ProductFormValues>(EMPTY_INPUT);
    const [errors, setErrors] = useState<ProductFieldErrors>({});
    const [openedFor, setOpenedFor] = useState<Product | null | undefined>(null);

    if (isOpen && target !== openedFor) {
        setOpenedFor(target);
        setValues(target ? toFormValues(target) : EMPTY_INPUT);
        setErrors({});
    }


    const categories = useCategoryProducts({ page: 1, per_page: 100 });
    const branches = useBranches({ page: 1, per_page: 100 });

    function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
        setValues((v) => ({ ...v, [key]: value }));

        if (key in errors && errors[key as keyof ProductFieldErrors]) {
            setErrors((e) => ({ ...e, [key]: undefined }));
        }
    }

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();

        const raw = {
            name: values.name,
            description: values.description,
            image: values.image.trim() === "" ? null : values.image.trim(),
            status: values.status,
            code: values.code,
            stock: Number.parseInt(values.stock),
            unit: values.unit,
            barcode: values.barcode,
            purchase_price: Number.parseInt(values.purchase_price),
            sale_price: Number.parseInt(values.sale_price),
            category: { id: values.category_id },
            branch: { id: values.branch_id },
        };

        const parsed = productInputSchema.safeParse(raw);
        if (!parsed.success) {
            setErrors(toFieldErrors(parsed.error));
            return;
        }
        onSubmit(parsed.data);
    };

    return (
        <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <Backdrop isDismissable={!isPending}>
                <Dialog className="max-w-165 p-0">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="border-b border-card-border py-4 pr-14 pl-5">
                            <DialogTitle className="text-xl leading-7">
                                {isEdit ? "Ubah Produk" : "Tambah Produk"}
                            </DialogTitle>
                        </DialogHeader>

                        <DialogBody className="grid max-h-[70vh] grid-cols-1 gap-4 overflow-y-auto px-5 py-4 sm:grid-cols-2">
                            <TextField
                                className="gap-1.5 sm:col-span-2"
                                invalid={!!errors.name}
                                required
                                value={values.name}
                                onChange={(v) => set("name", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Nama Produk</Label>
                                <Input placeholder="mis. Sabun Mandi" className="w-full px-3 py-2.5 text-sm" />
                                <FieldError>{errors.name}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5 sm:col-span-2"
                                invalid={!!errors.description}
                                required
                                value={values.description}
                                onChange={(v) => set("description", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Deskripsi</Label>
                                <Input
                                    placeholder="mis. Sabun mandi wangi lavender"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.description}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5"
                                invalid={!!errors.code}
                                required
                                value={values.code}
                                onChange={(v) => set("code", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Kode Produk</Label>
                                <Input placeholder="mis. PRD-001" className="w-full px-3 py-2.5 text-sm" />
                                <FieldError>{errors.code}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5"
                                invalid={!!errors.barcode}
                                required
                                value={values.barcode}
                                onChange={(v) => set("barcode", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Barcode</Label>
                                <Input placeholder="mis. 8991234567890" className="w-full px-3 py-2.5 text-sm" />
                                <FieldError>{errors.barcode}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5"
                                invalid={!!errors.unit}
                                required
                                value={values.unit}
                                onChange={(v) => set("unit", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Satuan</Label>
                                <Input placeholder="mis. pcs" className="w-full px-3 py-2.5 text-sm" />
                                <FieldError>{errors.unit}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5"
                                invalid={!!errors.stock}
                                required
                                value={values.stock}
                                onChange={(v) => set("stock", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Stok</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    step={1}
                                    placeholder="0"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.stock}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5"
                                invalid={!!errors.purchase_price}
                                required
                                value={values.purchase_price}
                                onChange={(v) => set("purchase_price", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Harga Beli</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    step={1}
                                    placeholder="0"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.purchase_price}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5"
                                invalid={!!errors.sale_price}
                                required
                                value={values.sale_price}
                                onChange={(v) => set("sale_price", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">Harga Jual</Label>
                                <Input
                                    type="number"
                                    inputMode="numeric"
                                    min={0}
                                    step={1}
                                    placeholder="0"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.sale_price}</FieldError>
                            </TextField>

                            <TextField
                                className="gap-1.5 sm:col-span-2"
                                invalid={!!errors.image}
                                value={values.image}
                                onChange={(v) => set("image", v)}
                            >
                                <Label className="text-sm font-medium text-input-label-text">
                                    URL Gambar <span className="font-normal text-text-tertiary">(opsional)</span>
                                </Label>
                                <Input
                                    placeholder="https://example.com/img"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.image}</FieldError>
                            </TextField>

                            {/* SelectItem kategori aktif (values.category_id) harus ada di daftar `categories.data.items`
                                supaya <SelectValue/> tahu label apa yang ditampilkan untuk id itu saat mode ubah. Ini
                                otomatis terpenuhi selama produk yang diedit memang kategorinya belum dihapus dan
                                termuat dalam batas per_page=100 di atas. */}
                            <Select
                                aria-label="Kategori produk"
                                isRequired
                                isInvalid={!!errors.category}
                                value={values.category_id || undefined}
                                onChange={(key) => {
                                    set("category_id", String(key ?? ""));
                                    if (errors.category) setErrors((e) => ({ ...e, category: undefined }));
                                }}
                                placeholder={categories.isPending ? "Memuat..." : "Pilih kategori"}
                                className="gap-1.5"
                            >
                                <Label className="text-sm font-medium text-input-label-text">Kategori</Label>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                    <SelectIndicator />
                                </SelectTrigger>
                                <SelectContent>
                                    {(categories.data?.items ?? []).map((c) => (
                                        <SelectItem key={c.id} id={c.id} textValue={c.name}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                <SelectErrorMessage>{errors.category}</SelectErrorMessage>
                            </Select>

                            <Select
                                aria-label="Cabang"
                                isRequired
                                isInvalid={!!errors.branch}
                                value={values.branch_id || undefined}
                                onChange={(key) => {
                                    set("branch_id", String(key ?? ""));
                                    if (errors.branch) setErrors((e) => ({ ...e, branch: undefined }));
                                }}
                                placeholder={branches.isPending ? "Memuat..." : "Pilih cabang"}
                                className="gap-1.5"
                            >
                                <Label className="text-sm font-medium text-input-label-text">Cabang</Label>
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                    <SelectIndicator />
                                </SelectTrigger>
                                <SelectContent>
                                    {(branches.data?.items ?? []).map((b) => (
                                        <SelectItem key={b.id} id={b.id} textValue={b.name}>
                                            {b.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                                <SelectErrorMessage>{errors.branch}</SelectErrorMessage>
                            </Select>

                            <div className="flex flex-col justify-center gap-1.5 sm:col-span-2">
                                <span className="text-sm font-medium text-input-label-text">Status</span>
                                <Toggle
                                    checked={values.status}
                                    onChange={(e) => set("status", e.target.checked)}
                                    label={values.status ? "Aktif" : "Nonaktif"}
                                />
                            </div>
                        </DialogBody>

                        <DialogFooter className="px-5 pb-5">
                            <Button type="button" appearance="outline" isDisabled={isPending} onPress={onCancel}>
                                Batal
                            </Button>
                            <Button type="submit" variant="primary" isDisabled={isPending}>
                                {isPending ? "Menyimpan..." : "Simpan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Dialog>
            </Backdrop>
        </OverlayWrapper>
    );
}



interface DeleteProductDialogProps {
    target: Product | null;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteProductDialog({ target, isPending, onCancel, onConfirm }: Readonly<DeleteProductDialogProps>) {
    return (
        <OverlayWrapper isOpen={target !== null} onOpenChange={(open) => !open && onCancel()}>
            <Backdrop isDismissable>
                <Dialog className="max-w-108.75 p-0">
                    <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
                        <DialogTitle className="text-xl leading-7">Hapus produk?</DialogTitle>
                    </DialogHeader>

                    <DialogBody className="px-5 py-4">
                        <p className="text-sm text-text-primary">
                            <span className="font-medium">{target?.name}</span> akan dihapus. Tindakan ini dicatat
                            di log aktivitas.
                        </p>
                    </DialogBody>

                    <DialogFooter className="px-5 pb-5">
                        <Button appearance="outline" isDisabled={isPending} onPress={onCancel}>
                            Batal
                        </Button>
                        <Button variant="danger" isDisabled={isPending} onPress={onConfirm}>
                            {isPending ? "Menghapus..." : "Hapus"}
                        </Button>
                    </DialogFooter>
                </Dialog>
            </Backdrop>
        </OverlayWrapper>
    );
}