'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Sparkles, Code2, Layers } from 'lucide-react';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Store the prompt in sessionStorage or pass as URL param
      sessionStorage.setItem('initialPrompt', prompt);
      router.push('/chat');
    }
  };

  const examplePrompts = [
    "Create a modern todo app with dark theme",
    "Build a weather dashboard with charts",
    "Make a responsive portfolio website",
    "Design a chat interface like Discord"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(120,119,198,0.1),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.05),transparent)]"></div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Bolt
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Docs</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Examples</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-400 mr-2" />
              <span className="text-sm text-indigo-300">AI-Powered Development</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-400 bg-clip-text text-transparent">
              Prompt, run, edit, deploy
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              StackBlitz Bolt is an AI assistant that can{' '}
              <span className="text-indigo-300">write</span>, <span className="text-purple-300">run</span>, and{' '}
              <span className="text-blue-300">edit</span> full-stack web applications.
            </p>
          </div>

          {/* Prompt Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
                <div className="flex items-center p-2">
                  <div className="flex-1 flex items-center">
                    <Code2 className="w-5 h-5 text-gray-400 ml-4 mr-3" />
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the app you want to build..."
                      className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg py-3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  >
                    <Layers className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Example Prompts */}
          <div className="space-y-3">
            <p className="text-sm text-gray-400 mb-4">Try one of these examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 bg-gray-800/30 hover:bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-gray-300 hover:text-white transition-all duration-200 hover:border-gray-600/50"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16">
          {[
            {
              icon: Code2,
              title: "Full-Stack Development",
              description: "Build complete applications with frontend, backend, and database integration"
            },
            {
              icon: Zap,
              title: "Instant Preview",
              description: "See your application running in real-time as you make changes"
            },
            {
              icon: Layers,
              title: "Modern Stack",
              description: "Uses the latest web technologies and best practices out of the box"
            }
          ].map((feature, index) => (
            <div key={index} className="p-6 bg-gray-800/20 backdrop-blur-sm border border-gray-700/30 rounded-xl hover:border-gray-600/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}