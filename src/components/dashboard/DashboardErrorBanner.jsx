import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardErrorBanner({ error, onRetry }) {
  if (!error) return null;

  return (
    <div className="bg-red-50 text-red border border-red-200 p-4 mb-6 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-Barlow font-semibold mb-1">
            Veri yüklenirken bir hata oluştu
          </p>
          <p className="font-Barlow text-sm mb-3">{error}</p>
          <Button 
            onClick={onRetry} 
            variant="outline" 
            size="sm"
            className="border-red text-red hover:bg-red hover:text-white"
          >
            Tekrar Dene
          </Button>
        </div>
      </div>
    </div>
  );
}