"use client";

import { useRouter } from "next/navigation";

export default function DashboardCategoriesTable({ data, loading }) {
  const router = useRouter();

  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-lightgray">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-darkgray font-Quattrocento_Sans">
            Kategoriler
          </h3>
        </div>
        <div className="p-6 animate-pulse">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-lightgray rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Veri kontrolü
  const hasData = data && Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-lightgray">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-darkgray font-Quattrocento_Sans">
            Kategoriler
          </h3>
        </div>
        <div className="text-center py-12 text-gray font-Barlow">
          <p className="text-lg mb-2">Henüz kategori bulunmuyor</p>
          <p className="text-sm mb-4">Kategori ekleyerek başlayabilirsiniz</p>
          <button
            onClick={() => router.push("/category")}
            className="bg-red text-lightgray px-6 py-3 rounded-lg hover:bg-yellow hover:text-red transition-colors duration-300 font-Barlow font-medium"
          >
            Kategori Ekle
          </button>
        </div>
      </div>
    );
  }

  console.log("📋 Rendering table with data:", data);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-lightgray">
      <div className="p-6 border-b flex items-center justify-between">
        <h3 className="text-lg font-semibold text-darkgray font-Quattrocento_Sans">
          Kategoriler
        </h3>
        <span className="text-sm text-gray font-Barlow">
          Toplam {data.length} kategori
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-lightgray">
          <thead className="bg-lightgray">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider font-Barlow">
                Kategori Adı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider font-Barlow">
                Ürün Sayısı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider font-Barlow">
                Toplam Stok
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-lightgray">
            {data.map((category, index) => (
              <tr 
                key={category.name || index} 
                className="hover:bg-lightgray transition-colors duration-150 cursor-pointer"
                onClick={() => router.push(`/category`)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-darkgray font-Barlow">
                  {category.name || 'İsimsiz Kategori'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray font-Barlow">
                  {category.ürünSayısı || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray font-Barlow">
                  {category.stokMiktarı || 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}