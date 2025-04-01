"use client";
import FloatingCartButton from "@/components/floatingCartButton";
import { useSelector } from "react-redux";

export default function ClientComponentWrapper() {
  // Redux store'dan kullanıcı rolünü al
  const userRole = useSelector((state) => state.user.role);
  
  // Kullanıcının rolü ADMIN veya PERSONAL değilse sepet butonunu göster
  const showCartButton = userRole !== 'ADMIN' && userRole !== 'PERSONAL';
  
  return showCartButton ? <FloatingCartButton /> : null;
}