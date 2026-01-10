"use client";
import FloatingCartButton from "@/components/cart-button/floatingCartButton";
import { useAppSelector } from "@/lib/store/hooks";

export default function FloatingCartWrapper() {
    // Redux store'dan kullanıcı rolünü al
    const userRole = useAppSelector((state) => state.user.role);

    // Kullanıcının rolü ADMIN veya PERSONAL değilse sepet butonunu göster
    const showCartButton = userRole !== 'ADMIN' && userRole !== 'PERSONAL';

    return showCartButton ? <FloatingCartButton /> : null;
}
