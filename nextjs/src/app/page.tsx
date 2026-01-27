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
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-neutral-950 text-zinc-50">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_70%)]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-900/70 ring-1 ring-white/10 shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]">
            <Zap className="w-5 h-5 text-amber-200" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-zinc-50">
            Bolt
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <a href="#" className="text-zinc-400 hover:text-zinc-100 transition-colors">Docs</a>
          <a href="#" className="text-zinc-400 hover:text-zinc-100 transition-colors">Examples</a>
          <a href="#" className="text-zinc-400 hover:text-zinc-100 transition-colors">GitHub</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 py-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 ring-1 ring-white/10 mb-6">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-sm text-zinc-200">AI-powered development</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 text-zinc-50">
              Build apps from a prompt
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              An AI assistant that helps you <span className="text-zinc-200">write</span>, <span className="text-zinc-200">run</span>, and <span className="text-zinc-200">iterate</span> on full‑stack web apps—fast.
            </p>
          </div>

          {/* Prompt Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.18),transparent_60%)]" />
              <div className="relative bg-zinc-900/50 backdrop-blur-xl ring-1 ring-white/10 rounded-2xl overflow-hidden shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]">
                <div className="flex items-center p-2">
                  <div className="flex-1 flex items-center">
                    <Code2 className="w-5 h-5 text-zinc-400 ml-4 mr-3" />
                    <input
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the app you want to build..."
                      className="flex-1 bg-transparent text-zinc-50 placeholder-zinc-500 focus:outline-none text-lg py-3"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!prompt.trim()}
                    className="px-5 py-3 rounded-xl font-medium bg-zinc-50 text-zinc-950 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    <span className="hidden sm:inline">Generate</span>
                    <Layers className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Example Prompts */}
          <div className="space-y-3">
            <p className="text-sm text-zinc-400 mb-4">Try an example:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 rounded-xl bg-white/5 hover:bg-white/8 ring-1 ring-white/10 hover:ring-white/15 text-sm text-zinc-300 hover:text-zinc-50 transition"
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
            <div key={index} className="p-6 bg-white/4 backdrop-blur-sm ring-1 ring-white/10 rounded-2xl hover:ring-white/15 transition group">
              <div className="w-12 h-12 rounded-xl bg-white/5 ring-1 ring-white/10 flex items-center justify-center mb-4 group-hover:translate-y-[-1px] transition-transform">
                <feature.icon className="w-6 h-6 text-amber-200" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-50">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}