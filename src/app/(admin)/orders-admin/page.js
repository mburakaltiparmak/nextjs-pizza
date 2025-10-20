"use client";

import { useState } from "react";
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
  Badge as BadgeIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Custom Hooks
import { useOrdersManager } from "@/hooks/use-orders-manager";
import { useOrderActions } from "@/hooks/use-order-actions";
import { useOrderFilters } from "@/hooks/use-order-filters";

/**
 * Orders Admin Page - Optimize edilmiş versiyon
 * - Smart polling (30s interval)
 * - Memory leak koruması
 * - Optimistic updates
 * - useMemo filtreleme
 */
const OrdersPage = () => {
  // Auth
  const { isAuthorized } = useAuthRoute(["ADMIN", "PERSONAL"], "/");
  const router = useRouter();

  // Modal state
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Custom Hooks
  const {
    orders,
    loading,
    isRefreshing,
    lastUpdateTime,
    refreshOrders,
    updateOrderLocally,
  } = useOrdersManager();

  const {
    isUpdating,
    selectedOrder,
    updateOrderStatus,
    cancelOrder,
    fetchOrderDetail,
    clearSelectedOrder,
  } = useOrderActions({
    onSuccess: () => refreshOrders(), // Sipariş güncellenince yenile
    updateOrderLocally,
  });

  const {
    statusFilter,
    searchTerm,
    filteredOrders,
    filterStats,
    handleStatusChange,
    handleSearchChange,
    resetFilters,
  } = useOrderFilters(orders);

  // Order detail modal
  const handleShowDetail = async (orderId) => {
    const order = await fetchOrderDetail(orderId);
    if (order) {
      setIsDetailOpen(true);
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    clearSelectedOrder();
  };

  // Helper functions
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { color: "bg-yellow-500", text: "Beklemede" },
      CONFIRMED: { color: "bg-blue-500", text: "Onaylandı" },
      PREPARING: { color: "bg-purple-500", text: "Hazırlanıyor" },
      SHIPPED: { color: "bg-indigo-500", text: "Yolda" },
      DELIVERED: { color: "bg-green-500", text: "Teslim Edildi" },
      CANCELLED: { color: "bg-red-500", text: "İptal Edildi" },
    };
    return badges[status] || { color: "bg-gray-500", text: status };
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      PENDING: { color: "bg-yellow-500", text: "Beklemede" },
      PAID: { color: "bg-green-500", text: "Ödendi" },
      FAILED: { color: "bg-red-500", text: "Başarısız" },
      REFUNDED: { color: "bg-gray-500", text: "İade Edildi" },
    };
    return badges[status] || { color: "bg-gray-500", text: status };
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state
  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
              <p className="text-sm text-gray-500 mt-1">
                Toplam {filterStats.total} sipariş
                {lastUpdateTime && (
                  <span className="ml-2">
                    • Son güncelleme: {formatDate(lastUpdateTime)}
                  </span>
                )}
              </p>
            </div>
            <Button
              onClick={refreshOrders}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCcw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Yenileniyor..." : "Yenile"}
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Durum Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">
                  Tümü ({filterStats.total})
                </SelectItem>
                <SelectItem value="PENDING">
                  Beklemede ({filterStats.pending})
                </SelectItem>
                <SelectItem value="CONFIRMED">
                  Onaylandı ({filterStats.confirmed})
                </SelectItem>
                <SelectItem value="PREPARING">
                  Hazırlanıyor ({filterStats.preparing})
                </SelectItem>
                <SelectItem value="SHIPPED">
                  Yolda ({filterStats.shipped})
                </SelectItem>
                <SelectItem value="DELIVERED">
                  Teslim Edildi ({filterStats.delivered})
                </SelectItem>
                <SelectItem value="CANCELLED">
                  İptal Edildi ({filterStats.cancelled})
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Sipariş No, Kullanıcı veya Adres Ara..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Reset Filters */}
            {(statusFilter !== "ALL" || searchTerm) && (
              <Button variant="outline" onClick={resetFilters}>
                Filtreleri Temizle
              </Button>
            )}
          </div>

          {/* Filter Results Info */}
          {filteredOrders.length !== filterStats.total && (
            <p className="text-sm text-gray-600 mt-3">
              {filteredOrders.length} sipariş gösteriliyor (
              {filterStats.total} siparişten)
            </p>
          )}
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sipariş Bulunamadı
            </h3>
            <p className="text-gray-500">
              {statusFilter !== "ALL" || searchTerm
                ? "Arama kriterlerinizle eşleşen sipariş bulunamadı."
                : "Henüz hiç sipariş yok."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const statusBadge = getStatusBadge(order.status);
              const paymentBadge = getPaymentStatusBadge(order.paymentStatus);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Sipariş No</p>
                      <p className="font-semibold text-gray-900">
                        #{order.id}
                      </p>
                    </div>
                    <span
                      className={`${statusBadge.color} text-white text-xs px-3 py-1 rounded-full`}
                    >
                      {statusBadge.text}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {order.user?.name || order.user?.username || "Bilinmiyor"}
                    </span>
                  </div>

                  {/* Address */}
                  {order.address && (
                    <div className="flex items-start gap-2 mb-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {order.address}
                      </span>
                    </div>
                  )}

                  {/* Date */}
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Total Price */}
                  <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-lg font-bold text-gray-900">
                      {order.totalPrice?.toFixed(2)} ₺
                    </span>
                    <span
                      className={`${paymentBadge.color} text-white text-xs px-2 py-0.5 rounded ml-auto`}
                    >
                      {paymentBadge.text}
                    </span>
                  </div>

                  {/* Items Count */}
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {order.orderItems?.length || 0} ürün
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleShowDetail(order.id)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detay
                    </Button>
                    {order.status !== "CANCELLED" &&
                      order.status !== "DELIVERED" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelOrder(order.id)}
                          disabled={isUpdating}
                        >
                          İptal
                        </Button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Detail Modal */}
        <AlertDialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex justify-between items-center">
                <span>Sipariş Detayı #{selectedOrder?.id}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetail}
                  className="h-8 w-8 p-0"
                >
                  ✕
                </Button>
              </AlertDialogTitle>
            </AlertDialogHeader>

            {selectedOrder && (
              <div className="space-y-6">
                {/* Status & Payment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Sipariş Durumu
                    </p>
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(newStatus) =>
                        updateOrderStatus(selectedOrder.id, newStatus)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Beklemede</SelectItem>
                        <SelectItem value="CONFIRMED">Onaylandı</SelectItem>
                        <SelectItem value="PREPARING">Hazırlanıyor</SelectItem>
                        <SelectItem value="SHIPPED">Yolda</SelectItem>
                        <SelectItem value="DELIVERED">
                          Teslim Edildi
                        </SelectItem>
                        <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500 mb-2">Ödeme Durumu</p>
                    <span
                      className={`${
                        getPaymentStatusBadge(selectedOrder.paymentStatus).color
                      } text-white text-sm px-4 py-2 rounded-lg inline-block`}
                    >
                      {
                        getPaymentStatusBadge(selectedOrder.paymentStatus).text
                      }
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Müşteri Bilgileri
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-500">Ad Soyad:</span>{" "}
                      <span className="font-medium">
                        {selectedOrder.user?.name ||
                          selectedOrder.user?.username ||
                          "Bilinmiyor"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Email:</span>{" "}
                      <span className="font-medium">
                        {selectedOrder.user?.email || "Belirtilmemiş"}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-500">Telefon:</span>{" "}
                      <span className="font-medium">
                        {selectedOrder.user?.phoneNumber || "Belirtilmemiş"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Address */}
                {selectedOrder.address && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Teslimat Adresi
                    </h3>
                    <p className="text-sm text-gray-700">
                      {selectedOrder.address}
                    </p>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Sipariş İçeriği
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.orderItems?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.product?.name || "Ürün"}
                          </p>
                          {item.customizations && (
                            <p className="text-xs text-gray-500 mt-1">
                              Özelleştirmeler: {item.customizations}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-500">
                            {item.quantity} adet
                          </p>
                          <p className="font-semibold text-gray-900">
                            {(item.price * item.quantity).toFixed(2)} ₺
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Ara Toplam</span>
                      <span className="font-medium">
                        {selectedOrder.totalPrice?.toFixed(2)} ₺
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Teslimat</span>
                      <span className="font-medium">0.00 ₺</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">
                        Toplam
                      </span>
                      <span className="font-bold text-lg text-gray-900">
                        {selectedOrder.totalPrice?.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Oluşturulma: {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Güncelleme: {formatDate(selectedOrder.updatedAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button variant="outline" onClick={handleCloseDetail}>
                    Kapat
                  </Button>
                  {selectedOrder.status !== "CANCELLED" &&
                    selectedOrder.status !== "DELIVERED" && (
                      <Button
                        variant="destructive"
                        onClick={() => {
                          cancelOrder(selectedOrder.id);
                          handleCloseDetail();
                        }}
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
    </div>
  );
};

export default OrdersPage;