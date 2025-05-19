// app/reset-password/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { resetPassword } from "@/lib/store/actions/userActions";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import SecondaryLoading from "@/components/secondaryLoading";
import { useToast } from "@/hooks/use-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const loading = useAppSelector((state) => state.global.loading);
  
  useEffect(() => {
    // URL'den token'ı al
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError("Geçersiz şifre sıfırlama bağlantısı");
    }
  }, [searchParams]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalıdır");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    
    const result = await dispatch(resetPassword(token, password));
    
    if (result.success) {
      setSuccess(true);
      toast({
        title: "Başarılı",
        description: "Şifreniz başarıyla sıfırlandı. Şimdi giriş yapabilirsiniz.",
        type: "success",
      });
      
      // 3 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } else {
      setError(result.error || "Şifre sıfırlama işlemi başarısız oldu");
      toast({
        title: "Hata",
        description: result.error || "Şifre sıfırlama işlemi başarısız oldu",
        type: "error",
      });
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-red">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md p-8 bg-yellow rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center text-red mb-6">
            Şifre Sıfırlama
          </h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red text-white rounded">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="text-center">
              <p className="mb-4">
                Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...
              </p>
              <SecondaryLoading size="medium" className="mx-auto" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Yeni Şifre
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red focus:ring-red"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  placeholder="En az 8 karakter"
                />
              </div>
              
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Şifre Tekrar
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red focus:ring-red"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="Şifrenizi tekrar girin"
                />
              </div>
              
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red hover:bg-darkred focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red"
                disabled={loading || !token}
              >
                {loading ? (
                  <SecondaryLoading size="small" />
                ) : (
                  "Şifremi Sıfırla"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}