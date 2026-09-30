import { toUserMessage } from "@/lib/api/errors";
import { Button } from "../tailgrids/core/button";
import { Card } from "../tailgrids/core/card";
import { Skeleton } from "../tailgrids/core/skeleton";

export function TableSkeleton() {
    return (
        <Card className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, i) => (
                <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
        </Card>
    );
}


export function ErrorCard({ error, onRetry }: Readonly<{ error: unknown; onRetry: () => void }>) {
    return (
        <Card className="flex flex-col items-start gap-3 p-5">
            <p className="text-sm text-text-primary">{toUserMessage(error)}</p>
            <Button appearance="outline" size="sm" onPress={onRetry}>
                Coba lagi
            </Button>
        </Card>
    );
}
