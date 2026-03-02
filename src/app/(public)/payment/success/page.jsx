import { Suspense } from "react";
import PaymentSuccessClient from "./PaymentSuccessClient";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export const metadata = {
    title: "Ödeme Başarılı",
    description: "Ödeme işleminiz başarıyla tamamlandı.",
};

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={<LoadingSpinner size="fullPage" />}>
            <PaymentSuccessClient />
        </Suspense>
    );
}
