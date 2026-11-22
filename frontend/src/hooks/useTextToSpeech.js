import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook wrapping window.speechSynthesis.
 * Provides speak(text), cancel(), speaking, isMuted, toggleMute().
 * Persists mute state in localStorage.
 */
export const useTextToSpeech = () => {
  const [supported] = useState(() => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  });

  const [speaking, setSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('nexus_tts_muted') === 'true';
    } catch {
      return false;
    }
  });

  const isMutedRef = useRef(isMuted);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const cancel = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    } catch {
      // ignore
    }
  }, [supported]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nexus_tts_muted', String(next));
      } catch {
        // ignore
      }
      if (next) {
        cancel();
      }
      return next;
    });
  }, [cancel]);

  const speak = useCallback((text) => {
    if (!supported || isMutedRef.current || !text) return;

    try {
      window.speechSynthesis.cancel();

      // Clean speech text (strip markdown brackets/urls/special syntax)
      const cleanText = text
        .replace(/[*_#`~]/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .trim();

      if (!cleanText) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('TTS error:', err);
      setSpeaking(false);
    }
  }, [supported]);

  // Cancel any ongoing speech on unmount
  useEffect(() => {
    return () => {
      if (supported) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, [supported]);

  return {
    supported,
    speaking,
    isMuted,
    toggleMute,
    speak,
    cancel
  };
};

export default useTextToSpeech;
