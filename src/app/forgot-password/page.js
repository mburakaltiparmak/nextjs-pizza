// app/forgot-password/page.jsx
"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { forgotPassword } from "@/lib/store/actions/userActions";
import Link from "next/link";
import SecondaryLoading from "@/components/secondaryLoading";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const loading = useAppSelector((state) => state.global.loading);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen e-posta adresinizi girin",
        type: "error",
      });
      return;
    }
    
    const result = await dispatch(forgotPassword(email));
    
    if (result.success) {
      setSubmitted(true);
      toast({
        title: "Başarılı",
        description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi",
        type: "success",
      });
    } else {
      toast({
        title: "Hata",
        description: result.error || "İşlem sırasında bir hata oluştu",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-red">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-8 bg-yellow rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-red mb-6">
            Şifremi Unuttum
          </h2>
          
          {submitted ? (
            <div className="text-center">
              <p className="mb-4">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. 
                Lütfen e-postanızı kontrol edin.
              </p>
              <Link 
                href="/login"
                className="inline-block px-4 py-2 bg-red text-white rounded hover:bg-darkred"
              >
                Giriş Sayfasına Dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700"
                >
                  E-posta Adresiniz
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red focus:ring-red"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red hover:bg-darkred focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
                disabled={loading}
              >
                {loading ? (
                  <SecondaryLoading size="small" />
                ) : (
                  "Şifre Sıfırlama Bağlantısı Gönder"
                )}
              </button>
              
              <div className="text-center mt-4">
                <Link 
                  href="/login"
                  className="text-sm text-red hover:text-darkred"
                >
                  Giriş Sayfasına Dön
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}