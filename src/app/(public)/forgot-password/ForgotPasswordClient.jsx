"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { forgotPassword } from "@/lib/store/actions/userActions";
import Link from "next/link";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/lib/hooks/useToast";

export default function ForgotPasswordClient() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const dispatch = useAppDispatch();
    const { toast } = useToast();
    const loading = useAppSelector((state) => state.user.loading); // Updated selector to user.loading if applicable, or check usage

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast({
                title: "Hata",
                description: "Lütfen e-posta adresinizi girin",
                variant: "destructive", // changed type='error' to variant='destructive' for shadcn
            });
            return;
        }

        const result = await dispatch(forgotPassword(email));

        if (result.success) {
            setSubmitted(true);
            toast({
                title: "Başarılı",
                description: "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi",
            });
        } else {
            toast({
                title: "Hata",
                description: result.error || "İşlem sırasında bir hata oluştu",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col min-h-[60vh] font-Barlow py-12 px-4">
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
                                href="/"
                                className="inline-block px-4 py-2 bg-red text-white rounded hover:bg-darkred"
                            >
                                Anasayfaya Dön
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
                                    <LoadingSpinner className="w-5 h-5" />
                                ) : (
                                    "Şifre Sıfırlama Bağlantısı Gönder"
                                )}
                            </button>

                            <div className="w-full flex justify-center">
                                <Link href="/" className="text-sm text-red hover:underline font-semibold">
                                    Anasayfaya Dön
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
