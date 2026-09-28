"use client";

import { Avatar, AvatarFallback } from "@/components/tailgrids/core/avatar";
import { Badge } from "@/components/tailgrids/core/badge";
import { Button } from "@/components/tailgrids/core/button";
import { Card } from "@/components/tailgrids/core/card";
import { Input } from "@/components/tailgrids/core/input";
import { Label } from "@/components/tailgrids/core/label";
import { Skeleton } from "@/components/tailgrids/core/skeleton";
import { TextField } from "@/components/tailgrids/core/text-field";
import { useLogout, useMe } from "@/hooks/api/use-auth";
import { toUserMessage } from "@/lib/api/errors";
import { LogoutIcon } from "./icons";

function ReadOnlyField({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <TextField className="w-full gap-2.5" readOnly value={value}>
      <Label>{label}</Label>
      <Input className="w-full" />
    </TextField>
  );
}

function AccountSkeleton() {
  return (
    <Card className="bg-transparent p-5">
      <Skeleton className="mb-6 h-7 w-40 rounded-full" />
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-11 w-full rounded-lg" />
        ))}
      </div>
    </Card>
  );
}

export default function AccountPage() {
  const { data: user, isPending, isError, error, refetch } = useMe();
  const logout = useLogout();

  if (isPending) return <AccountSkeleton />;

  if (isError || !user) {
    return (
      <Card className="flex flex-col items-start gap-3 bg-transparent p-5">
        <p className="text-sm text-text-primary">{toUserMessage(error)}</p>
        <Button appearance="outline" size="sm" onPress={() => refetch()}>
          Coba lagi
        </Button>
      </Card>
    );
  }

  const { branch } = user;

  return (
    <div className="space-y-6">
      <Card className="bg-transparent p-5">
        <h2 className="mb-6 text-xl leading-7 font-semibold text-text-primary">Detail Akun</h2>

        <div className="mb-6 flex items-center gap-4">
          <Avatar size="xxl">
            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1.5">
            <span className="text-base font-medium text-text-primary">{user.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-tertiary capitalize">{user.role}</span>
              <Badge color={user.status === "active" ? "success" : "gray"} className="px-2.5 capitalize">
                {user.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ReadOnlyField label="Nama Lengkap" value={user.name} />
          <ReadOnlyField label="Email" value={user.email} />
        </div>
      </Card>

      {branch && (
        <Card className="bg-transparent p-5">
          <h2 className="mb-6 text-xl leading-7 font-semibold text-text-primary">Cabang</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ReadOnlyField label="Nama Cabang" value={branch.name} />
            <ReadOnlyField label="Telepon" value={branch.phone_number} />
            <ReadOnlyField label="Kota" value={`${branch.city}, ${branch.province}`} />
            <ReadOnlyField label="Alamat" value={branch.address} />
          </div>
        </Card>
      )}

      <Card className="bg-transparent p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-sm leading-5 font-medium text-text-primary">Keluar dari akun</p>
            <p className="text-xs leading-4 text-text-tertiary">
              Akhiri sesi Anda di perangkat ini.
            </p>
          </div>

          <Button
            appearance="outline"
            variant="primary"
            size="lg"
            className="gap-2 px-3.5 py-2 text-sm [&>svg]:size-5"
            isDisabled={logout.isPending}
            onPress={() => logout.mutate()}
          >
            <LogoutIcon />
            {logout.isPending ? "Keluar..." : "Keluar"}
          </Button>
        </div>
      </Card>
    </div>
  );
}