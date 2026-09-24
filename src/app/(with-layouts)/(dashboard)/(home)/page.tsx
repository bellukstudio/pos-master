import InventoryOverview from "./_component/inventory-overview";
import LastTransactionsTable from "./_component/last-transactions-table";
import ECommerceOverviewStats from "./_component/overview-stats";
import SalesChart from "./_component/sales-chart";
import TopProducts from "./_component/top-products";

export default function Home() {
  return (
    <div className="mt-6 space-y-5">
      {/* Header Section */}
      <div className="px-2 lg:px-6">
        <h1 className="mb-1 text-[28px] leading-8 font-medium text-text-primary">Dashboard</h1>
        <p className="text-sm leading-5 text-text-tertiary">
          Pantau penjualan, stok, dan performa toko Anda secara real-time.
        </p>
      </div>

      <div className="space-y-5 px-2 lg:px-5">
        <ECommerceOverviewStats />
        <SalesChart />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-[519fr_558fr]">
          <InventoryOverview />
          <TopProducts />
        </div>
        <LastTransactionsTable />
      </div>
    </div>
  );
}
