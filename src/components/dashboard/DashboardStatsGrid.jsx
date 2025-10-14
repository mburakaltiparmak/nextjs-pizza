import { ListOrdered, Package, TrendingUp, Users } from "lucide-react";
import StatCard from "@/components/admin/statCard";

export default function DashboardStatsGrid({ statistics, moduleLoading }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Toplam Kategoriler"
        value={statistics.totalCategories}
        icon={<ListOrdered className="h-8 w-8" />}
        loading={moduleLoading?.category}
      />
      <StatCard
        title="Toplam Ürünler"
        value={statistics.totalProducts}
        icon={<Package className="h-8 w-8" />}
        loading={moduleLoading?.category}
      />
      <StatCard
        title="Toplam Stok"
        value={statistics.totalStock}
        icon={<TrendingUp className="h-8 w-8" />}
        loading={moduleLoading?.category}
      />
      <StatCard
        title="Toplam Kullanıcılar"
        value={statistics.totalUsers}
        icon={<Users className="h-8 w-8" />}
        loading={moduleLoading?.user}
      />
    </div>
  );
}