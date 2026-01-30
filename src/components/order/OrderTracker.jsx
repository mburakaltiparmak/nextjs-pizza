"use client";

import { Check, ChefHat, Clock, MapPin, Package, Truck, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

import { ORDER_STATUS } from "@/lib/constants";

const STEPS = [
    {
        status: ORDER_STATUS.PENDING,
        label: "Sipariş Alındı",
        icon: Clock,
        color: "bg-gray-500",
    },
    {
        status: ORDER_STATUS.CONFIRMED,
        label: "Onaylandı",
        icon: Check,
        color: "bg-blue-500",
    },
    {
        status: ORDER_STATUS.PREPARING,
        label: "Hazırlanıyor",
        icon: ChefHat,
        color: "bg-yellow-500",
    },
    {
        status: ORDER_STATUS.SHIPPING,
        label: "Yolda",
        icon: Truck,
        color: "bg-purple-500",
    },
    {
        status: ORDER_STATUS.DELIVERED,
        label: "Teslim Edildi",
        icon: MapPin,
        color: "bg-green-500",
    },
];

export function OrderTracker({ status, className }) {
    if (status === "CANCELLED") {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl border border-red-100">
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h3 className="text-xl font-bold text-red-700">Sipariş İptal Edildi</h3>
                <p className="text-red-600">Bu sipariş iptal edilmiştir.</p>
            </div>
        );
    }

    // Find current step index
    // Note: OVEN might not be in all logic, assuming linear progression
    const currentStepIndex = STEPS.findIndex((s) => s.status === status);
    // Default to 0 if status not found (or PENDING)
    const activeIndex = currentStepIndex === -1 ? 0 : currentStepIndex;

    return (
        <div className={cn("w-full py-6", className)}>
            {/* Desktop/Tablet Horizontal Steps */}
            <div className="hidden md:flex justify-between items-start relative">
                {/* Connecting Line */}
                <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 -z-10">
                    <div
                        className="h-full bg-green-500 transition-all duration-500 ease-out"
                        style={{ width: `${(activeIndex / (STEPS.length - 1)) * 100}%` }}
                    />
                </div>

                {STEPS.map((step, index) => {
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.status} className="flex flex-col items-center gap-2">
                            <div
                                className={cn(
                                    "w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 bg-white",
                                    isActive ? "border-green-500 text-green-600" : "border-gray-200 text-gray-300",
                                    isCurrent && "scale-110 shadow-lg ring-4 ring-green-100"
                                )}
                            >
                                {/* Dynamically render icon component or element */}
                                {typeof Icon === 'function' ? <Icon className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
                            </div>
                            <span
                                className={cn(
                                    "text-sm font-medium transition-colors",
                                    isActive ? "text-gray-900" : "text-gray-400",
                                    isCurrent && "font-bold text-green-700"
                                )}
                            >
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Mobile Vertical Steps */}
            <div className="md:hidden flex flex-col gap-6 relative pl-4">
                {/* Mobile logic simplified for vertical */}
                <div className="absolute left-[27px] top-0 bottom-0 w-1 bg-gray-100 -z-10" />

                {STEPS.map((step, index) => {
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;
                    const Icon = step.icon;

                    return (
                        <div key={step.status} className="flex items-center gap-4">
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center border-4 bg-white z-10",
                                    isActive ? "border-green-500 text-green-600" : "border-gray-200 text-gray-300",
                                    isCurrent && "scale-110 shadow-lg"
                                )}
                            >
                                {typeof Icon === 'function' ? <Icon className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                            </div>
                            <div className={cn(isActive ? "opacity-100" : "opacity-50")}>
                                <p className="font-bold text-sm">{step.label}</p>
                                {isCurrent && <p className="text-xs text-green-600 animate-pulse">Şu anki durum</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}
