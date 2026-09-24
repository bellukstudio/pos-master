import {
  AuthIcon,
  CalendarIcon,
  HomeIcon,
  InvoiceIcon,
  PieChartIcon,
  TableIcon,
  TaskIcon,
  UserGroupIcon,
  UserIcon,
  WindowIcon,
} from "./icon";

export const NAV_DATA = [
  {
    label: "MENU UTAMA",
    items: [
      {
        title: "Dashboard",
        url: "/",
        icon: <HomeIcon />,
        items: [],
      },
      {
        title: "Kasir",
        url: "/kasir",
        icon: <InvoiceIcon />,
        items: [],
      },
      {
        title: "Produk",
        icon: <WindowIcon />,
        items: [
          { title: "Semua Produk", url: "/products" },
          { title: "Kategori Produk", url: "/products/categories" },
        ],
      },
      {
        title: "Pembelian",
        url: "/purchases",
        icon: <TaskIcon />,
        items: [],
      },
      {
        title: "Stok",
        icon: <TableIcon />,
        items: [
          { title: "Mutasi Stok", url: "/stock/mutations" },
          { title: "Retur Barang", url: "/stock/returns" },
        ],
      },
      {
        title: "Member & Loyalty",
        url: "/members",
        icon: <UserGroupIcon />,
        items: [],
      },
      {
        title: "Promo & Diskon",
        url: "/promotions",
        icon: <TaskIcon />,
        items: [],
      },
      {
        title: "Cabang",
        url: "/branches",
        icon: <WindowIcon />,
        items: [],
      },
      {
        title: "Shift Kasir",
        url: "/shifts",
        icon: <CalendarIcon />,
        items: [],
      },
      {
        title: "Laporan",
        icon: <PieChartIcon />,
        items: [
          { title: "Laporan Penjualan", url: "/reports/sales" },
          { title: "Laporan Stok", url: "/reports/stock" },
          { title: "Laporan Keuangan", url: "/reports/finance" },
        ],
      },
    ],
  },
  {
    label: "LAINNYA",
    items: [
      {
        title: "Pengguna & Akses",
        icon: <UserIcon />,
        items: [
          { title: "Pengguna", url: "/users" },
          { title: "Hak Akses", url: "/users/access-rights" },
        ],
      },
      {
        title: "Log Aktivitas",
        url: "/audit-log",
        icon: <AuthIcon />,
        items: [],
      },
      {
        title: "Pengaturan",
        url: "/settings",
        icon: <AuthIcon />,
        items: [],
      },
      {
        title: "Profil",
        url: "/profile",
        icon: <UserIcon />,
        items: [],
      },
    ],
  },
];
