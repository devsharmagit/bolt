'use client';
import { useMemo, useState } from 'react';
import { Send, User, CheckCircle2, Clock3, Loader2, Sparkles, ListTree } from 'lucide-react';
import { LlmMessage } from '@/types/chat.type';
import { Step } from '@/types/file.type';
import { Loader } from '../ui/Loader';

interface SidebarProps {
  messages: LlmMessage[];
  steps: Step[];
  handleSend: (prompt: string) => void;
  loading: boolean;
  templateSet: boolean;
}

export default function Sidebar({ messages, steps, handleSend, loading, templateSet }: SidebarProps) {
  const [newMessage, setNewMessage] = useState('');

  const userMessages = useMemo(() => messages.filter((m) => m.role === 'user'), [messages]);

  const completedSteps = useMemo(() => steps.filter((s) => s.status === 'completed'), [steps]);

  const stepStats = useMemo(() => {
    const total = steps.length;
    const completed = steps.filter((step) => step.status === 'completed').length;
    const inProgress = steps.filter((step) => step.status === 'in-progress').length;
    const pending = total - completed - inProgress;
    return { total, completed, inProgress, pending };
  }, [steps]);

  const statusChip = {
    completed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      className: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
    },
    'in-progress': {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      className: 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
    },
    pending: {
      icon: <Clock3 className="h-3.5 w-3.5" />,
      className: 'bg-slate-500/10 text-slate-300 ring-1 ring-slate-500/30'
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await handleSend(newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0b1021] text-slate-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]">
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-300" />
            <span className="text-sm font-semibold uppercase tracking-[0.08em] text-indigo-100">Bolt Assistant</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ListTree className="h-4 w-4" />
            <span>{stepStats.completed}/{stepStats.total || 0} steps done</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {steps.length > 0 && (
            <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/70 to-slate-800/40 shadow-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Build Steps</p>
                  <h3 className="text-base font-semibold text-white">Flow overview</h3>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {loading && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2 py-1 text-indigo-200 ring-1 ring-indigo-400/30">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      generating
                    </span>
                  )}
                  <span className="px-2 py-1 rounded-full bg-white/5 text-slate-200">{stepStats.completed} done</span>
                </div>
              </div>

              <div className="space-y-3">
                {completedSteps.length === 0 ? (
                  <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    No completed steps yet.
                  </div>
                ) : (
                  completedSteps.map((step) => (
                  <div
                    key={step.id}
                    className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm transition hover:border-indigo-400/40 hover:bg-indigo-500/5"
                  >
                    <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-400 via-purple-500 to-blue-500" />
                    <div className="pl-4 pr-3 py-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium ${statusChip[step.status].className}`}
                          >
                            {statusChip[step.status].icon}
                            <span className="capitalize">{step.status.replace('-', ' ')}</span>
                          </span>
                          {step.path && <span className="text-slate-400">• {step.path}</span>}
                        </div>
                        <span className="text-[11px] uppercase tracking-[0.14em] text-slate-400">#{step.id}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]" />
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-white">{step.title}</p>
                          <p className="text-xs leading-relaxed text-slate-300">{step.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                )}
              </div>
            </div>
          )}

          {userMessages.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-400">Prompts</p>
                  <h3 className="text-base font-semibold text-white">What you asked for</h3>
                </div>
                <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200">{userMessages.length} messages</span>
              </div>

              <div className="space-y-2">
                {userMessages.map((message, index) => {
                  const isLast = index === userMessages.length - 1;
                  const showGenerating = isLast && (loading || !templateSet);
                  return (
                  <div key={index} className="flex gap-3 flex-row-reverse text-right">
                    <div className="h-10 w-10 rounded-2xl flex items-center justify-center shadow-inner bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex-1 max-w-full items-end flex">
                      <div className="w-full rounded-2xl border border-white/5 px-4 py-3 shadow-md backdrop-blur-sm bg-gradient-to-br from-indigo-600/90 to-purple-600/90 text-white">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-slate-200/90 mb-1">
                          <span className="font-semibold">user</span>
                        </div>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        {showGenerating && (
                          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs text-white/90">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="italic">generating</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {(loading || !templateSet) && <Loader />}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/70 backdrop-blur">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask Bolt to make changes..."
              className="flex-1 bg-white/5 text-white placeholder-slate-400 px-3 py-3 rounded-xl border border-white/5 focus:outline-none focus:ring-2 focus:ring-indigo-500/80"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/30"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
