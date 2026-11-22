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
          aria-label="Nexus Voice Assistant"
          title="Voice Assistant (Hold Ctrl+Shift+V)"
          className={`h-11 w-11 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 relative border ${
            listening
              ? 'bg-status-offline text-white border-status-offline ring-4 ring-status-offline/30 animate-pulse scale-105'
              : status === 'thinking'
              ? 'bg-accent text-white border-accent ring-4 ring-accent/30'
              : 'bg-surface text-ink-primary border-border-strong hover:border-accent hover:text-accent hover:scale-105'
          }`}
        >
          {status === 'thinking' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : listening ? (
            <MicOff size={18} />
          ) : (
            <Sparkles size={18} />
          )}

          {listening && (
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-offline opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-status-offline" />
            </span>
          )}
        </button>
      </div>

      {/* Floating Assistant Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Nexus Voice Assistant"
          className="fixed bottom-20 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] rounded-xl bg-surface border border-border-strong shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-sidebar/50 border-b border-border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-accent/15 text-accent">
                <Sparkles size={15} />
              </div>
              <div>
                <h3 className="text-xs font-semibold text-ink-primary tracking-tight">
                  Nexus Assistant
                </h3>
                <p className="text-[10px] text-ink-faint">
                  Hold <kbd className="px-1 py-0.5 rounded bg-canvas border border-border-strong text-[9px] font-mono text-ink-secondary">Ctrl+Shift+V</kbd> to talk
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleMute}
                title={isMuted ? 'Unmute spoken replies' : 'Mute spoken replies'}
                className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors"
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
                className="p-1.5 rounded-md text-ink-secondary hover:text-ink-primary hover:bg-surface-hover transition-colors"
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
                      ? 'bg-status-offline animate-ping'
                      : status === 'thinking'
                      ? 'bg-status-away animate-pulse'
                      : status === 'speaking'
                      ? 'bg-status-online animate-pulse'
                      : 'bg-accent'
                  }`}
                />
                <span className="text-ink-secondary capitalize font-medium text-[11px]">
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
                  className="flex items-center gap-1 text-[11px] text-status-offline hover:opacity-80 px-2 py-0.5 rounded bg-status-offline/10 border border-status-offline/20"
                >
                  <Square size={10} />
                  Stop Voice
                </button>
              )}
            </div>

            {/* Error Message */}
            {(error || sttError) && (
              <div className="p-2.5 rounded-lg bg-status-offline/10 border border-status-offline/30 text-xs text-status-offline">
                {error || sttError}
              </div>
            )}

            {/* User Transcript */}
            {lastTranscript && (
              <div className="p-3 rounded-lg bg-canvas border border-border-subtle text-xs text-ink-primary">
                <span className="text-[10px] text-ink-faint block font-semibold uppercase tracking-wider mb-1">
                  You Said
                </span>
                <p className="italic text-ink-secondary">&quot;{lastTranscript}&quot;</p>
              </div>
            )}

            {/* Assistant Reply */}
            {reply && (
              <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-xs text-ink-primary">
                <span className="text-[10px] text-accent block font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles size={11} />
                  Assistant
                </span>
                <p className="leading-relaxed">{reply}</p>
              </div>
            )}

            {/* Confirmation Box */}
            {pendingConfirmation && (
              <div className="p-3 rounded-lg bg-status-away/10 border border-status-away/30 text-xs flex flex-col gap-2">
                <span className="text-[10px] text-status-away font-semibold uppercase tracking-wider">
                  Action Requires Confirmation
                </span>
                <p className="text-ink-primary font-medium">
                  {pendingConfirmation.preview}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => handleConfirm(true)}
                    disabled={isConfirmingAction}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-status-online hover:opacity-90 text-white font-medium transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 size={13} />
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirm(false)}
                    disabled={isConfirmingAction}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface border border-border-strong hover:bg-surface-hover text-ink-primary font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle size={13} />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Area: Mic button + typed input */}
          <div className="p-3 bg-sidebar/50 border-t border-border-subtle">
            <form onSubmit={handleTextSubmit} className="flex items-center gap-2">
              {sttSupported && (
                <button
                  type="button"
                  onClick={listening ? handleStopListening : handleStartListening}
                  className={`p-2 rounded-lg transition-colors flex items-center justify-center ${
                    listening
                      ? 'bg-status-offline text-white animate-pulse'
                      : 'bg-surface border border-border-strong text-ink-secondary hover:text-ink-primary hover:bg-surface-hover'
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
                className="flex-1 bg-input border border-border-strong rounded-lg px-3 py-1.5 text-xs text-ink-primary placeholder:text-ink-faint focus:outline-none focus:border-accent"
              />

              <button
                type="submit"
                disabled={!textInput.trim() || status === 'thinking'}
                className="p-2 rounded-lg bg-accent hover:bg-accent-hover text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
