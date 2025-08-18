import React, { useState } from 'react';
import { Send, User, Bot } from 'lucide-react';
import { Message, Step } from '../../types';

interface SidebarProps {
  messages: Message[];
  steps: Step[];
}

const Sidebar: React.FC<SidebarProps> = ({ messages, steps }) => {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Handle sending new message
      setNewMessage('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">

      {/* Content */}
      <div className="h-full flex flex-col">
        {/* Messages and Steps */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Steps Section */}
          {steps.length > 0 && (
            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Build Steps</h3>
              {steps.map((step) => (
                <div key={step.id} className="border border-gray-800 rounded-lg p-3 bg-gray-800/30">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className={`w-2 h-2 rounded-full ${
                      step.status === 'completed' 
                        ? 'bg-green-500' 
                        : step.status === 'in-progress'
                        ? 'bg-yellow-500 animate-pulse'
                        : 'bg-gray-500'
                    }`}></div>
                    <h4 className="font-medium text-sm">{step.title}</h4>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Messages Section */}
          {messages.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Conversation</h3>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-indigo-500' 
                      : 'bg-gradient-to-r from-purple-500 to-indigo-500'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-3 py-2 rounded-lg max-w-xs lg:max-w-sm ${
                      message.role === 'user'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-gray-800 text-gray-100'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask Bolt to make changes..."
              className="flex-1 bg-gray-800 text-white placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;