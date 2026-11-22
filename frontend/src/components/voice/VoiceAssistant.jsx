import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  Square
} from 'lucide-react';
import useVoiceStore from '../../store/voiceStore';
import useChannelStore from '../../store/channelStore';
import useDMStore from '../../store/dmStore';
import useSpeechToText from '../../hooks/useSpeechToText';
import useTextToSpeech from '../../hooks/useTextToSpeech';
import { postVoiceCommand, postVoiceConfirm } from '../../api/voice';
import toast from 'react-hot-toast';

const VoiceAssistant = () => {
  const {
    isOpen,
    status,
    lastTranscript,
    reply,
    pendingConfirmation,
    error,
    history,
    lastTriggerVoice,
    setOpen,
    setStatus,
    setLastTranscript,
    setReply,
    setPendingConfirmation,
    setError,
    clearError,
    addHistory,
    setLastTriggerVoice
  } = useVoiceStore();

  const activeChannelId = useChannelStore((s) => s.activeChannelId);
  const channels = useChannelStore((s) => s.channels);
  const setActiveChannel = useChannelStore((s) => s.setActiveChannel);

  const activeConversation = useDMStore((s) => s.activeConversation);
  const setActiveConversation = useDMStore((s) => s.setActiveConversation);

  const [textInput, setTextInput] = useState('');
  const [isConfirmingAction, setIsConfirmingAction] = useState(false);

  const { speak, cancel: cancelSpeech, speaking, isMuted, toggleMute } = useTextToSpeech();

  // Handle incoming UI actions (e.g. navigation)
  const handleUiActions = useCallback(
    (actions) => {
      if (!Array.isArray(actions)) return;
      for (const action of actions) {
        if (action.type === 'navigate') {
          if (action.target === 'channel') {
            setActiveConversation(null);
            setActiveChannel(action.channelId);
            toast.success(`Navigated to #${action.channelName}`);
          } else if (action.target === 'dm') {
            setActiveChannel(null);
            setActiveConversation({
              id: action.conversationId,
              ...action.otherUser
            });
            toast.success(`Navigated to @${action.otherUser?.username || 'user'}`);
          }
        }
      }
    },
    [setActiveChannel, setActiveConversation]
  );

  // Send command to backend
  const executeCommand = useCallback(
    async (commandText, fromVoice = false) => {
      if (!commandText || !commandText.trim()) return;

      setLastTriggerVoice(fromVoice);
      setLastTranscript(commandText.trim());
      setStatus('thinking');
      clearError();
      setReply('');
      setPendingConfirmation(null);

      // Resolve current context
      const activeChannel = channels.find((c) => c.id === activeChannelId);
      const context = {
        channelId: activeChannelId || undefined,
        channelName: activeChannel?.name || undefined,
        dmId: activeConversation?.id || undefined,
        dmUsername: activeConversation?.username || undefined
      };

      try {
        const res = await postVoiceCommand({
          text: commandText.trim(),
          context,
          history
        });

        const data = res.data;
        setReply(data.reply);

        if (data.uiActions && data.uiActions.length > 0) {
          handleUiActions(data.uiActions);
        }

        if (data.needsConfirmation && data.confirmationId) {
          setStatus('confirming');
          setPendingConfirmation({
            confirmationId: data.confirmationId,
            preview: data.preview
          });
        } else {
          setStatus('idle');
        }

        // Record turn in rolling history
        addHistory({ role: 'user', content: commandText.trim() });
        addHistory({ role: 'assistant', content: data.reply });

        // Speak reply if triggered via voice
        if (fromVoice && data.reply) {
          setStatus('speaking');
          speak(data.reply);
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.error || 'Failed to process voice command. Please try again.';
        setError(errorMsg);
        setStatus('idle');
      }
    },
    [
      activeChannelId,
      channels,
      activeConversation,
      history,
      setLastTriggerVoice,
      setLastTranscript,
      setStatus,
      clearError,
      setError,
      setReply,
      setPendingConfirmation,
      addHistory,
      handleUiActions,
      speak
    ]
  );

  // Speech to text hook for assistant
  const accumulatedTranscriptRef = useRef('');
  const {
    supported: sttSupported,
    listening,
    start: startStt,
    stop: stopStt,
    error: sttError
  } = useSpeechToText({
    lang: 'en-IN',
    continuous: true,
    interimResults: true,
    onTranscript: (spoken) => {
      accumulatedTranscriptRef.current = spoken;
      setLastTranscript(spoken);
    }
  });

  // Cancel any active speech synthesis when user starts speaking
  const handleStartListening = useCallback(() => {
    cancelSpeech();
    accumulatedTranscriptRef.current = '';
    setOpen(true);
    setStatus('listening');
    startStt();
  }, [cancelSpeech, setOpen, setStatus, startStt]);

  const handleStopListening = useCallback(() => {
    stopStt();
    const spoken = accumulatedTranscriptRef.current;
    if (spoken && spoken.trim()) {
      executeCommand(spoken.trim(), true);
    } else {
      setStatus('idle');
    }
  }, [stopStt, executeCommand, setStatus]);

  // Push-to-Talk (Hold Ctrl+Shift+V)
  const isPttActiveRef = useRef(false);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === 'V' || e.key === 'v') &&
        !isPttActiveRef.current
      ) {
        e.preventDefault();
        isPttActiveRef.current = true;
        handleStartListening();
      }
    };

    const handleKeyUp = (e) => {
      if ((e.key === 'V' || e.key === 'v') && isPttActiveRef.current) {
        e.preventDefault();
        isPttActiveRef.current = false;
        handleStopListening();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleStartListening, handleStopListening]);

  // Handle confirmation
  const handleConfirm = async (approve) => {
    if (!pendingConfirmation?.confirmationId) return;
    setIsConfirmingAction(true);
    try {
      const res = await postVoiceConfirm({
        confirmationId: pendingConfirmation.confirmationId,
        approve
      });

      toast.success(res.data.message || (approve ? 'Confirmed!' : 'Cancelled'));
      setPendingConfirmation(null);
      setStatus('idle');
      if (approve && lastTriggerVoice) {
        speak('Action confirmed and completed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Confirmation failed');
    } finally {
      setIsConfirmingAction(false);
    }
  };

  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    const q = textInput.trim();
    setTextInput('');
    executeCommand(q, false);
  };

  // Sync TTS speaking status
  useEffect(() => {
    if (speaking) {
      setStatus('speaking');
    } else if (status === 'speaking') {
      setStatus('idle');
    }
  }, [speaking, status, setStatus]);

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => {
            if (isOpen && listening) {
              handleStopListening();
            } else if (!isOpen) {
              setOpen(true);
            } else {
              setOpen(false);
            }
          }}
          aria-label="Voice Assistant"
          title="Voice Assistant (Ctrl+Shift+V)"
          className={`h-12 w-12 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 relative border ${
            listening
              ? 'bg-red-500 text-white border-red-400 ring-4 ring-red-500/40 animate-pulse scale-105'
              : status === 'thinking'
              ? 'bg-[#4a55c8] text-white border-[#5561d4] ring-4 ring-[#4a55c8]/40'
              : 'bg-[#1e1f22] text-[#6ab0f5] border-[#383a40] hover:border-[#6ab0f5] hover:scale-105'
          }`}
        >
          {status === 'thinking' ? (
            <Loader2 size={22} className="animate-spin" />
          ) : listening ? (
            <MicOff size={22} />
          ) : (
            <Sparkles size={22} />
          )}

          {listening && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
          )}
        </button>
      </div>

      {/* Floating Assistant Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nexus Voice Assistant"
          className="fixed bottom-22 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-[#1e1f22] border border-[#383a40] shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-[#2b2d31] border-b border-[#383a40] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-[#4a55c8]/20 text-[#6ab0f5]">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-white tracking-wide">
                  Nexus Assistant
                </h3>
                <p className="text-[10px] text-gray-400">
                  Hold <kbd className="px-1 py-0.5 rounded bg-[#1e1f22] border border-[#383a40] text-[9px] text-gray-300">Ctrl+Shift+V</kbd> to talk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Unmute spoken replies' : 'Mute spoken replies'}
                className="p-1.5 rounded text-gray-400 hover:text-gray-200 hover:bg-[#383a40] transition-colors"
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (listening) stopStt();
                  cancelSpeech();
                  setOpen(false);
                }}
                className="p-1.5 rounded text-gray-400 hover:text-gray-200 hover:bg-[#383a40] transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Status & Live Content */}
          <div className="p-4 flex flex-col gap-3 max-h-[360px] overflow-y-auto">
            {/* Status Indicator */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span
                  className={`h-2 w-2 rounded-full ${
                    listening
                      ? 'bg-red-500 animate-ping'
                      : status === 'thinking'
                      ? 'bg-amber-400 animate-pulse'
                      : status === 'speaking'
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-blue-400'
                  }`}
                />
                <span className="text-gray-300 capitalize font-medium text-[11px]">
                  {listening
                    ? 'Listening... (Speak now)'
                    : status === 'thinking'
                    ? 'Thinking...'
                    : status === 'speaking'
                    ? 'Speaking reply...'
                    : status === 'confirming'
                    ? 'Confirmation needed'
                    : 'Ready'}
                </span>
              </div>

              {speaking && (
                <button
                  type="button"
                  onClick={cancelSpeech}
                  className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20"
                >
                  <Square size={10} />
                  Stop Voice
                </button>
              )}
            </div>

            {/* Error Message */}
            {(error || sttError) && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {error || sttError}
              </div>
            )}

            {/* User Transcript */}
            {lastTranscript && (
              <div className="p-2.5 rounded-lg bg-[#2b2d31] border border-[#383a40]/60 text-xs text-gray-200">
                <span className="text-[10px] text-gray-400 block font-semibold uppercase tracking-wider mb-1">
                  You Said
                </span>
                <p className="italic text-[#d1d2d3]">"{lastTranscript}"</p>
              </div>
            )}

            {/* Assistant Reply */}
            {reply && (
              <div className="p-2.5 rounded-lg bg-[#4a55c8]/10 border border-[#4a55c8]/30 text-xs text-gray-100">
                <span className="text-[10px] text-[#6ab0f5] block font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles size={11} />
                  Assistant
                </span>
                <p className="leading-relaxed">{reply}</p>
              </div>
            )}

            {/* Confirmation Box */}
            {pendingConfirmation && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex flex-col gap-2">
                <span className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">
                  Action Requires Confirmation
                </span>
                <p className="text-gray-200 font-medium">
                  {pendingConfirmation.preview}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirm(true)}
                    disabled={isConfirmingAction}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-green-600 hover:bg-green-700 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} />
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirm(false)}
                    disabled={isConfirmingAction}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded bg-[#383a40] hover:bg-[#474950] text-gray-200 font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle size={13} />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Area: Mic button + typed input */}
          <div className="p-3 bg-[#2b2d31] border-t border-[#383a40]">
            <form onSubmit={handleTextSubmit} className="flex items-center gap-1.5">
              {sttSupported && (
                <button
                  type="button"
                  onClick={listening ? handleStopListening : handleStartListening}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                    listening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-[#383a40] text-gray-300 hover:text-white hover:bg-[#474950]'
                  }`}
                  title={listening ? 'Stop listening' : 'Start speaking'}
                >
                  {listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              )}

              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Ask or command..."
                className="flex-1 bg-[#1e1f22] border border-[#383a40] rounded-lg px-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#4a55c8]"
              />

              <button
                type="submit"
                disabled={!textInput.trim() || status === 'thinking'}
                className="p-2 rounded-lg bg-[#4a55c8] hover:bg-[#5561d4] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Send command"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceAssistant;
