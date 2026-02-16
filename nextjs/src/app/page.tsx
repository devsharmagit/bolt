'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Sparkles, Code2, Layers } from 'lucide-react';
import { getRateLimitStatusAction } from '@/app/actions/rate-limit';
import { chatStorage } from '@/lib/localStorage';

export default function LandingPage() {
  const [prompt, setPrompt] = useState('');
  const [remainingPrompts, setRemainingPrompts] = useState<number | null>(null);
  const [rateLimitLoading, setRateLimitLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchRateLimit = async () => {
      try {
        const status = await getRateLimitStatusAction();
        setRemainingPrompts(status.remaining);
      } catch {
        setRemainingPrompts(null);
      } finally {
        setRateLimitLoading(false);
      }
    };

    fetchRateLimit();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      // Store the prompt using localStorage helper
      chatStorage.saveInitialPrompt(prompt);
      router.push('/chat');
    }
  };

  const examplePrompts = [
    "Create a modern todo app with dark theme",
    "Build a weather dashboard with charts",
    "Make a responsive portfolio website",
    "Design a chat interface like Discord"
  ];

  const faqs = [
    {
      question: 'What is Bolt?',
      answer:
        'Bolt is an AI coding workspace that turns prompts into working app changes. You can generate, review, and iterate without leaving the browser.'
    },
    {
      question: 'How many prompts can I send?',
      answer:
        'This deployment uses per-IP rate limiting with Upstash Redis. The limit is 3 prompts per IP in a 1-day window.'
    },
    {
      question: 'Which stack does this project use?',
      answer:
        'The app is built with Next.js + React and integrates Gemini for generation plus WebContainer for live preview and editing.'
    },
    {
      question: 'Where can I follow project updates?',
      answer:
        'Use the GitHub repository and X profile links below for code updates, releases, and development notes.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-zinc-50">
      {/* Subtle background texture */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(253,224,71,0.06),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(253,224,71,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(253,224,71,0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,black_35%,transparent_70%)]" />
      <div className="pointer-events-none absolute -top-28 left-[8%] h-72 w-72 rounded-full bg-yellow-300/10 blur-3xl motion-float-slow" />
      <div className="pointer-events-none absolute top-[35%] right-[6%] h-64 w-64 rounded-full bg-amber-400/10 blur-3xl motion-float-delayed" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gray-900 ring-1 ring-yellow-300/30 shadow-[0_1px_0_rgba(253,224,71,0.15)_inset]">
            <Zap className="w-5 h-5 text-yellow-300" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-zinc-50">
            Bolt
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <a href="#faq" className="text-zinc-400 hover:text-zinc-100 transition-colors">FAQ</a>
          <a href="#about" className="text-zinc-400 hover:text-zinc-100 transition-colors">About</a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="relative z-10 px-6 py-6">
        <div className="max-w-4xl mx-auto text-center mb-12 motion-fade-up">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-300/10 ring-1 ring-yellow-300/30 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm text-zinc-200">AI-powered development</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 text-zinc-50">
              Build apps from a prompt
            </h1>
            <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto leading-relaxed">
              An AI assistant that helps you <span className="text-zinc-200">write</span>, <span className="text-zinc-200">run</span>, and <span className="text-zinc-200">iterate</span> on full‑stack web apps—fast.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900 ring-1 ring-yellow-300/25">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-zinc-300">
                {rateLimitLoading
                  ? 'Checking prompt quota...'
                  : remainingPrompts === null
                    ? 'Prompt quota unavailable'
                    : `Prompts left today: ${remainingPrompts}/3`}
              </span>
            </div>
          </div>

          {/* Prompt Input */}
          <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(ellipse_at_center,rgba(253,224,71,0.2),transparent_60%)]" />
              <div className="relative bg-gray-900 backdrop-blur-xl ring-1 ring-yellow-300/25 rounded-2xl overflow-hidden shadow-[0_1px_0_rgba(253,224,71,0.12)_inset]">
                <div className="flex items-center p-2">
                  <div className="flex-1 flex items-center">
                    <Code2 className="w-5 h-5 text-yellow-300 ml-4 mr-3" />
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
                    disabled={!prompt.trim() || remainingPrompts === 0}
                    className="px-5 py-3 rounded-xl font-medium bg-yellow-300 text-gray-950 hover:bg-yellow-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
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
                  className="text-left p-3 rounded-xl bg-gray-900 hover:bg-gray-800 ring-1 ring-yellow-300/25 hover:ring-yellow-300/50 text-sm text-zinc-300 hover:text-zinc-50 transition"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section id="about" className="max-w-5xl mx-auto mb-16 motion-fade-up motion-delay-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Prompt to prototype', value: 'Seconds' },
              { label: 'Built-in prompt limit', value: '3/IP/day' },
              { label: 'Live collaboration surface', value: 'Code + Preview' }
            ].map((item) => (
              <div key={item.label} className="rounded-2xl p-5 bg-gray-900/90 ring-1 ring-yellow-300/20 text-center">
                <p className="text-2xl font-semibold text-zinc-100">{item.value}</p>
                <p className="text-sm text-zinc-400 mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-16 motion-fade-up motion-delay-2">
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
            <div key={index} className="p-6 bg-gray-900 backdrop-blur-sm ring-1 ring-yellow-300/25 rounded-2xl hover:ring-yellow-300/50 transition group">
              <div className="w-12 h-12 rounded-xl bg-gray-800 ring-1 ring-yellow-300/30 flex items-center justify-center mb-4 group-hover:translate-y-[-1px] transition-transform">
                <feature.icon className="w-6 h-6 text-yellow-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-zinc-50">{feature.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </section>

        <section id="faq" className="max-w-5xl mx-auto mt-20 mb-10 motion-fade-up motion-delay-3">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100 text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl p-6 bg-gray-900 ring-1 ring-yellow-300/20">
                <h3 className="text-base font-semibold text-zinc-100 mb-2">{faq.question}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-yellow-300/15 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-zinc-200 font-medium">Bolt by Dev Sharma</p>
            <p className="text-zinc-400 text-sm">Build full-stack apps from natural language prompts.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href="https://github.com/devsharmagit/bolt" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-100 transition-colors">GitHub Repo</a>
            <a href="https://x.com/devsharmatwt" target="_blank" rel="noreferrer" className="text-zinc-400 hover:text-zinc-100 transition-colors">X Profile</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
