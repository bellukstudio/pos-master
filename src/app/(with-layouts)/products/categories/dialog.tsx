import { Button } from "@/components/tailgrids/core/button";
import { Dialog, DialogBody, DialogFooter, DialogHeader, DialogTitle } from "@/components/tailgrids/core/dialog";
import { FieldError } from "@/components/tailgrids/core/field";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { Backdrop, OverlayWrapper } from "@/components/tailgrids/core/overlay";
import { TextField } from "@/components/tailgrids/core/text-field";
import { CategoryProduct, CategoryProductInput } from "@/services/api/categor-product";
import { CategoryProductFieldErrors, categoryProductInputSchema, toFieldErrors } from "@/services/api/categor-product/validation";
import { useState } from "react";

const EMPTY_INPUT: CategoryProductInput = {
    name: "",
    description: ""
};

function toInput(categoryProduct: CategoryProduct): CategoryProductInput {
    const { name, description } = categoryProduct;
    return { name, description };
}

interface CategoryProductFormdialogProps {
    target: CategoryProduct | null | undefined;
    isPending: boolean;
    onCancel: () => void;
    onSubmit: (input: CategoryProductInput) => void
}


export function CatgoryProductFormDialog({ target, isPending, onCancel, onSubmit }: Readonly<CategoryProductFormdialogProps>) {
    const isOpen = target !== null;
    const isEdit = Boolean(target);

    const [values, setValues] = useState<CategoryProductInput>(EMPTY_INPUT)
    const [errors, setErrors] = useState<CategoryProductFieldErrors>({});

    const [openedFor, setOpenedFor] = useState<CategoryProduct | null | undefined>();

    if (isOpen && target !== openedFor) {
        setOpenedFor(target);
        setValues(target ? toInput(target) : EMPTY_INPUT);
        setErrors({});
    }

    function set<K extends keyof CategoryProductInput>(key: K, value: CategoryProduct[K]) {
        setValues((v) => ({ ...v, [key]: value }));
        if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    }

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const parsed = categoryProductInputSchema.safeParse(values);
        if (!parsed.success) {
            setErrors(toFieldErrors(parsed.error));
            return;
        }

        onSubmit(parsed.data);
    }

    return (
        <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <Backdrop isDismissable={!isPending}>
                <Dialog className="max-w-137.5 p-0">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="border-b border-card-border py-4 pr-14 pl-5">
                            <DialogTitle className="text-xl leading-7">
                                {isEdit ? "Ubah Kategori Produk" : "Tambah Kategori Produk"}
                            </DialogTitle>
                        </DialogHeader>

                        <DialogBody className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
                            <TextField className="gap-1.5 sm:col-span-2" invalid={!!errors.name} required value={values.name} onChange={(v) => set("name", v)}>
                                <Label className="text-sm font-medium text-input-label-text">Nama Kategori Produk</Label>
                                <Input
                                    placeholder="mis. Sabun"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.name}</FieldError>
                            </TextField>
                            <TextField className="gap-1.5 sm:col-span-2" invalid={!!errors.description} required value={values.description} onChange={(v) => set("description", v)}>
                                <Label className="text-sm font-medium text-input-label-text">Deksripsi</Label>
                                <Input
                                    placeholder="mis. Kategori untuk semua jenis sabun mandi"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.description}</FieldError>
                            </TextField>
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



// ---------------- Dialog hapus ----------------

interface DeleteDialogProps {
    target: CategoryProduct | null;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteCategoryProductDialog({ target, isPending, onCancel, onConfirm }: Readonly<DeleteDialogProps>) {
    return (
        <OverlayWrapper isOpen={target !== null} onOpenChange={(open) => !open && onCancel()}>
            <Backdrop isDismissable>
                <Dialog className="max-w-108.75 p-0">
                    <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
                        <DialogTitle className="text-xl leading-7">Hapus kategori?</DialogTitle>
                    </DialogHeader>

                    <DialogBody className="px-5 py-4">
                        <p className="text-sm text-text-primary">
                            <span className="font-medium">{target?.name}</span> akan dihapus. Tindakan ini dicatat di
                            log aktivitas.
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