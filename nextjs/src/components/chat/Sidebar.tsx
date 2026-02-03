'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import { Send, User, CheckCircle2, Loader2, Zap } from 'lucide-react';
import { LlmMessage } from '@/types/chat.type';
import { Step } from '@/types/file.type';

interface SidebarProps {
  messages: LlmMessage[];
  steps: Step[];
  handleSend: (prompt: string) => void;
  loading: boolean;
  templateSet: boolean;
}

interface TimelineItem {
  type: 'message' | 'step' | 'generating';
  timestamp: number;
  data?: any;
}

export default function Sidebar({ messages, steps, handleSend, loading, templateSet }: SidebarProps) {
  const [newMessage, setNewMessage] = useState('');
  const [streamingText, setStreamingText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const userMessages = useMemo(
    () => messages.filter((m) => m.role === 'user' && m.displayInChat !== false),
    [messages]
  );

  // Build a timeline of messages and steps in chronological order
  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];
    
    userMessages.forEach((msg, idx) => {
      items.push({
        type: 'message',
        timestamp: idx,
        data: msg
      });

      // Add steps that correspond to this message
      steps.forEach((step) => {
        items.push({
          type: 'step',
          timestamp: idx + 0.5 + step.id * 0.01,
          data: step
        });
      });
    });

    // Add generating state if loading
    if (loading) {
      items.push({
        type: 'generating',
        timestamp: userMessages.length + steps.length + 1,
        data: null
      });
    }

    return items.sort((a, b) => a.timestamp - b.timestamp);
  }, [userMessages, steps, loading]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [timeline]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await handleSend(newMessage);
      setNewMessage('');
      setStreamingText('');
    }
  };

  return (
    <div className="h-full flex flex-col text-slate-100 bg-gray-950">
      {/* Timeline Chat */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5" ref={scrollRef}>
        {timeline.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Start by typing a message...
          </div>
        ) : (
          timeline.map((item, idx) => {
            if (item.type === 'message') {
              const message = item.data as LlmMessage;
              return (
                <div key={`msg-${idx}`} className="flex justify-end">
                  <div className="flex gap-2 max-w-xs">
                    <div className="flex-1 rounded-lg px-4 py-2 text-sm leading-relaxed bg-yellow-300/15 text-slate-100 border border-yellow-300/30">
                      {message.content}
                    </div>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-yellow-300 to-yellow-400 text-gray-950 flex-shrink-0 mt-auto">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'step') {
              const step = item.data as Step;
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in-progress';

              return (
                <div key={`step-${idx}`} className="flex justify-start">
                  <div className="flex gap-3 max-w-xs">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500/70" />
                      ) : isInProgress ? (
                        <Loader2 className="h-5 w-5 text-yellow-300 animate-spin" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border border-slate-500/50 border-t-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 rounded-lg px-4 py-2.5 text-sm leading-relaxed bg-slate-800/40 text-slate-200 border border-slate-700/50">
                      <p className="font-medium text-slate-100">{step.title}</p>
                      {step.description && (
                        <p className="text-xs text-slate-400 mt-1">{step.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'generating') {
              return (
                <div key={`gen-${idx}`} className="flex justify-start">
                  <div className="flex gap-3 max-w-xs">
                    <div className="flex-shrink-0 mt-0.5">
                      <Loader2 className="h-5 w-5 text-yellow-300 animate-spin" />
                    </div>
                    <div className="flex-1 rounded-lg px-4 py-2.5 text-sm leading-relaxed bg-gray-900 text-slate-200 border border-yellow-300/30">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-300" />
                        <span>Generating steps...</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            return null;
          })
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-yellow-300/20 bg-gray-900 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask Bolt to make changes..."
            disabled={loading}
            className="flex-1 bg-gray-800 text-slate-100 placeholder-slate-500 px-4 py-3 rounded-lg border border-yellow-300/25 focus:outline-none focus:ring-2 focus:ring-yellow-300/50 text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || loading}
            className="bg-yellow-300 hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 p-3 rounded-lg transition-all font-medium"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
