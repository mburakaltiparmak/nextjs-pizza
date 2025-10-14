"use client";

import { useRouter } from "next/navigation";

export default function DashboardCategoriesTable({ data }) {
  const router = useRouter();

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-lightgray">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-darkgray font-Quattrocento_Sans">
            Kategoriler
          </h3>
        </div>
        <div className="text-center py-8 text-gray font-Barlow">
          <p>Henüz kategori bulunmamaktadır.</p>
          <button
            onClick={() => router.push("/category")}
            className="mt-4 bg-red text-lightgray px-4 py-2 rounded-md hover:bg-yellow hover:text-red transition-colors duration-300 font-Barlow"
          >
            Kategori Ekle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-lightgray">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-darkgray font-Quattrocento_Sans">
          Kategoriler
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray">
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
          <tbody className="bg-white divide-y divide-gray">
            {data.map((category, index) => (
              <tr key={index} className="hover:bg-lightgray">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-darkgray font-Barlow">
                  {category.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray font-Barlow">
                  {category.ürünSayısı}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray font-Barlow">
                  {category.stokMiktarı}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}