"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useToast } from "@/lib/hooks/useToast";
import {
    Check,
    User,
    ShoppingCart,
    CreditCard,
} from "lucide-react";
import FirstStep from "@/components/checkout/FirstStep.jsx";
import SecondStep from "@/components/checkout/SecondStep.jsx";
import ThirdStep from "@/components/checkout/ThirdStep.jsx";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";

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

    const [isOrderCompleted, setIsOrderCompleted] = useState(false);

    // Client tarafında olduğumuzu belirten useEffect
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Yönlendirme fonksiyonları - useCallback ile optimize
    const redirectToHome = useCallback(() => {
        if (!isRedirecting && !isOrderCompleted) { // Sipariş tamamlandıysa yönlendirme yapma
            setIsRedirecting(true);
            warning("Sepetiniz boş", {
                title: "Yönlendirme",
                message: "Anasayfaya yönlendiriliyorsunuz."
            });

            setTimeout(() => {
                router.push("/");
            }, 1500);
        }
    }, [isRedirecting, isOrderCompleted, router, warning]);

    // İstemci tarafında kontroller - ayrı useEffect
    useEffect(() => {
        if (!isClient || isRedirecting || isOrderCompleted) return; // Sipariş tamamlandıysa çık

        // Sepet kontrolü
        if (!cart || cart.length === 0) {
            redirectToHome();
            return;
        }

    }, [isClient, cart, isRedirecting, isOrderCompleted, redirectToHome]);

    // Define steps
    const steps = [
        {
            id: 1,
            title: "Kişisel Bilgiler",
            icon: <User className="w-5 h-5" />,
            completed: step1,
            disabled: !cart || cart.length <= 0,
            isClickable: true,
        },
        {
            id: 2,
            title: "Sipariş Özeti",
            icon: <ShoppingCart className="w-5 h-5" />,
            completed: step2,
            disabled: !step1,
            isClickable: step1,
        },
        {
            id: 3,
            title: "Ödeme",
            icon: <CreditCard className="w-5 h-5" />,
            completed: step3,
            disabled: !step1 || !step2,
            isClickable: step1 && step2,
        },
    ];

    const totalSteps = steps.length;

    // Handle step click
    const handleStepClick = (stepId, isClickable) => {
        if (isClickable && stepId < currentStep) {
            setCurrentStep(stepId);
        }
    };

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
                    <ThirdStep
                        setCurrentStep={setCurrentStep}
                        setStep3={setStep3}
                        onSuccess={() => setIsOrderCompleted(true)}
                    />
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

    // Sepet boş veya kullanıcı yetkisiz ama henüz yönlendirme başlamamış, 
    // ancak sipariş tamamlanmadıysa (normal boş sepet durumu)
    if ((!cart || cart.length === 0) && !isOrderCompleted) {
        return <LoadingSpinner size="fullPage" />; // Yönlendirme effect'i çalışacak
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Functional Stepper */}
            <div className="mb-12">
                <div className="relative">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-lightgray2 rounded-full -z-0" />

                    {/* Active Progress Line */}
                    <motion.div
                        className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-red rounded-full -z-0"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />

                    {/* Steps */}
                    <div className="relative z-10 flex justify-between w-full">
                        {steps.map((step) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = step.completed || step.id < currentStep;
                            const isClickable = step.isClickable && step.id < currentStep;

                            return (
                                <div
                                    key={step.id}
                                    className="flex flex-col items-center gap-3 cursor-pointer group"
                                    onClick={() => handleStepClick(step.id, isClickable)}
                                >
                                    <motion.div
                                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-colors duration-300 shadow-sm
                                            ${isActive
                                                ? "bg-yellow border-yellow text-darkgray scale-110 shadow-md ring-4 ring-yellow/20"
                                                : isCompleted
                                                    ? "bg-red border-red text-white"
                                                    : "bg-white border-lightgray2 text-gray"
                                            }
                                            ${isClickable ? "hover:scale-105" : ""}
                                        `}
                                        whileTap={isClickable ? { scale: 0.95 } : {}}
                                    >
                                        {isCompleted && !isActive ? (
                                            <Check className="w-6 h-6" strokeWidth={3} />
                                        ) : (
                                            step.icon
                                        )}
                                    </motion.div>
                                    <span
                                        className={`text-sm font-bold font-Barlow transition-colors duration-300
                                            ${isActive
                                                ? "text-darkgray"
                                                : isCompleted
                                                    ? "text-red"
                                                    : "text-gray"
                                            }
                                        `}
                                    >
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Content with Animation */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {displaySteps()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CheckoutClient;
