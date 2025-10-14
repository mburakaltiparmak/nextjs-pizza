import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-lightgray p-6 mb-8">
        <h3 className="text-lg font-semibold text-darkgray mb-4 font-Quattrocento_Sans">
          Kategori Bazlı Dağılım
        </h3>
        <div className="text-center py-8 text-gray font-Barlow">
          <p>Grafik verisi yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-lightgray p-6 mb-8">
      <h3 className="text-lg font-semibold text-darkgray mb-4 font-Quattrocento_Sans">
        Kategori Bazlı Dağılım
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="ürünSayısı" fill="#CE2829" name="Ürün Sayısı" />
          <Bar dataKey="stokMiktarı" fill="#FDC913" name="Stok Miktarı" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}