"use client";
import { useState, useEffect } from "react";
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
  const { toast } = useToast();
  const router = useRouter();
  const cart = useAppSelector((state) => state.order.cart);
  const role = useAppSelector((state) => state.user.role);
  
  // Hydration için gerekli durum
  const [isClient, setIsClient] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [step3, setStep3] = useState(false);

  // Client tarafında olduğumuzu belirten useEffect
  useEffect(() => {
    setIsClient(true);
    
    // İstemci tarafında olduğumuzda kontroller yapılır
    if (isClient) {
      // Sepet boş ise anasayfaya yönlendir
      if (!cart || cart.length <= 0) {
        toast({
          title: "Sepetiniz boş.",
          description: "Anasayfaya yönlendiriliyorsunuz.",
        });
        router.push("/");
      }
      
      // Kullanıcı giriş yapmamış ise login sayfasına yönlendir
      if (!role) {
        toast({
          title: "Siparişinize devam etmek için lütfen giriş yapın.",
          description: "Giriş sayfasına yönlendiriliyorsunuz.",
        });
        router.push("/login");
      }
    }
  }, [cart, role, router, toast, isClient]);

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

  // Sayfa yüklenirken veya istemci kontrollerini yaparken yükleme göster
  if (!isClient || (!role && isClient) || (isClient && (!cart || cart.length <= 0))) {
    return (
      <Loading />
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto max-w-3xl px-4 py-8">
        {/* Modern Stepper */}
        <div className="mb-8">
          <div className="relative">
            {/* Progress bar */}
            <div className="absolute bottom-10 left-2 h-1 bg-yellow w-full -translate-y-1/2" />
            <div
              className="absolute bottom-10 left-2 h-1 bg-red transition-all duration-300 -translate-y-1/2"
              style={{
                width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
            />

            {/* Steps */}
            <div className="relative flex justify-between font-Barlow">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full z-10 transition-all duration-300 ${
                      step.completed
                        ? "bg-yellow text-red border-2 border-white ring-2 ring-darkred"
                        : step.id === currentStep
                        ? "bg-red border-2 border-yellow text-yellow ring-2 ring-red"
                        : "bg-gray border-2 border-white text-darkgray ring-2 ring-darkgray"
                    }`}
                  >
                    {step.completed ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      step.id <= currentStep ? "text-red" : "text-black"
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

        {/* Navigation buttons are handled by individual step components */}
      </div>
      <Footer />
    </div>
  );
};

export default Page;