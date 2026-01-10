import PaymentSuccessClient from "./PaymentSuccessClient";

export const metadata = {
    title: "Ödeme Başarılı",
    description: "Ödeme işleminiz başarıyla tamamlandı.",
};

export default function PaymentSuccessPage() {
    return <PaymentSuccessClient />;
}
