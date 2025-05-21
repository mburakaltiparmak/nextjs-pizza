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
    <div className="flex flex-col min-h-screen bg-red font-Barlow">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-8 bg-yellow rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-red mb-6">
            Şifremi Unuttum
          </h2>

          {submitted ? (
            <div className="text-center">
              <p className="mb-4">
                Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen
                e-postanızı kontrol edin.
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
                  className="block text-sm font-medium text-darkgray"
                >
                  E-posta Adresiniz
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="mail@example.com"
                  required
                  className="py-1 px-2 mt-1 block w-full text-sm rounded-md border-gray shadow-sm placeholder:text-gray text-darkgray focus:border-red focus:ring-red"
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

              <button className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-800  hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red">
                <Link href="/login" className="text-sm text-white ">
                  Giriş Sayfasına Dön
                </Link>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
