
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
import { TextField } from "@/components/tailgrids/core/text-field";
import { Toggle } from "@/components/tailgrids/core/toggle";
import { Branch } from "@/services/api/auth";
import { BranchInput } from "@/services/api/branch";
import { BranchFieldErrors, branchInputSchema, toFieldErrors } from "@/services/api/branch/validation";
import { useState } from "react";


const EMPTY_INPUT: BranchInput = {
    name: "",
    address: "",
    city: "",
    province: "",
    phone_number: "",
    status: true,
};

function toInput(branch: Branch): BranchInput {
    const { name, address, city, province, phone_number, status } = branch;
    return { name, address, city, province, phone_number, status };
}

// ---------------- Dialog tambah/ubah ----------------

interface BranchFormDialogProps {
    // null = tertutup, undefined = mode tambah, Branch = mode ubah.
    target: Branch | null | undefined;
    isPending: boolean;
    onCancel: () => void;
    onSubmit: (input: BranchInput) => void;
}

export function BranchFormDialog({ target, isPending, onCancel, onSubmit }: Readonly<BranchFormDialogProps>) {
    const isOpen = target !== null;
    const isEdit = Boolean(target);

    const [values, setValues] = useState<BranchInput>(EMPTY_INPUT);
    const [errors, setErrors] = useState<BranchFieldErrors>({});
    // Isi ulang form setiap dialog dibuka untuk target yang berbeda.
    const [openedFor, setOpenedFor] = useState<Branch | null | undefined>(null);

    if (isOpen && target !== openedFor) {
        setOpenedFor(target);
        setValues(target ? toInput(target) : EMPTY_INPUT);
        setErrors({});
    }

    function set<K extends keyof BranchInput>(key: K, value: BranchInput[K]) {
        setValues((v) => ({ ...v, [key]: value }));
        if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
    }

    const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        const parsed = branchInputSchema.safeParse(values);
        if (!parsed.success) {
            setErrors(toFieldErrors(parsed.error));
            return;
        }
        onSubmit(parsed.data);
    };

    return (
        <OverlayWrapper isOpen={isOpen} onOpenChange={(open) => !open && onCancel()}>
            <Backdrop isDismissable={!isPending}>
                <Dialog className="max-w-137.5 p-0">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader className="border-b border-card-border py-4 pr-14 pl-5">
                            <DialogTitle className="text-xl leading-7">
                                {isEdit ? "Ubah Cabang" : "Tambah Cabang"}
                            </DialogTitle>
                        </DialogHeader>

                        <DialogBody className="grid grid-cols-1 gap-4 px-5 py-4 sm:grid-cols-2">
                            <TextField className="gap-1.5 sm:col-span-2" invalid={!!errors.name} required value={values.name} onChange={(v) => set("name", v)}>
                                <Label className="text-sm font-medium text-input-label-text">Nama Cabang</Label>
                                <Input
                                    placeholder="mis. Cabang Jakarta Pusat"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.name}</FieldError>
                            </TextField>

                            <TextField className="gap-1.5 sm:col-span-2" invalid={!!errors.address} required value={values.address} onChange={(v) => set("address", v)}>
                                <Label className="text-sm font-medium text-input-label-text">Alamat</Label>
                                <Input
                                    placeholder="mis. Jl. Sudirman No. 123"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.address}</FieldError>
                            </TextField>

                            <TextField className="gap-1.5" invalid={!!errors.city} required value={values.city} onChange={(v) => set("city", v)}>
                                <Label className="text-sm font-medium text-input-label-text">Kota</Label>
                                <Input
                                    placeholder="mis. Jakarta"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.city}</FieldError>
                            </TextField>

                            <TextField className="gap-1.5" invalid={!!errors.province} required value={values.province} onChange={(v) => set("province", v)}>
                                <Label className="text-sm font-medium text-input-label-text">Provinsi</Label>
                                <Input
                                    placeholder="mis. DKI Jakarta"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.province}</FieldError>
                            </TextField>

                            <TextField className="gap-1.5" invalid={!!errors.phone_number} required value={values.phone_number} onChange={(v) => set("phone_number", v)}>
                                <Label className="text-sm font-medium text-input-label-text">Nomor Telepon</Label>
                                <Input
                                    placeholder="mis. 021-12345678"
                                    className="w-full px-3 py-2.5 text-sm"
                                />
                                <FieldError>{errors.phone_number}</FieldError>
                            </TextField>

                            <div className="flex flex-col justify-center gap-1.5">
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

// ---------------- Dialog hapus ----------------

interface DeleteDialogProps {
    target: Branch | null;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteBranchDialog({ target, isPending, onCancel, onConfirm }: Readonly<DeleteDialogProps>) {
    return (
        <OverlayWrapper isOpen={target !== null} onOpenChange={(open) => !open && onCancel()}>
            <Backdrop isDismissable>
                <Dialog className="max-w-108.75 p-0">
                    <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
                        <DialogTitle className="text-xl leading-7">Hapus cabang?</DialogTitle>
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