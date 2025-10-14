"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { instance } from "@/lib/hooks";
import { useRouter } from "next/navigation";
import useAuthRoute from "@/hooks/use-auth-role";
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
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  // Ref'ler
  const initialFetchDone = useRef(false);
  const currentRequestRef = useRef(null);
  const lastFetchTime = useRef(0);
  const mountedRef = useRef(true);

  // Component unmount takibi
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Aktif istekleri iptal et
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, []);

  const fetchOrders = useCallback(async (force = false) => {
    // Son fetch'ten 5 saniye geçmemişse ve zorlanmadıysa iptal et
    const now = Date.now();
    if (!force && now - lastFetchTime.current < 5000) {
      console.log("Son fetch çok yakın zamanda yapıldı, atlanıyor");
      return;
    }

    // Önceki isteği iptal et
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    // Yeni AbortController oluştur
    const abortController = new AbortController();
    currentRequestRef.current = abortController;

    setLoading(true);
    try {
      const response = await instance.get("/orders", {
        //timeout: 15000, // 15 saniye timeout
        //signal: abortController.signal,
      });

      if (!mountedRef.current) return;
      console.log("orders", response.data);
      setOrders(response.data);
      setFilteredOrders(response.data);

      lastFetchTime.current = now;
    } catch (error) {
      if (!mountedRef.current) return;

      // İptal edilen istekleri sayma
      if (error.name !== "AbortError" && error.name !== "CanceledError") {
        console.error("Siparişler yüklenirken hata oluştu:", error);
        toast({
          title: "Hata",
          description: "Siparişler yüklenemedi",
          variant: "destructive",
        });
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      currentRequestRef.current = null;
    }
  }, []); // toast bağımlılığını kaldırdık

  // Optimize edilmiş filterOrders
  const filterOrders = useCallback(() => {
    if (!orders.length) {
      setFilteredOrders([]);
      return;
    }

    let result = orders;

    // Durum filtresi
    if (filter !== "ALL") {
      result = result.filter((order) => order.orderStatus === filter);
    }

    // Arama filtresi
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      result = result.filter((order) => {
        // Sipariş ID'sinde arama
        if (order.id && order.id.toString().includes(searchTerm)) return true;

        // Kullanıcı bilgilerinde arama
        if (order.user) {
          const userFields = [
            order.user.name,
            order.user.surname,
            order.user.email,
            order.user.phoneNumber,
          ].filter(Boolean);

          if (
            userFields.some((field) =>
              field.toLowerCase().includes(searchLower)
            )
          )
            return true;
        }

        // Adres bilgilerinde arama
        if (order.deliveryAddress) {
          const addressFields = [
            order.deliveryAddress.fullAddress,
            order.deliveryAddress.city,
            order.deliveryAddress.district,
          ].filter(Boolean);

          if (
            addressFields.some((field) =>
              field.toLowerCase().includes(searchLower)
            )
          )
            return true;
        }

        return false;
      });
    }

    setFilteredOrders(result);
  }, [orders, filter, searchTerm]);

  // İlk yükleme - sadece bir kez
  useEffect(() => {
    if (isAuthorized && !initialFetchDone.current) {
      initialFetchDone.current = true;
      fetchOrders();
    }
  }, [isAuthorized, fetchOrders]);

  // Filtre değişikliklerini dinle - debounced
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      filterOrders();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filter, searchTerm, orders, filterOrders]);

  // Optimize edilmiş sipariş durumu güncelleme
  const updateOrderStatus = useCallback(
    async (orderId, newStatus) => {
      if (isUpdating) return; // Zaten bir güncelleme devam ediyorsa

      setIsUpdating(true);
      try {
        await instance.put(
          `/orders/${orderId}/status?status=${newStatus}`,
          null,
          {
            // timeout: 5000, // 5 saniye timeout
          }
        );

        // Siparişleri yeniden yükle
        await fetchOrders(true); // Force refresh

        // Detay görünümünü güncelle
        if (selectedOrder && selectedOrder.id === orderId) {
          try {
            const updatedOrder = await instance.get(`/orders/${orderId}`, {
              //timeout: 5000,
            });
            setSelectedOrder(updatedOrder.data);
          } catch (detailError) {
            console.error("Sipariş detayı güncellenirken hata:", detailError);
          }
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
    },
    [isUpdating, fetchOrders, selectedOrder, toast]
  );

  // Optimize edilmiş sipariş iptal etme
  const cancelOrder = useCallback(
    async (orderId) => {
      if (isUpdating) return;

      if (!confirm("Bu siparişi iptal etmek istediğinizden emin misiniz?")) {
        return;
      }

      setIsUpdating(true);
      try {
        await instance.post(`/orders/${orderId}/cancel`, null, {
          //timeout: 5000,
        });

        await fetchOrders(true); // Force refresh

        if (selectedOrder && selectedOrder.id === orderId) {
          try {
            const updatedOrder = await instance.get(`/orders/${orderId}`, {
              //timeout: 5000,
            });
            setSelectedOrder(updatedOrder.data);
          } catch (detailError) {
            console.error("Sipariş detayı güncellenirken hata:", detailError);
          }
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
    },
    [isUpdating, fetchOrders, selectedOrder, toast]
  );

  // Optimize edilmiş sipariş detayı gösterme
  const showOrderDetail = useCallback(
    async (orderId) => {
      try {
        const response = await instance.get(`/orders/${orderId}`, {
          // timeout: 5000,
        });
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
    },
    [toast]
  );

  // Yenile butonu için optimize edilmiş handler
  const handleRefresh = useCallback(() => {
    fetchOrders(true); // Force refresh
  }, [fetchOrders]);

  // Helper fonksiyonlar - bu kısım aynı kalacak
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

  // Yetkisiz erişim durumunda
  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Siparişler</h1>
        <Button
          onClick={handleRefresh}
          variant="outline"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Yenile
        </Button>
      </div>

      {/* Filtreler */}
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-44">
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
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <Input
            type="text"
            className="pl-10 pr-4 py-2 w-full sm:w-[300px]"
            placeholder="Sipariş ara (ID, müşteri, adres...)"
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
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{order.id}</td>
                  <td className="p-2">
                    {order.deliveryAddress ? (
                      <div className="flex flex-col">
                        <span>{order.deliveryAddress.recipientName}</span>
                        <span className="text-xs text-gray-500">
                          {order.deliveryAddress.phoneNumber}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Misafir Siparişi</span>
                    )}
                  </td>
                  <td className="p-2">{formatDate(order.orderDate)}</td>
                  <td className="p-2 text-right">
                    {order.totalAmount ? (
                      <span className="font-semibold">
                        {order.totalAmount.toFixed(2)} ₺
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-2">
                    <Badge
                      className={`${
                        getStatusBadge(order.orderStatus).color
                      } text-white`}
                    >
                      {getStatusBadge(order.orderStatus).text}
                    </Badge>
                  </td>
                  <td className="p-2">
                    {order.payment ? (
                      <div className="flex flex-col">
                        <Badge
                          className={`mb-1 ${
                            getPaymentStatusBadge(order.payment.paymentStatus)
                              .color
                          } text-white`}
                        >
                          {
                            getPaymentStatusBadge(order.payment.paymentStatus)
                              .text
                          }
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {getPaymentMethodText(order.payment.paymentMethod)}
                        </span>
                      </div>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="p-2 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mr-2"
                      onClick={() => showOrderDetail(order.id)}
                    >
                      <Eye size={16} className="mr-1" />
                      Detay
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal kısmı aynı kalacak - sadece fonksiyon çağrılarını güncelledik */}
      <AlertDialog
        open={isDetailOpen}
        onOpenChange={(open) => {
          setIsDetailOpen(open);
          if (!open) setSelectedOrder(null);
        }}
      >
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Sipariş Detayı #{selectedOrder?.id}
            </AlertDialogTitle>
          </AlertDialogHeader>

          {selectedOrder && (
            <div className="mt-4">
              {/* Modal içeriği aynı kalacak - sadece işlem butonlarını güncelle */}
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
                {["PENDING", "CONFIRMED"].includes(
                  selectedOrder.orderStatus
                ) && (
                  <Button
                    variant="destructive"
                    onClick={() => cancelOrder(selectedOrder.id)}
                    disabled={isUpdating}
                  >
                    {isUpdating ? "İşleniyor..." : "Siparişi İptal Et"}
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
