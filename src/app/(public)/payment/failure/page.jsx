import PaymentFailureClient from "./PaymentFailureClient";

export const metadata = {
    title: "Ödeme Başarısız",
    description: "Ödeme işlemi başarısız oldu.",
};

export default function PaymentFailurePage() {
    return <PaymentFailureClient />;
}
