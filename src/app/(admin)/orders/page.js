"use client";

import { useState, useEffect } from "react";
import { instance } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/hooks/useAuthRole";
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Package, 
  Search, 
  ShoppingBag,
  User,
  MapPin,
  Eye,
  RefreshCcw,
  Badge
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectItem, SelectTrigger, SelectValue,SelectContent } from "@/components/ui/select";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const OrdersPage = () => {
  // Yetkilendirme kontrolü
  const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
  const router = useRouter();
  const { toast } = useToast();

  // State tanımlamaları
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  // Siparişleri yükle
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await instance.get("/orders");
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error("Siparişler yüklenirken hata oluştu:", error);
      toast({
        title: "Hata",
        description: "Siparişler yüklenemedi",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Siparişleri durum filtresine göre filtrele
  const filterOrders = (status = filter, searchValue = searchTerm) => {
    let result = orders;

    // Duruma göre filtrele
    if (status !== "ALL") {
      result = result.filter((order) => order.orderStatus === status);
    }

    // Arama terimine göre filtrele
    if (searchValue) {
      result = result.filter((order) => {
        // Sipariş ID'sinde arama
        if (order.id && order.id.toString().includes(searchValue)) return true;
        
        // Müşteri bilgilerinde arama
        if (order.user && (
          (order.user.name && order.user.name.toLowerCase().includes(searchValue.toLowerCase())) ||
          (order.user.surname && order.user.surname.toLowerCase().includes(searchValue.toLowerCase())) ||
          (order.user.email && order.user.email.toLowerCase().includes(searchValue.toLowerCase())) ||
          (order.user.phoneNumber && order.user.phoneNumber.includes(searchValue))
        )) return true;

        // Teslimat adresinde arama
        if (order.deliveryAddress && (
          (order.deliveryAddress.fullAddress && order.deliveryAddress.fullAddress.toLowerCase().includes(searchValue.toLowerCase())) ||
          (order.deliveryAddress.city && order.deliveryAddress.city.toLowerCase().includes(searchValue.toLowerCase())) ||
          (order.deliveryAddress.district && order.deliveryAddress.district.toLowerCase().includes(searchValue.toLowerCase()))
        )) return true;

        return false;
      });
    }

    setFilteredOrders(result);
  };

  // Sipariş durumunu güncelle
  const updateOrderStatus = async (orderId, newStatus) => {
    setIsUpdating(true);
    try {
      await instance.put(`/orders/${orderId}/status?status=${newStatus}`);
      
      // Siparişleri yeniden yükle
      await fetchOrders();
      
      // Detay görünümünü güncelle
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await instance.get(`/orders/${orderId}`);
        setSelectedOrder(updatedOrder.data);
      }
      
      toast({
        title: "Başarılı",
        description: "Sipariş durumu güncellendi",
      });
    } catch (error) {
      console.error("Sipariş durumu güncellenirken hata oluştu:", error);
      toast({
        title: "Hata",
        description: "Sipariş durumu güncellenemedi",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Sipariş iptal et
  const cancelOrder = async (orderId) => {
    if (!confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) {
      return;
    }
    
    setIsUpdating(true);
    try {
      await instance.post(`/orders/${orderId}/cancel`);
      
      // Siparişleri yeniden yükle
      await fetchOrders();
      
      // Detay görünümünü güncelle
      if (selectedOrder && selectedOrder.id === orderId) {
        const updatedOrder = await instance.get(`/orders/${orderId}`);
        setSelectedOrder(updatedOrder.data);
      }
      
      toast({
        title: "Başarılı",
        description: "Sipariş iptal edildi",
      });
    } catch (error) {
      console.error("Sipariş iptal edilirken hata oluştu:", error);
      toast({
        title: "Hata",
        description: "Sipariş iptal edilemedi",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Sipariş detayını göster
  const showOrderDetail = async (orderId) => {
    try {
      const response = await instance.get(`/orders/${orderId}`);
      setSelectedOrder(response.data);
      setIsDetailOpen(true);
    } catch (error) {
      console.error("Sipariş detayı yüklenirken hata oluştu:", error);
      toast({
        title: "Hata",
        description: "Sipariş detayı yüklenemedi",
        variant: "destructive",
      });
    }
  };

  // Durum badgesi için renk ve metin
  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "bg-yellow-500", text: "Beklemede" };
      case "CONFIRMED":
        return { color: "bg-blue-500", text: "Onaylandı" };
      case "PREPARING":
        return { color: "bg-purple-500", text: "Hazırlanıyor" };
      case "SHIPPED":
        return { color: "bg-indigo-500", text: "Yolda" };
      case "DELIVERED":
        return { color: "bg-green-500", text: "Teslim Edildi" };
      case "CANCELLED":
        return { color: "bg-red-500", text: "İptal Edildi" };
      default:
        return { color: "bg-gray-500", text: status };
    }
  };

  // Ödeme durumu badgesi için renk ve metin
  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return { color: "bg-yellow-500", text: "Beklemede" };
      case "SUCCESS":
        return { color: "bg-green-500", text: "Başarılı" };
      case "FAILED":
        return { color: "bg-red-500", text: "Başarısız" };
      default:
        return { color: "bg-gray-500", text: status };
    }
  };

  // Ödeme metodu gösterimi
  const getPaymentMethodText = (method) => {
    switch (method) {
      case "ONLINE_CREDIT_CARD":
        return "Online Kredi Kartı";
      case "CREDIT_CARD":
        return "Kapıda Kredi Kartı";
      case "CASH":
        return "Kapıda Nakit";
      default:
        return method;
    }
  };

  // Tarih biçimlendirme
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // İlk yüklemede siparişleri getir
  useEffect(() => {
    if (isAuthorized) {
      fetchOrders();
    }
  }, [isAuthorized]);

  // Filtre değiştiğinde veya arama yapıldığında siparişleri filtrele
  useEffect(() => {
    filterOrders(filter, searchTerm);
  }, [filter, orders, searchTerm]);

  // Yetkisiz erişim durumunda içerik gösterme
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Siparişler</h1>
        <Button 
          onClick={fetchOrders} 
          variant="outline" 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCcw size={16} />
          Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Select 
            value={filter} 
            onValueChange={(value) => {
              setFilter(value);
              filterOrders(value, searchTerm);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Durum Filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Tüm Siparişler</SelectItem>
              <SelectItem value="PENDING">Beklemede</SelectItem>
              <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
              <SelectItem value="PREPARING">Hazırlanıyor</SelectItem>
              <SelectItem value="SHIPPED">Yolda</SelectItem>
              <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
              <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            type="text"
            placeholder="Sipariş ara (ID, müşteri, adres...)"
            className="pl-10 pr-4 py-2 w-full sm:w-[300px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Sipariş Tablosu */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium">Gösterilecek sipariş bulunamadı</p>
          <p className="text-sm">Filtre ayarlarını değiştirmeyi deneyin</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <caption className="text-sm text-gray-500 p-2">
              Toplam {filteredOrders.length} sipariş
            </caption>
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left w-[80px]">ID</th>
                <th className="p-2 text-left">Müşteri</th>
                <th className="p-2 text-left">Tarih</th>
                <th className="p-2 text-right">Tutar</th>
                <th className="p-2 text-left">Durum</th>
                <th className="p-2 text-left">Ödeme</th>
                <th className="p-2 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <th className="font-medium">{order.id}</th>
                  <th>
                    {order.user ? (
                      <div className="flex flex-col">
                        <span>
                          {order.user.name} {order.user.surname}
                        </span>
                        <span className="text-xs text-gray-500">
                          {order.user.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Misafir Siparişi</span>
                    )}
                  </th>
                  <th>{formatDate(order.orderDate)}</th>
                  <th className="text-right">
                    {order.totalAmount ? (
                      <span className="font-semibold">
                        {order.totalAmount.toFixed(2)} ₺
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </th>
                  <th>
                    <Badge
                      className={`${
                        getStatusBadge(order.orderStatus).color
                      } text-white`}
                    >
                      {getStatusBadge(order.orderStatus).text}
                    </Badge>
                  </th>
                  <th>
                    {order.payment ? (
                      <div className="flex flex-col">
                        <Badge
                          className={`mb-1 ${
                            getPaymentStatusBadge(order.payment.paymentStatus).color
                          } text-white`}
                        >
                          {getPaymentStatusBadge(order.payment.paymentStatus).text}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getPaymentMethodText(order.payment.paymentMethod)}
                        </span>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </th>
                  <th className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mr-2"
                      onClick={() => showOrderDetail(order.id)}
                    >
                      <Eye size={16} className="mr-1" />
                      Detay
                    </Button>
                  </th>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sipariş Detay Modal */}
      <AlertDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedOrder(null);
        }}
      >
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sipariş Detayı #{selectedOrder?.id}</AlertDialogTitle>
          </AlertDialogHeader>

          {selectedOrder && (
            <div className="mt-4">
              {/* Sipariş başlık bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Sipariş Tarihi
                    </span>
                  </div>
                  <span className="text-md">
                    {formatDate(selectedOrder.orderDate)}
                  </span>
                </div>

                <div className="flex flex-col border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Package className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Sipariş Durumu
                    </span>
                  </div>
                  <Badge
                    className={`self-start ${
                      getStatusBadge(selectedOrder.orderStatus).color
                    } text-white`}
                  >
                    {getStatusBadge(selectedOrder.orderStatus).text}
                  </Badge>
                </div>

                <div className="flex flex-col border rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">
                      Toplam Tutar
                    </span>
                  </div>
                  <span className="text-md font-semibold">
                    {selectedOrder.totalAmount
                      ? `${selectedOrder.totalAmount.toFixed(2)} ₺`
                      : "N/A"}
                  </span>
                </div>
              </div>

              {/* Müşteri ve adres bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Müşteri Bilgileri</span>
                  </div>
                  {selectedOrder.user ? (
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">İsim: </span>
                        {selectedOrder.user.name} {selectedOrder.user.surname}
                      </p>
                      <p>
                        <span className="font-medium">E-posta: </span>
                        {selectedOrder.user.email}
                      </p>
                      {selectedOrder.user.phoneNumber && (
                        <p>
                          <span className="font-medium">Telefon: </span>
                          {selectedOrder.user.phoneNumber}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Misafir siparişi - Kullanıcı bilgisi yok
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Teslimat Adresi</span>
                  </div>
                  {selectedOrder.deliveryAddress ? (
                    <div className="text-sm space-y-1">
                      {selectedOrder.deliveryAddress.recipientName && (
                        <p>
                          <span className="font-medium">Alıcı: </span>
                          {selectedOrder.deliveryAddress.recipientName}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Adres: </span>
                        {selectedOrder.deliveryAddress.fullAddress}
                      </p>
                      <p>
                        <span className="font-medium">Konum: </span>
                        {selectedOrder.deliveryAddress.district},{" "}
                        {selectedOrder.deliveryAddress.city}
                      </p>
                      {selectedOrder.deliveryAddress.phoneNumber && (
                        <p>
                          <span className="font-medium">Telefon: </span>
                          {selectedOrder.deliveryAddress.phoneNumber}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Teslimat adresi bilgisi yok
                    </div>
                  )}
                </div>
              </div>

              {/* Ödeme ve not bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <DollarSign className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Ödeme Detayları</span>
                  </div>
                  {selectedOrder.payment ? (
                    <div className="text-sm space-y-2">
                      <p>
                        <span className="font-medium">Yöntem: </span>
                        {getPaymentMethodText(selectedOrder.payment.paymentMethod)}
                      </p>
                      <p>
                        <span className="font-medium">Durum: </span>
                        <Badge
                          className={`${
                            getPaymentStatusBadge(selectedOrder.payment.paymentStatus).color
                          } text-white`}
                        >
                          {getPaymentStatusBadge(selectedOrder.payment.paymentStatus).text}
                        </Badge>
                      </p>
                      {selectedOrder.payment.completedAt && (
                        <p>
                          <span className="font-medium">Ödeme Tarihi: </span>
                          {formatDate(selectedOrder.payment.completedAt)}
                        </p>
                      )}
                      {selectedOrder.payment.errorMessage && (
                        <p className="text-red-500">
                          <span className="font-medium">Hata: </span>
                          {selectedOrder.payment.errorMessage}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Ödeme bilgisi yok
                    </div>
                  )}
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <ShoppingBag className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">Sipariş Notları</span>
                  </div>
                  {selectedOrder.notes ? (
                    <p className="text-sm">{selectedOrder.notes}</p>
                  ) : (
                    <div className="text-sm text-gray-500">Not bulunmuyor</div>
                  )}
                </div>
              </div>

              {/* Sipariş ürünleri */}
              <div className="border rounded-lg p-4 mb-6">
                <div className="flex items-center mb-3">
                  <Package className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="font-medium">Sipariş Ürünleri</span>
                </div>

                <table>
                  <thead>
                    <tr>
                      <th>Ürün</th>
                      <th className="text-right">Birim Fiyat</th>
                      <th className="text-right">Adet</th>
                      <th className="text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items && selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <th className="font-medium">
                          {item.product?.name || "Silinmiş Ürün"}
                        </th>
                        <th className="text-right">
                          {item.price?.toFixed(2)} ₺
                        </th>
                        <th className="text-right">{item.quantity}</th>
                        <th className="text-right">
                          {(item.price * item.quantity).toFixed(2)} ₺
                        </th>
                      </tr>
                    ))}
                    <tr>
                      <th colSpan={3} className="text-right font-bold">
                        Toplam:
                      </th>
                      <th className="text-right font-bold">
                        {selectedOrder.totalAmount?.toFixed(2)} ₺
                      </th>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* İşlem Butonları */}
              <div className="flex flex-wrap justify-end gap-3 mt-6">
                {/* Durum Güncelleme */}
                {selectedOrder.orderStatus !== "CANCELLED" && (
                  <Select
                    value={selectedOrder.orderStatus}
                    onValueChange={(value) =>
                      updateOrderStatus(selectedOrder.id, value)
                    }
                    disabled={isUpdating}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Durum Güncelle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Beklemede</SelectItem>
                      <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                      <SelectItem value="PREPARING">Hazırlanıyor</SelectItem>
                      <SelectItem value="SHIPPED">Yolda</SelectItem>
                      <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {/* İptal Butonu */}
                {["PENDING", "CONFIRMED"].includes(selectedOrder.orderStatus) && (
                  <Button
                    variant="destructive"
                    onClick={() => cancelOrder(selectedOrder.id)}
                    disabled={isUpdating}
                  >
                    Siparişi İptal Et
                  </Button>
                )}
              </div>
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrdersPage;