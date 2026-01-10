"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useToast } from "@/lib/hooks/useToast"; // Maybe migrate this later
import {
    Check,
    User,
    ShoppingCart,
    CreditCard,
} from "lucide-react";
import FirstStep from "@/components/checkout/firstStep.jsx";
import SecondStep from "@/components/checkout/secondStep.jsx";
import ThirdStep from "@/components/checkout/thirdStep.jsx";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const CheckoutClient = () => {
    const { error, warning } = useToast();
    const router = useRouter();
    const cart = useAppSelector((state) => state.order.cart);
    const role = useAppSelector((state) => state.user.role);
    const isLogin = useAppSelector((state) => state.user.isLogin);
    const isGuestMode = useAppSelector((state) => state.app?.isGuestMode);

    // Hydration ve yönlendirme için gerekli durumlar
    const [isClient, setIsClient] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [step1, setStep1] = useState(false);
    const [step2, setStep2] = useState(false);
    const [step3, setStep3] = useState(false);

    // Client tarafında olduğumuzu belirten useEffect
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Yönlendirme fonksiyonları - useCallback ile optimize
    const redirectToHome = useCallback(() => {
        if (!isRedirecting) {
            setIsRedirecting(true);
            warning("Sepetiniz boş", {
                title: "Yönlendirme",
                message: "Anasayfaya yönlendiriliyorsunuz."
            });

            setTimeout(() => {
                router.push("/");
            }, 1500);
        }
    }, [isRedirecting, router, warning]);

    // İstemci tarafında kontroller - ayrı useEffect
    useEffect(() => {
        if (!isClient || isRedirecting) return; // Henüz client-side değilse veya zaten yönlendirme varsa çık

        // Sepet kontrolü
        if (!cart || cart.length === 0) {
            redirectToHome();
            return;
        }

    }, [isClient, cart, isRedirecting, redirectToHome]);

    // Define steps
    const steps = [
        {
            id: 1,
            title: "Kişisel Bilgiler",
            icon: <User className="w-5 h-5" />,
            completed: step1,
            disabled: !cart || cart.length <= 0,
        },
        {
            id: 2,
            title: "Sipariş Özeti",
            icon: <ShoppingCart className="w-5 h-5" />,
            completed: step2,
            disabled: !step1,
        },
        {
            id: 3,
            title: "Ödeme",
            icon: <CreditCard className="w-5 h-5" />,
            completed: step3,
            disabled: !step1 || !step2,
        },
    ];

    const totalSteps = steps.length;

    // Render current step component
    const displaySteps = () => {
        switch (currentStep) {
            case 1:
                return (
                    <FirstStep setCurrentStep={setCurrentStep} setStep1={setStep1} />
                );
            case 2:
                return (
                    <SecondStep setCurrentStep={setCurrentStep} setStep2={setStep2} />
                );
            case 3:
                return (
                    <ThirdStep setCurrentStep={setCurrentStep} setStep3={setStep3} />
                );
            default:
                return null;
        }
    };

    // Loading durumları
    if (!isClient) {
        return <LoadingSpinner size="fullPage" />; // Hydration bekleniyor
    }

    if (isRedirecting) {
        return <LoadingSpinner size="fullPage" />; // Yönlendirme yapılıyor
    }

    // Sepet boş veya kullanıcı yetkisiz ama henüz yönlendirme başlamamış
    if (!cart || cart.length === 0) {
        return <LoadingSpinner size="fullPage" />; // Yönlendirme effect'i çalışacak
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Modern Stepper */}
            <div className="mb-8">
                <div className="relative">
                    {/* Progress bar */}
                    <div className="absolute top-5 left-0 h-1 bg-lightgray2 w-full rounded-full" />
                    <div
                        className="absolute top-5 left-0 h-1 bg-gradient-to-r from-yellow to-red transition-all duration-500 rounded-full"
                        style={{
                            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                        }}
                    />

                    {/* Steps */}
                    <div className="relative flex justify-between font-Barlow">
                        {steps.map((step) => (
                            <div key={step.id} className="flex flex-col items-center">
                                <div
                                    className={`flex items-center justify-center w-12 h-12 rounded-full z-10 transition-all duration-300 shadow-lg ${step.completed
                                        ? "bg-gradient-to-r from-yellow to-lightyellow text-red border-2 border-yellow ring-4 ring-yellow ring-opacity-30"
                                        : step.id === currentStep
                                            ? "bg-gradient-to-r from-red to-darkred border-2 border-red text-yellow ring-4 ring-red ring-opacity-30"
                                            : "bg-white border-2 border-lightgray2 text-gray shadow-md"
                                        }`}
                                >
                                    {step.completed ? (
                                        <Check className="w-6 h-6 font-bold" />
                                    ) : (
                                        step.icon
                                    )}
                                </div>
                                <span
                                    className={`mt-3 text-sm font-semibold transition-colors duration-300 ${step.completed
                                        ? "text-red"
                                        : step.id === currentStep
                                            ? "text-red"
                                            : "text-gray"
                                        }`}
                                >
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mb-8">{displaySteps()}</div>
        </div>
    );
};

export default CheckoutClient;
