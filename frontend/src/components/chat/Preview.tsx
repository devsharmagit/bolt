import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';

const Preview: React.FC = () => {
  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">Preview</span>
          <div className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
            Live
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="text-gray-400 hover:text-white p-1 rounded transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-white">
        <iframe
          src="data:text/html;charset=utf-8,<!DOCTYPE html><html><head><meta charset='UTF-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><title>Preview</title><style>* { margin: 0; padding: 0; box-sizing: border-box; } body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #111827; color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; } .container { text-align: center; padding: 2rem; } h1 { font-size: 3rem; margin-bottom: 1rem; background: linear-gradient(to right, #8B5CF6, #06B6D4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; } p { color: #9CA3AF; font-size: 1.2rem; } .demo-card { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5rem; padding: 2rem; margin: 2rem auto; max-width: 400px; backdrop-filter: blur(10px); } .button { background: linear-gradient(to right, #8B5CF6, #06B6D4); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; transition: transform 0.2s; } .button:hover { transform: scale(1.05); } </style></head><body><div class='container'><h1>Hello World</h1><p>Your application is running!</p><div class='demo-card'><h3 style='margin-bottom: 1rem;'>Demo Component</h3><p style='margin-bottom: 1rem; font-size: 1rem;'>This is a preview of your application.</p><button class='button'>Click me!</button></div></div></body></html>"
          className="w-full h-full border-0"
          title="App Preview"
        />
      </div>
    </div>
  );
};

export default Preview;