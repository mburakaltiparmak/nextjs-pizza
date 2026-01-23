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

export default function DashboardChart({ data, loading }) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-lightgray p-6 mb-8">
        <h3 className="text-lg font-semibold text-darkgray mb-4 font-Barlow">
          Kategori Bazlı Dağılım
        </h3>
        <div className="animate-pulse">
          <div className="h-[300px] bg-lightgray rounded"></div>
        </div>
      </div>
    );
  }

  // Veri kontrolü - data array'i ve içeriği
  const hasData = data && Array.isArray(data) && data.length > 0;

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-lightgray p-6 mb-8">
        <h3 className="text-lg font-semibold text-darkgray mb-4 font-Barlow">
          Kategori Bazlı Dağılım
        </h3>
        <div className="text-center py-12 text-gray font-Barlow">
          <p className="text-lg mb-2">Henüz kategori verisi bulunmuyor</p>
          <p className="text-sm">Kategori ve ürün ekleyerek grafik oluşturabilirsiniz</p>
        </div>
      </div>
    );
  }

  // Veri formatını kontrol et - ürünSayısı ve stokMiktarı olmalı
  const validData = data.every(item =>
    item &&
    typeof item.ürünSayısı === 'number' &&
    typeof item.stokMiktarı === 'number'
  );

  if (!validData) {
    console.error("❌ Invalid chart data format:", data);
    return (
      <div className="bg-white rounded-xl shadow-sm border border-lightgray p-6 mb-8">
        <h3 className="text-lg font-semibold text-darkgray mb-4 font-Barlow">
          Kategori Bazlı Dağılım
        </h3>
        <div className="text-center py-12 text-red font-Barlow">
          <p>Grafik verisi hatalı formatta. Lütfen sayfayı yenileyin.</p>
        </div>
      </div>
    );
  }

  console.log("📊 Rendering chart with data:", data);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-lightgray p-6 mb-8">
      <h3 className="text-lg font-semibold text-darkgray mb-4 font-Barlow">
        Kategori Bazlı Dağılım
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E5E5' }}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickLine={{ stroke: '#E5E5E5' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5E5',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
          <Bar
            dataKey="ürünSayısı"
            fill="#CE2829"
            name="Ürün Sayısı"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="stokMiktarı"
            fill="#FDC913"
            name="Stok Miktarı"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}