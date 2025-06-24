"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  User,
  ShoppingCart,
  CreditCard,
} from "lucide-react";
import Header from "@/components/header.js";
import Footer from "@/components/footer.js";
import FirstStep from "@/components/create-order-components/firstStep.jsx";
import SecondStep from "@/components/create-order-components/secondStep.jsx";
import ThirdStep from "@/components/create-order-components/thirdStep.jsx";
import Loading from "../loading";

const Page = () => {
  const { error, warning } = useToast();
  const router = useRouter();
  const cart = useAppSelector((state) => state.order.cart);
  const role = useAppSelector((state) => state.user.role);
  const isLogin = useAppSelector((state) => state.user.isLogin);
  
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

  const redirectToLogin = useCallback(() => {
    if (!isRedirecting) {
      setIsRedirecting(true);
      error("Siparişinize devam etmek için lütfen giriş yapın", {
        title: "Giriş Gerekli",
        message: "Giriş sayfasına yönlendiriliyorsunuz."
      });
      
      setTimeout(() => {
        router.push("/login");
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

    // Kullanıcı giriş kontrolü - hem role hem isLogin kontrol et
    // Guest kullanıcılar (role === "GUEST") sipariş verebilir
    if (!role || (!isLogin && role !== "GUEST")) {
      redirectToLogin();
      return;
    }

  }, [isClient, cart, role, isLogin, isRedirecting, redirectToHome, redirectToLogin]);

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
    return <Loading />; // Hydration bekleniyor
  }

  if (isRedirecting) {
    return <Loading />; // Yönlendirme yapılıyor
  }

  // Sepet boş veya kullanıcı yetkisiz ama henüz yönlendirme başlamamış
  if (!cart || cart.length === 0) {
    return <Loading />; // Yönlendirme effect'i çalışacak
  }

  if (!role || (!isLogin && role !== "GUEST")) {
    return <Loading />; // Yönlendirme effect'i çalışacak
  }

  return (
    <div className="min-h-screen bg-lightgray">
      <Header />
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
                    className={`flex items-center justify-center w-12 h-12 rounded-full z-10 transition-all duration-300 shadow-lg ${
                      step.completed
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
                    className={`mt-3 text-sm font-semibold transition-colors duration-300 ${
                      step.completed
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

        {/* Debug Info - Geliştirme aşamasında kullanılabilir */}
        {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
          <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
            <p>Debug: Role: {role}, IsLogin: {String(isLogin)}, Cart Items: {cart?.length || 0}</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Page;