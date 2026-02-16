<div align="center">

# ⚡ Bolt - AI Web Development Assistant

**Build full-stack applications from natural language prompts**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)
[![WebContainer](https://img.shields.io/badge/WebContainer-API-ff6934)](https://webcontainers.io/)

Transform ideas into working web applications in seconds. Powered by Google Gemini AI and WebContainer technology.

[Demo](#) · [Report Bug](#) · [Request Feature](#)

</div>

---

## 🎯 What is This?

Bolt is an AI-powered development assistant that turns natural language descriptions into fully functional web applications. Unlike traditional code generators, Bolt creates **complete, production-ready projects** with:

- ✨ Full source code generation (React, Node.js, TypeScript)
- 🎨 Beautiful, modern UI with Tailwind CSS
- 🔴 Live in-browser preview using WebContainer
- 📝 Monaco code editor for viewing/copying code
- 💬 Interactive chat interface for iterative development
- 🔄 Session persistence and history management
- 🚦 Built-in rate limiting

## 🚀 How It Works

1. **Describe your app** - Enter a natural language prompt like "Create a todo app with dark theme"
2. **AI generates code** - Google Gemini AI creates complete project files
3. **Instant preview** - WebContainer runs your app directly in the browser
4. **Iterate & refine** - Chat with AI to modify and enhance your application

### Architecture

![unnamed](https://github.com/user-attachments/assets/f5fee310-ddc5-412e-a4d7-745b1c80aece)


> **Diagram coming soon** - See section below on creating the architecture diagram

## ⚡ Quick Start

### Prerequisites

- Node.js 20+ installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Upstash Redis account ([Sign up](https://upstash.com/)) - for rate limiting

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd nextjs

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Setup

Create a `.env.local` file with the following:

```env
# Required: Google Gemini API Key
GOOGLE_API_KEY=your_gemini_api_key_here

# Required: Upstash Redis credentials (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token

# Optional: Enable/disable rate limiting
ENABLE_RATELIMIT=true  # Set to false for development
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) - Start building!

## 🛠️ Tech Stack

**Frontend**
- Next.js 16 with App Router & Turbopack
- React 19 with Server Components
- TypeScript 5 for type safety
- Tailwind CSS 4 for styling
- Monaco Editor for code display
- Lucide React for icons

**AI & Runtime**
- Google Gemini 2.5 Flash for code generation
- WebContainer API for in-browser Node.js execution
- Custom prompt engineering for optimal results

**Backend & Services**
- Next.js Server Actions
- Upstash Redis for rate limiting
- LocalStorage for session management

## ✨ Features

### Core Functionality
- 🤖 **AI Code Generation** - Complete apps from simple prompts
- 🎨 **Live Preview** - See your app running instantly
- 📁 **File Explorer** - Browse generated project structure
- 💻 **Code Viewer** - Syntax-highlighted code with copy functionality
- 💾 **Session Management** - Save and resume projects
- 📜 **Chat History** - Access previous conversations

### Developer Experience
- ⚡ **Turbopack** - Lightning-fast hot module replacement
- 🎯 **TypeScript** - Full type safety across the codebase
- 🧩 **Component Architecture** - Modular, reusable components
- ⌨️ **Keyboard Shortcuts** - Efficient workflow navigation
  - `Cmd/Ctrl + K` - Toggle sidebar
  - `Cmd/Ctrl + Shift + C` - Clear chat

### Rate Limiting
- ⏱️ Configurable request limits per IP
- 🔒 Redis-backed distributed rate limiting
- 📊 Real-time remaining prompt display

## 📦 Project Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
```

## 🎨 Creating the Architecture Diagram

To create a professional architecture diagram in Excalidraw:

### Recommended Elements to Include

1. **User Flow**
   - Landing Page → Prompt Input → Chat Interface → Live Preview

2. **Frontend Components**
   - Chat Interface (Sidebar, Messages, Input)
   - Code View (Monaco Editor, File Explorer)
   - Preview Panel (WebContainer IFrame)

3. **Backend Services**
   - Next.js Server Actions Layer
   - Google Gemini AI API
   - Upstash Redis (Rate Limiting)

4. **Data Flow**
   - User Prompt → Rate Limit Check → AI Processing → XML Parsing → File Generation → WebContainer Execution → Preview

### Excalidraw Tips for Better Diagrams

**Visual Hierarchy**
- Use **different shapes** for different layers (rectangles for services, rounded for UI components, cylinders for data stores)
- Apply **color coding** (frontend = blue, backend = green, external services = orange)
- Make **critical paths thicker** (main user flow should stand out)

**Layout Best Practices**
- Organize **top-to-bottom** or **left-to-right** based on data flow
- Group related components with **light background rectangles**
- Use **arrows with labels** to show data flow direction
- Add **icons** for services (use Excalidraw's library)

**Clarity**
- Keep it **simple** - don't overcomplicate
- Use **consistent spacing** between elements
- Add **brief annotations** for complex interactions
- Highlight **key technologies** (Next.js, WebContainer, Gemini)

**Suggested Layers (Left to Right)**
1. User Interface (Browser)
2. Next.js Frontend & Server Actions
3. External Services (Gemini AI, Upstash)
4. WebContainer Runtime
5. Database/Storage (LocalStorage)

You can also include sequence diagrams for the prompt → code generation flow.

## 🔑 Key Configuration

Rate limiting is configured in [src/lib/rate-limit.ts](src/lib/rate-limit.ts). Adjust limits based on your needs:

```typescript
export const CHAT_PROMPT_LIMIT = 10; // prompts per window
export const RATE_LIMIT_WINDOW = '1 h'; // time window
```

System prompts and AI behavior can be customized in [src/lib/prompt.ts](src/lib/prompt.ts).

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ using Next.js, React, and AI**

[⬆ Back to Top](#-bolt---ai-web-development-assistant)

</div>
