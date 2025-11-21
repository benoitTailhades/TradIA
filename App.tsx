import React, { useState, useRef, useEffect, useMemo } from 'react';
import { geminiService } from './services/geminiService';
import { Message, Language } from './types';
import { CrossIcon, SendIcon } from './components/Icon';

// Powerful Pre-Vatican II / Traditional Quotes
const QUOTES = [
  {
    latin: "Instaurare Omnia in Christo",
    en: "To restore all things in Christ.",
    fr: "Tout restaurer dans le Christ."
  },
  {
    latin: "Quis ut Deus?",
    en: "Who is like unto God?",
    fr: "Qui est comme Dieu ?"
  },
  {
    latin: "Veritas Liberabit Vos",
    en: "The truth shall make you free.",
    fr: "La vérité vous rendra libres."
  },
  {
    latin: "Non nobis, Domine, sed nomini tuo da gloriam",
    en: "Not to us, O Lord, but to Thy name give glory.",
    fr: "Pas à nous, Seigneur, mais à Ton nom donne la gloire."
  },
  {
    latin: "Extra Ecclesiam nulla salus",
    en: "Outside the Church there is no salvation.",
    fr: "Hors de l'Église, point de salut."
  },
  {
    latin: "Lex orandi, lex credendi",
    en: "The law of praying is the law of believing.",
    fr: "La loi de la prière est la loi de la foi."
  }
];

// UI Text Translations
const TEXTS = {
  en: {
    title: "Vox Traditionis",
    badge: "Pre-Vatican II",
    placeholder: "Ask a question...",
    you: "You",
    bot: "Vox Traditionis",
    disclaimer: "Answers based on Pre-Vatican II (pre-1962) Catholic texts. Secular queries answered normally.",
    error: "Mea culpa. I encountered an error retrieving the requested information. Please try again.",
    clearConfirm: "Changing language will start a new conversation. Continue?"
  },
  fr: {
    title: "Vox Traditionis",
    badge: "Avant Vatican II",
    placeholder: "Posez votre question...",
    you: "Vous",
    bot: "Vox Traditionis",
    disclaimer: "Réponses basées sur la doctrine catholique pré-Vatican II (avant 1962). Questions laïques traitées normalement.",
    error: "Mea culpa. J'ai rencontré une erreur. Veuillez réessayer.",
    clearConfirm: "Changer de langue commencera une nouvelle conversation. Continuer ?"
  }
};

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Select a random quote on mount (stable across renders)
  const randomQuote = useMemo(() => {
    const index = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[index];
  }, []);

  const t = TEXTS[language];

  // Initialize chat on mount
  useEffect(() => {
    geminiService.initializeChat(language);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adjust textarea height
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'inherit';
      const scrollHeight = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    
    // If we have messages, confirm before clearing
    if (messages.length > 0) {
      if (!confirm(t.clearConfirm)) return;
    }

    setLanguage(newLang);
    setMessages([]);
    geminiService.initializeChat(newLang);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      content: '',
      isStreaming: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, modelMsg]);

    try {
      let accumulatedText = '';
      
      await geminiService.sendMessageStream(userMsg.content, (textChunk) => {
        accumulatedText += textChunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === modelMsgId 
              ? { ...msg, content: accumulatedText }
              : msg
          )
        );
      });

      setMessages(prev => 
        prev.map(msg => 
          msg.id === modelMsgId 
            ? { ...msg, isStreaming: false }
            : msg
        )
      );

    } catch (error) {
      console.error("Failed to send message", error);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: t.error,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev.filter(m => m.id !== modelMsgId), errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format Text with very basic bold handling for display
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
          }
          return <span key={j}>{part}</span>;
        })}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-parchment font-sans text-ink selection:bg-vatican-gold/30">
      
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white/50 backdrop-blur-sm border-b border-vatican-gold/20 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-cardinal-red rounded-sm flex items-center justify-center shadow-sm border border-vatican-gold/40">
            <CrossIcon className="w-7 h-7 text-vatican-gold" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-ink leading-tight tracking-wide">{t.title}</h1>
          </div>
        </div>
        
        {/* Top Right: Language & Badge */}
        <div className="flex items-center gap-4">
           <div className="hidden sm:block">
              <span className="text-xs font-serif text-stone-500 border border-stone-200 px-3 py-1 rounded-full bg-stone-50">
                {t.badge}
              </span>
           </div>
           
           {/* Language Selector */}
           <div className="flex rounded-md border border-stone-300 overflow-hidden text-xs font-display font-bold">
              <button 
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 transition-colors ${language === 'en' ? 'bg-cardinal-red text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
              >
                EN
              </button>
              <button 
                onClick={() => handleLanguageChange('fr')}
                className={`px-3 py-1.5 transition-colors ${language === 'fr' ? 'bg-cardinal-red text-white' : 'bg-white text-stone-500 hover:bg-stone-100'}`}
              >
                FR
              </button>
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative scroll-smooth">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 min-h-full">
          {/* Empty State Greeting (if no messages) */}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center">
              <div className="w-24 h-24 mb-8 text-stone-200 opacity-50">
                <CrossIcon className="w-full h-full" />
              </div>
              
              <div className="max-w-lg px-6">
                 <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-400 mb-3 uppercase tracking-widest">
                    {randomQuote.latin}
                 </h2>
                 <p className="text-sm text-stone-500 font-serif italic border-t border-stone-200 pt-3 inline-block px-8">
                    {language === 'en' ? randomQuote.en : randomQuote.fr}
                 </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${msg.role === 'user' ? 'bg-stone-200 border-stone-300' : 'bg-vatican-gold/20 border-vatican-gold'}`}>
                {msg.role === 'user' ? (
                  <span className="font-display text-stone-600 font-bold">U</span>
                ) : (
                  <CrossIcon className="w-6 h-6 text-cardinal-red" />
                )}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col max-w-[85%] sm:max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  {/* Name Label */}
                  <span className="text-xs text-stone-400 mb-1 font-serif">
                    {msg.role === 'user' ? t.you : t.bot}
                  </span>
                  
                  <div 
                  className={`px-5 py-3 rounded-lg shadow-sm font-serif leading-relaxed text-[15px] sm:text-[16px]
                    ${msg.role === 'user' 
                      ? 'bg-white border border-stone-200 text-stone-800' 
                      : 'bg-parchment-dark border border-vatican-gold/30 text-ink'
                    }`}
                  >
                    {formatText(msg.content)}
                    {msg.isStreaming && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-cardinal-red animate-pulse align-middle" />
                    )}
                  </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-white/80 backdrop-blur-md border-t border-vatican-gold/20">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end gap-2 bg-white border border-stone-300 focus-within:border-vatican-gold focus-within:ring-1 focus-within:ring-vatican-gold/50 rounded-xl px-4 py-3 shadow-sm transition-all duration-200">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="w-full bg-transparent border-none focus:ring-0 resize-none max-h-32 text-stone-800 placeholder-stone-400 font-sans py-1"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="mb-0.5 p-2 rounded-lg bg-cardinal-red text-white hover:bg-cardinal-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex-shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <SendIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="text-center mt-2">
              <p className="text-[10px] text-stone-400 font-serif">{t.disclaimer}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;