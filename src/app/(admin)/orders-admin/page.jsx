import OrdersAdminClient from "./OrdersAdminClient";

export const metadata = {
    title: "Sipariş Yönetimi",
    description: "Sipariş durumlarını ve detaylarını yönetin.",
};

export default function OrdersAdminPage() {
    return <OrdersAdminClient />;
}
