import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicControlProps {
  musicUrl: string;
  shouldPlay?: boolean;
}

export function MusicControl({ musicUrl, shouldPlay = true }: MusicControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!musicUrl) return;
    const audio = new Audio(musicUrl);
    audio.loop = true;
    audioRef.current = audio;

    if (shouldPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Autoplay policy: start audio on first user interaction anywhere
        const startOnInteraction = () => {
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch(() => {});
          }
          window.removeEventListener('click', startOnInteraction);
          window.removeEventListener('touchstart', startOnInteraction);
        };
        window.addEventListener('click', startOnInteraction, { once: true });
        window.addEventListener('touchstart', startOnInteraction, { once: true });
      });
    }

    return () => {
      audio.pause();
      audio.removeAttribute('src');
    };
  }, [musicUrl, shouldPlay]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(e => console.error("Playback failed", e));
      }
    }
  };

  return (
    <button
      onClick={togglePlay}
      className="fixed top-5 right-5 z-50 p-2.5 sm:p-3 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-pink-border/80 transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center text-wine-dark"
      aria-label={isPlaying ? "Mute music" : "Play music"}
      title={isPlaying ? "Mute Background Music" : "Play Background Music"}
    >
      {isPlaying ? (
        <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-burgundy animate-pulse" />
      ) : (
        <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-wine-dark/70" />
      )}
    </button>
  );
}
