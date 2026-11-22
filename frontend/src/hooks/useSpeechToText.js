import { useState, useRef, useEffect, useCallback } from 'react';
import { uploadVoiceAudio } from '../api/voice';

/**
 * Hook wrapping the Web Speech Recognition API (SpeechRecognition / webkitSpeechRecognition)
 * with optional MediaRecorder + Cloud STT fallback.
 * Exposes: supported, listening, transcript, error, start(), stop().
 *
 * @param {Object} options
 * @param {string} [options.lang='en-IN'] - Language code (e.g. 'en-IN', 'en-US')
 * @param {boolean} [options.continuous=true] - Continuous listening mode
 * @param {boolean} [options.interimResults=true] - Emit interim transcript results
 * @param {Function} [options.onTranscript] - Optional callback receiving (transcript, isFinal)
 */
export const useSpeechToText = (options = {}) => {
  const {
    lang = 'en-IN',
    continuous = true,
    interimResults = true,
    onTranscript
  } = options;

  const [hasNativeSTT] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      Boolean(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
  });

  const [hasMediaRecorder] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      Boolean(window.navigator?.mediaDevices?.getUserMedia && window.MediaRecorder)
    );
  });

  const supported = hasNativeSTT || hasMediaRecorder;

  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isListeningRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Native SpeechRecognition setup
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setListening(true);
        setError(null);
      };

      recognition.onresult = (event) => {
        let currentFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            currentFinal += text;
          } else {
            currentInterim += text;
          }
        }

        const combined = (currentFinal || currentInterim).trim();
        if (combined) {
          setTranscript(combined);
          if (onTranscriptRef.current) {
            onTranscriptRef.current(combined, Boolean(currentFinal));
          }
        }
      };

      recognition.onerror = (event) => {
        let msg = 'Speech recognition error';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          msg = 'Microphone permission denied. Please allow microphone access.';
        } else if (event.error === 'no-speech') {
          msg = 'No speech detected. Please try again.';
        } else if (event.error === 'network') {
          msg = 'Network error during speech recognition.';
        } else if (event.error === 'aborted') {
          return;
        } else {
          msg = `Speech error: ${event.error}`;
        }
        setError(msg);
      };

      recognition.onend = () => {
        isListeningRef.current = false;
        setListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore cleanup abort error
        }
        recognitionRef.current = null;
      }
    };
  }, [lang, continuous, interimResults]);

  const start = useCallback(async () => {
    if (isListeningRef.current) return;
    setError(null);
    setTranscript('');

    if (hasNativeSTT && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        if (err.name !== 'InvalidStateError') {
          setError('Failed to start speech recognition.');
        }
      }
      return;
    }

    // Fallback: MediaRecorder
    if (hasMediaRecorder) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const recorder = new MediaRecorder(stream);

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((track) => track.stop());
          const audioBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm'
          });
          if (audioBlob.size > 0) {
            try {
              const res = await uploadVoiceAudio(audioBlob);
              const text = res.data?.text || '';
              if (text) {
                setTranscript(text);
                if (onTranscriptRef.current) {
                  onTranscriptRef.current(text, true);
                }
              }
            } catch (cloudErr) {
              setError(
                cloudErr.response?.data?.error || 'Cloud speech transcription failed.'
              );
            }
          }
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        isListeningRef.current = true;
        setListening(true);
      } catch (mediaErr) {
        if (
          mediaErr.name === 'NotAllowedError' ||
          mediaErr.name === 'PermissionDeniedError'
        ) {
          setError('Microphone permission denied. Please allow microphone access.');
        } else {
          setError('Failed to access microphone for recording.');
        }
      }
    }
  }, [hasNativeSTT, hasMediaRecorder]);

  const stop = useCallback(() => {
    if (!isListeningRef.current) return;

    if (hasNativeSTT && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    } else if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      isListeningRef.current = false;
      setListening(false);
    }
  }, [hasNativeSTT]);

  return {
    supported,
    listening,
    transcript,
    error,
    start,
    stop
  };
};

export default useSpeechToText;
