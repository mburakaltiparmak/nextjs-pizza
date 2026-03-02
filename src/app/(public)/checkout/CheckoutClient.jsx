"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { useToast } from "@/lib/hooks/useToast";
import { useCheckoutStepper } from "@/lib/hooks/useCheckoutStepper";
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
    const { warning } = useToast();
    const router = useRouter();
    const cart = useAppSelector((state) => state.order.cart);
    
    // Hydration states
    const [isClient, setIsClient] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isOrderCompleted, setIsOrderCompleted] = useState(false);

    // Initial check for client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Stepper Hook
    const { 
        currentStep, 
        completedSteps, 
        completeStep, 
        goToStep 
    } = useCheckoutStepper([1, 2, 3]);

    // Redirect Logic — only check: is the cart empty?
    // Auth is NOT required for checkout. Unauthenticated users are guests.
    // Guest info (name, email, phone) is collected in Step 1 via GuestInfoForm.
    const redirectToHome = useCallback(() => {
        if (!isRedirecting && !isOrderCompleted) {
            setIsRedirecting(true);
            warning("Sepetiniz boş", {
                title: "Yönlendirme",
                message: "Anasayfaya yönlendiriliyorsunuz."
            });
            setTimeout(() => router.push("/"), 1500);
        }
    }, [isRedirecting, isOrderCompleted, router, warning]);

    useEffect(() => {
        if (!isClient || isRedirecting || isOrderCompleted) return;
        if (!cart || cart.length === 0) {
            redirectToHome();
        }
    }, [isClient, cart, isRedirecting, isOrderCompleted, redirectToHome]);

    // Step Configuration
    const steps = [
        {
            id: 1,
            title: "Kişisel Bilgiler",
            icon: <User className="w-5 h-5" />,
            isCompleted: completedSteps[1],
            isDisabled: !cart || cart.length <= 0,
        },
        {
            id: 2,
            title: "Sipariş Özeti",
            icon: <ShoppingCart className="w-5 h-5" />,
            isCompleted: completedSteps[2],
            isDisabled: !completedSteps[1],
        },
        {
            id: 3,
            title: "Ödeme",
            icon: <CreditCard className="w-5 h-5" />,
            isCompleted: completedSteps[3],
            isDisabled: !completedSteps[2],
        },
    ];

    // Handlers
    const handleStepCompletion = (stepId) => {
        completeStep(stepId, true);
    };

    const handleStepClick = (stepId, isDisabled) => {
        if (!isDisabled) {
            goToStep(stepId);
        }
    };

    // Render Logic
    const renderCurrentStep = () => {
        switch (currentStep) {
            case 1:
                return <FirstStep onComplete={() => handleStepCompletion(1)} />;
            case 2:
                return (
                    <SecondStep 
                        onComplete={() => handleStepCompletion(2)} 
                        onBack={() => goToStep(1)}
                    />
                );
            case 3:
                return (
                    <ThirdStep 
                        setStep3={(isSuccess) => isSuccess && completeStep(3, false)}
                        onSuccess={() => setIsOrderCompleted(true)} 
                        onBack={() => goToStep(2)}
                    />
                );
            default:
                return null;
        }
    };

    // Loading State
    if (!isClient || isRedirecting || ((!cart || cart.length === 0) && !isOrderCompleted)) {
        return <LoadingSpinner size="fullPage" />;
    }

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            {/* Stepper UI */}
            <div className="mb-12">
                <div className="relative">
                    {/* Background Line */}
                    <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full -z-0" />

                    {/* Active Progress Line */}
                    <motion.div
                        className="absolute top-6 left-0 -translate-y-1/2 h-1 bg-gradient-to-r from-red to-yellow rounded-full -z-0"
                        initial={{ width: 0 }}
                        animate={{
                            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                        }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    />

                    {/* Steps Items */}
                    <div className="relative z-10 flex justify-between w-full">
                        {steps.map((step) => {
                            const isActive = step.id === currentStep;
                            const isCompleted = step.isCompleted || step.id < currentStep;
                            const isClickable = !step.isDisabled;

                            return (
                                <div
                                    key={step.id}
                                    className={`flex flex-col items-center gap-3 group ${isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                                    onClick={() => handleStepClick(step.id, step.isDisabled)}
                                >
                                    <motion.div
                                        className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 shadow-sm
                                            ${isActive
                                                ? "bg-yellow border-yellow text-darkgray scale-110 shadow-md ring-4 ring-yellow/20"
                                                : isCompleted
                                                    ? "bg-red border-red text-white"
                                                    : "bg-white border-gray-200 text-gray-400"
                                            }
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
                                                    : "text-gray-400"
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

            {/* Step Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderCurrentStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CheckoutClient;