"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({ isOpen, onClose, title, children, className }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div
                className={cn(
                    "relative w-full max-w-lg rounded-lg bg-white p-6 shadow-lg animate-in zoom-in-95 duration-200",
                    className
                )}
            >
                <div className="flex items-center justify-between mb-4">
                    {title && <h2 className="text-xl font-bold">{title}</h2>}
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div>
                    {children}
                </div>
            </div>
        </div>
    );
}
