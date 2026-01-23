"use client";

import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const SoundToggle = ({ isEnabled, isMuted, onToggleEnabled, onToggleMute }) => {
    return (
        <div className="flex items-center gap-2">
            <Button
                onClick={onToggleMute}
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
                title={isMuted ? "Sesi aç" : "Sesi kapat"}
            >
                {isMuted ? (
                    <VolumeX className="w-4 h-4 text-gray-400" />
                ) : (
                    <Volume2 className="w-4 h-4 text-green-500" />
                )}
                <span className="text-sm">
                    {isMuted ? "Sessize alındı" : "Ses açık"}
                </span>
            </Button>
        </div>
    );
};
