// src/components/dashboard/DashboardErrorBanner.jsx
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardErrorBanner({ 
  error, 
  onRetry, 
  retryCount, 
  maxRetries 
}) {
  if (!error) return null;

  const isRetrying = retryCount > 0;
  const canRetry = !maxRetries || retryCount < maxRetries;

  return (
    <div className="bg-red-50 text-red border border-red-200 p-4 rounded-lg shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-Barlow font-semibold mb-1">
            {isRetrying ? 'Yeniden deneniyor...' : 'Veri yüklenirken bir hata oluştu'}
          </p>
          <p className="font-Barlow text-sm mb-3">{error}</p>
          
          {/* Retry bilgisi */}
          {isRetrying && maxRetries && (
            <p className="font-Barlow text-xs mb-3 opacity-75">
              Deneme: {retryCount}/{maxRetries}
            </p>
          )}

          {/* Retry butonu */}
          {canRetry && !isRetrying && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm"
              className="border-red text-red hover:bg-red hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          )}

          {/* Max retry mesajı */}
          {!canRetry && (
            <div className="text-sm opacity-75">
              <p>Maksimum deneme sayısına ulaşıldı. Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}