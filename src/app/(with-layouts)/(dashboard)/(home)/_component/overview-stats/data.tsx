import { BoxIcon, EyeIcon, MoneyBagIcon, UserGroupIcon } from "./icons";
import type { OverviewStatKey } from "@/services/api/home";

import type { OverviewStatDisplayConfig } from "./types";

export const overviewStatDisplayConfig: Record<OverviewStatKey, OverviewStatDisplayConfig> = {
  views: {
    title: "Produk Terjual",
    icon: <EyeIcon />,
    iconBgClass: "bg-[rgba(59,130,246,0.10)]",
    iconColorClass: "text-[#3B82F6]",
  },
  profit: {
    title: "Total Penjualan",
    icon: <MoneyBagIcon />,
    iconBgClass: "bg-[rgba(34,197,94,0.10)]",
    iconColorClass: "text-[#22C55E]",
  },
  orders: {
    title: "Total Transaksi",
    icon: <BoxIcon />,
    iconBgClass: "bg-[rgba(249,115,22,0.10)]",
    iconColorClass: "text-[#F97316]",
  },
  users: {
    title: "Pelanggan Aktif",
    icon: <UserGroupIcon />,
    iconBgClass: "bg-[rgba(168,85,247,0.10)]",
    iconColorClass: "text-[#A855F7]",
  },
};
