import React, { useState, useEffect, useRef } from 'react';
import { ArrowUp, Ghost, Bell, Settings, UserCircle, ChevronDown, Loader2 } from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { Message, AVAILABLE_MODELS } from './types';
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

function getGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Buenos días';
  } else if (hour >= 12 && hour < 18) {
    return 'Buenas tardes';
  } else {
    return 'Buenas noches';
  }
}

function App() {
  const [inputValue, setInputValue] = useState('');
  const [greeting, setGreeting] = useState(getGreeting());
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [isModelMenuOpen, setIsModelMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const completion = await client.chat.completions.create({
        model: selectedModel.id,
        messages: [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        extra_headers: {
          "HTTP-Referer": window.location.href,
          "X-Title": "Emil Chat",
        },
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: completion.choices[0].message.content || '',
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, encontré un error. Por favor, intenta de nuevo.',
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: number) => {
    return new Intl.DateTimeFormat('es', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(timestamp);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-background/80 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Ghost className="w-6 h-6 sm:w-5 sm:h-5" />
            <span className="text-xl font-semibold sm:text-lg">Emil</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsModelMenuOpen(!isModelMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <span className="text-sm font-medium">{selectedModel.name}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {isModelMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 rounded-lg bg-white dark:bg-[#2A2F31] shadow-lg ring-1 ring-black/5 dark:ring-white/5">
              <div className="p-1">
                {AVAILABLE_MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model);
                      setIsModelMenuOpen(false);
                    }}
                    className="flex flex-col w-full px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-white/10"
                  >
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{model.description}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-3">
          <ThemeSwitcher />
          <Bell className="w-5 h-5 sm:w-4 sm:h-4" />
          <Settings className="w-5 h-5 sm:w-4 sm:h-4" />
          <UserCircle className="w-6 h-6 sm:w-5 sm:h-5" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pt-20 px-4">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="text-center mb-6 px-4">
              <h1 className="text-4xl font-semibold mb-2 sm:text-3xl xs:text-2xl">{greeting}, Pleyades.</h1>
              <p className="text-xl text-gray-400 sm:text-lg xs:text-base">¿En qué puedo ayudarte hoy?</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="max-w-3xl mx-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-6 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white rounded-2xl rounded-tr-sm'
                      : 'bg-[#2A2F31] rounded-2xl rounded-tl-sm'
                  } px-4 py-3`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <span className="block text-xs opacity-70 mt-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <div className="sticky bottom-4 w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <div className="input-container rounded-2xl shadow-lg">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full bg-transparent border-none outline-none py-4 px-4 pr-12 text-base placeholder-gray-400"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-lg transition-colors ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;