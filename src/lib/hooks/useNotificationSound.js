import { useEffect, useRef, useState } from 'react';

export const useNotificationSound = () => {
    const audioRef = useRef(null);
    const [isEnabled, setIsEnabled] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio('/sounds/notification.mp3');
        audioRef.current.volume = 0.5;

        // Load saved preferences
        const savedEnabled = localStorage.getItem('notificationSoundEnabled');
        const savedMuted = localStorage.getItem('notificationSoundMuted');

        if (savedEnabled !== null) setIsEnabled(savedEnabled === 'true');
        if (savedMuted !== null) setIsMuted(savedMuted === 'true');

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const play = async () => {
        if (!isEnabled || isMuted || !audioRef.current) return;

        try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
        } catch (error) {
            console.warn('Failed to play notification sound:', error);
        }
    };

    const toggleEnabled = () => {
        const newValue = !isEnabled;
        setIsEnabled(newValue);
        localStorage.setItem('notificationSoundEnabled', String(newValue));
    };

    const toggleMute = () => {
        const newValue = !isMuted;
        setIsMuted(newValue);
        localStorage.setItem('notificationSoundMuted', String(newValue));
    };

    const setVolume = (volume) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, volume));
        }
    };

    return {
        play,
        isEnabled,
        isMuted,
        toggleEnabled,
        toggleMute,
        setVolume,
    };
};
