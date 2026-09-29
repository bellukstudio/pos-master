import { Button } from "@/components/tailgrids/core/button";
import { DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, Dialog } from "@/components/tailgrids/core/dialog";
import { OverlayWrapper, Backdrop } from "@/components/tailgrids/core/overlay";
import { AuditLog } from "@/services/api/audit-log";

interface DeleteDialogProps {
    target: AuditLog | null;
    isPending: boolean;
    onCancel: () => void;
    onConfirm: () => void;
}

export function DeleteAuditDialog({ target, isPending, onCancel, onConfirm }: Readonly<DeleteDialogProps>) {
    return (
        <OverlayWrapper
            isOpen={target !== null}
            onOpenChange={(open) => {
                if (!open) onCancel();
            }}
        >
            <Backdrop isDismissable>
                <Dialog className="max-w-108.75 p-0">
                    <DialogHeader className="gap-1 border-b border-card-border py-4 pr-14 pl-5">
                        <DialogTitle className="text-xl leading-7">Hapus log aktivitas?</DialogTitle>
                        <DialogDescription className="text-text-tertiary">
                            Log ini akan dihapus dari daftar. Penghapusan ini juga dicatat di log aktivitas.
                        </DialogDescription>
                    </DialogHeader>

                    <DialogBody className="px-5 py-4">
                        <p className="text-sm wrap-break-word text-text-primary">{target?.description}</p>
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
