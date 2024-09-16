"use client";
import { Separator } from "@/components/ui/separator";
import React, { useEffect } from "react";
import NotFound from "../not-found";
import { useAppDispatch } from "@/lib/hooks";
import { clearCart } from "@/lib/store/actions/orderActions";

async function getLatestOrder() {
  const res = await fetch(
    "https://66c0ce8bba6f27ca9a57a405.mockapi.io/api/order",
    { cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch order data");
  }
  const orders = await res.json();
  return orders[orders.length - 1];
}

const calculateItemsTotal = (items) => {
  return items ? items.length * 5 : 0;
};

const calculateTotal = (item) => {
  const basePrice = item.count * item.product.price;
  const itemsPrice = calculateItemsTotal(item.product.items);
  return basePrice + itemsPrice;
};

const calculateCartTotal = (cart) => {
  return cart.reduce((total, item) => total + calculateTotal(item), 0);
};

export default async function Page() {
  const dispatch = useAppDispatch();
  const [latestOrder, setLatestOrder] = React.useState(null);

  useEffect(() => {
    // En son siparişi almak için async işlemi useEffect'te yönetiyoruz
    const fetchOrder = async () => {
      const fetchedOrder = await getLatestOrder();
      setLatestOrder(fetchedOrder);
      dispatch(clearCart()); // clearCart burada dispatch ediliyor
    };

    fetchOrder();
  }, [dispatch]); // dispatch bağımlılık listesinde eklenir

  if (!latestOrder) {
    return <p>Yükleniyor...</p>;
  }

  const cart = latestOrder?.cartData;

  return (
    <div className="bg-red min-h-screen flex flex-col items-center py-8">
      <div className="w-[100vh] flex flex-col items-center gap-4">
        <h3 className="text-2xl font-normal font-Satisfy text-yellow">
          lezzetin yolda
        </h3>
        <h2 className="font-Barlow font-extralight text-5xl tracking-tighter text-lightgray">
          SİPARİŞ ALINDI
        </h2>
        <Separator orientation="horizontal" className="w-[100vh] my-4" />
        <div className="flex flex-col items-center gap-4 text-lightgray">
          {cart && cart.length > 0 ? (
            cart.map((item, index) => (
              <div
                id="success-order-product"
                key={index}
                className="flex flex-col items-start gap-4 w-[75vh]"
              >
                <h4 id="success-order-name" className="text-base font-semibold">
                  {item.product.product_name}
                </h4>
                <div className="flex flex-col items-start gap-2 text-xs">
                  <div
                    id="success-order-count"
                    className="flex flex-row gap-2 items-center"
                  >
                    <p>Adet :</p> <p>{item.count}</p>
                  </div>
                  <div
                    id="success-order-price"
                    className="flex flex-row gap-2 items-center"
                  >
                    <p>Fiyat :</p> <p>{item.count * item.product.price} TL</p>
                  </div>
                  {item.product.size && (
                    <div
                      id="success-order-size"
                      className="flex flex-row gap-2 items-center "
                    >
                      <p>Boyut :</p>
                      <p>{item.product.size}</p>
                    </div>
                  )}
                  {item.product.dough && (
                    <div
                      id="success-order-dough"
                      className="flex flex-row gap-2 items-center"
                    >
                      <p>Hamur :</p>
                      <p>{item.product.dough}</p>
                    </div>
                  )}
                  {item.product.items && item.product.items.length > 0 && (
                    <div
                      id="success-order-items"
                      className="flex flex-col gap-1 items-start"
                    >
                      <p className="w-full">Ek Malzemeler :</p>
                      <p>{item.product.items.join(", ")}</p>
                    </div>
                  )}
                </div>
                <Separator className="w-[75vh]" orientation="horizontal" />
              </div>
            ))
          ) : (
            <p className="text-center">Ürün yok.</p>
          )}
          <div
            id="success-order-summary"
            className="flex flex-col justify-center items-start gap-4 border border-lightgray rounded-md w-[75vh] p-8 text-base"
          >
            <p className="font-semibold">Sipariş Toplamı</p>
            {cart && cart.length > 0 && (
              <>
                {cart.map(
                  (item, index) =>
                    item.product.items &&
                    item.product.items.length > 0 && (
                      <span
                        key={index}
                        id="success-order-summary-items"
                        className="flex flex-row gap-2 items-center justify-between"
                      >
                        <p className="font-semibold">
                          Seçimler ({item.product.product_name}) :
                        </p>
                        <p>{calculateItemsTotal(item.product.items)} TL</p>
                      </span>
                    )
                )}
                <span
                  id="success-order-summary-total"
                  className="flex flex-row gap-2 items-center justify-between"
                >
                  <p className="font-semibold">Toplam :</p>{" "}
                  <p>{calculateCartTotal(cart)} TL</p>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
