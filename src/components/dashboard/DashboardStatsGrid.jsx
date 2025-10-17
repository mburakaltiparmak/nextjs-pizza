import { ListOrdered, Package, TrendingUp, Users } from "lucide-react";

export default function DashboardStatsGrid({ statistics, moduleLoading }) {
  // Loading skeleton component
  const LoadingCard = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-lightgray animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 bg-gray rounded w-24"></div>
        <div className="h-8 w-8 bg-lightgray rounded-lg"></div>
      </div>
      <div className="h-8 bg-gray rounded w-16"></div>
    </div>
  );

  // Stat Card component
  const StatCard = ({ title, value, icon, loading, color = "text-red" }) => {
    if (loading) {
      return <LoadingCard />;
    }

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-lightgray hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray text-sm font-medium font-Barlow">{title}</h3>
          <span className={`${color}`}>
            {icon}
          </span>
        </div>
        <div className="flex items-baseline space-x-2">
          <p className="text-3xl font-bold text-darkgray font-Quattrocento_Sans">{value || 0}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="Toplam Kategoriler"
        value={statistics?.totalCategories || 0}
        icon={<ListOrdered className="h-8 w-8" />}
        loading={moduleLoading?.category}
        color="text-yellow"
      />
      <StatCard
        title="Toplam Ürünler"
        value={statistics?.totalProducts || 0}
        icon={<Package className="h-8 w-8" />}
        loading={moduleLoading?.category}
        color="text-red"
      />
      <StatCard
        title="Toplam Stok"
        value={statistics?.totalStock || 0}
        icon={<TrendingUp className="h-8 w-8" />}
        loading={moduleLoading?.category}
        color="text-green-600"
      />
      <StatCard
        title="Toplam Kullanıcılar"
        value={statistics?.totalUsers || 0}
        icon={<Users className="h-8 w-8" />}
        loading={moduleLoading?.user}
        color="text-blue-600"
      />
    </div>
  );
}