"use client";

import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardErrorBanner({ 
  error, 
  onRetry, 
  retryCount, 
  maxRetries 
}) {
  const showRetryInfo = typeof retryCount === 'number' && typeof maxRetries === 'number';
  const canRetry = !showRetryInfo || retryCount < maxRetries;

  return (
    <div className="bg-red/10 border-2 border-red rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-red/20 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red mb-2 font-Quattrocento_Sans">
            Veri Yükleme Hatası
          </h3>
          
          <p className="text-darkgray mb-4 font-Barlow">
            {error || "Dashboard verileri yüklenirken bir hata oluştu."}
          </p>

          {/* Retry Info */}
          {showRetryInfo && (
            <p className="text-sm text-gray mb-4 font-Barlow">
              Deneme: {retryCount} / {maxRetries}
            </p>
          )}

          {/* Retry Button */}
          {canRetry && onRetry && (
            <Button
              onClick={onRetry}
              className="bg-red hover:bg-yellow hover:text-red text-white transition-colors duration-300 font-Barlow flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Tekrar Dene
            </Button>
          )}

          {!canRetry && (
            <p className="text-sm text-gray font-Barlow italic">
              Maksimum deneme sayısına ulaşıldı. Lütfen sayfayı yenileyin.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}