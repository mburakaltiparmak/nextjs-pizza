import OrdersPageClient from "./OrdersPageClient";

export const metadata = {
    title: "Siparişlerim",
    description: "Geçmiş siparişlerinizi görüntüleyin.",
};

export default function OrdersPage() {
    return <OrdersPageClient />;
}
