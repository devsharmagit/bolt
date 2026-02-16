'use client';
import { useEffect, useState } from 'react';
import { Clock, Trash2, X, MessageSquare } from 'lucide-react';
import { chatStorage, ChatSession } from '@/lib/localStorage';
import { useRouter } from 'next/navigation';

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function History({ isOpen, onClose }: HistoryProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = () => {
    const allSessions = chatStorage.getAllSessions();
    const current = chatStorage.getCurrentSessionId();
    setSessions(allSessions);
    setCurrentSessionId(current);
  };

  const handleSelectSession = (sessionId: string) => {
    chatStorage.setCurrentSessionId(sessionId);
    router.push('/chat');
    onClose();
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this chat session?')) {
      chatStorage.deleteSession(sessionId);
      loadSessions();
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-xl border border-yellow-300/30 w-full max-w-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-yellow-300/20">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-yellow-300" />
            <h2 className="text-xl font-bold text-white">Chat History</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-4">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
              <MessageSquare className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No chat history yet</p>
              <p className="text-sm mt-2">Start a new chat to see it here!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group relative p-4 rounded-lg border cursor-pointer transition-all ${
                    session.id === currentSessionId
                      ? 'bg-yellow-300/10 border-yellow-300/50'
                      : 'bg-gray-800/50 border-gray-700 hover:border-yellow-300/30 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium truncate mb-1">
                        {session.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {session.initialPrompt}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.updatedAt)}
                        </span>
                        <span>{session.messages.length} messages</span>
                        <span>{session.files.length} files</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 hover:bg-rose-900/50 rounded-lg transition-all"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </button>
                  </div>
                  {session.id === currentSessionId && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-300/20 text-yellow-300 rounded">
                        Current
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-yellow-300/20">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-yellow-300 hover:bg-yellow-200 text-gray-950 text-sm font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
