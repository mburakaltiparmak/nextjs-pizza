"use client";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { verifyPromoCode, removePromoCode } from "@/lib/store/actions/orderActions"; // Ensure verifyPromoCode is exported
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const PromoCodeInput = ({ className }) => {
    const dispatch = useAppDispatch();
    const { promoCode, discountAmount, fetchState } = useAppSelector(state => state.order);
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleApply = async () => {
        if (!code.trim()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const result = await dispatch(verifyPromoCode(code));
            if (result.error) {
                setError(result.error);
            } else {
                setCode(""); // Clear input on success
            }
        } catch (err) {
            console.error("Promo Code Error:", err);
            setError(err.message || "Bir hata oluştu");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = () => {
        dispatch(removePromoCode());
    };

    if (promoCode) {
        return (
            <div className={cn("bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between", className)}>
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-600" />
                    <div>
                        <p className="text-sm font-medium text-green-900 font-Barlow">
                            {promoCode}
                        </p>
                        <p className="text-xs text-green-700">
                            İndirim uygulandı
                        </p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRemove}
                    className="h-8 w-8 p-0 text-green-700 hover:text-green-900 hover:bg-green-100"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        );
    }

    return (
        <div className={cn("space-y-2", className)}>
            <div className="flex gap-2">
                <Input
                    placeholder="Promo Kod"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase());
                        setError(null);
                    }}
                    className="font-Barlow uppercase"
                    disabled={loading}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleApply();
                        }
                    }}
                />
                <Button 
                    onClick={handleApply} 
                    disabled={!code.trim() || loading}
                    className="bg-darkgray text-white hover:bg-black font-Barlow shrink-0"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Uygula"}
                </Button>
            </div>
            {error && (
                <p className="text-xs text-red font-medium pl-1 flex items-center gap-1">
                     {error}
                </p>
            )}
        </div>
    );
};
