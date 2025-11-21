import React, { useState, useRef, useEffect, useMemo } from 'react';
import { geminiService } from './services/geminiService';
import { Message, Language } from './types';
import { CrossIcon, SendIcon } from './components/Icon';

// Powerful Pre-Vatican II / Traditional Quotes
const QUOTES = [
  {
    latin: "Non nobis, Domine, sed nomini tuo da gloriam",
    en: "Not to us, O Lord, but to Thy name give glory. (Ps 113:9)",
    fr: "Pas à nous, Seigneur, mais à Votre Nom donnez la gloire. (Ps 113,9)"
  },
  {
    latin: "Stat Crux dum volvitur orbis",
    en: "The Cross stands while the world turns. (Carthusian motto)",
    fr: "La Croix demeure tandis que le monde tourne. (Devise des Chartreux)"
  },
  {
    latin: "Quis ut Deus?",
    en: "Who is like unto God? (St. Michael)",
    fr: "Qui est comme Dieu ? (Saint Michel)"
  },
  {
    latin: "Instaurare Omnia in Christo",
    en: "To restore all things in Christ. (Pope Pius X)",
    fr: "Tout restaurer dans le Christ. (Saint Pie X)"
  },
  {
    latin: "Adveniat Regnum Tuum",
    en: "Thy Kingdom come. (Mt 6:10)",
    fr: "Que Votre règne arrive. (Mt 6,10)"
  },
  {
    latin: "In hoc signo vinces",
    en: "In this sign thou shalt conquer. (Constantine, trad.)",
    fr: "Par ce signe, Vous vaincrez. (Constantin, trad.)"
  },
  {
    latin: "Ora et Labora",
    en: "Pray and work. (St. Benedict / OSB)",
    fr: "Prie et travaille. (Saint Benoît / OSB)"
  },
  {
    latin: "Fides sine operibus mortua est",
    en: "Faith without works is dead. (Jas 2:26)",
    fr: "La foi sans les œuvres est morte. (Jc 2,26)"
  },
  {
    latin: "Veritas liberabit vos",
    en: "The truth shall set you free. (Jn 8:32)",
    fr: "La vérité vous affranchira. (Jn 8,32)"
  },
  {
    latin: "Sic transit gloria mundi",
    en: "Thus passes the glory of the world. (Pontifical liturgy)",
    fr: "Ainsi passe la gloire du monde. (Liturgie pontificale)"
  },
  {
    latin: "Veni, vidi, vici",
    en: "I came, I saw, I conquered. (Julius Caesar)",
    fr: "Je suis venu, j’ai vu, j’ai vaincu. (Jules César)"
  },

  // — REPLACEMENT #1 —
  {
    latin: "Domine, salva me",
    en: "Lord, save me. (Mt 14:30)",
    fr: "Seigneur, sauvez-moi. (Mt 14,30)"
  },

  {
    latin: "Cor ad cor loquitur",
    en: "Heart speaks to heart. (Card. Newman)",
    fr: "Le cœur parle au cœur. (Cardinal Newman)"
  },
  {
    latin: "Nisi Dominus aedificaverit domum",
    en: "Unless the Lord builds the house… (Ps 126:1)",
    fr: "Si le Seigneur ne bâtit la maison… (Ps 126,1)"
  },
  {
    latin: "Credo ut intelligam",
    en: "I believe so that I may understand. (St. Anselm)",
    fr: "Je crois afin de comprendre. (Saint Anselme)"
  },
  {
    latin: "Deus vult",
    en: "God wills it. (Crusaders, trad.)",
    fr: "Dieu le veut. (Croisés, trad.)"
  },
  {
    latin: "Per crucem ad lucem",
    en: "Through the Cross to the light. (Latin motto)",
    fr: "Par la Croix jusqu’à la lumière. (Devise latine)"
  },
  {
    latin: "Ecce Homo",
    en: "Behold the Man. (Jn 19:5)",
    fr: "Voici l’Homme. (Jn 19,5)"
  },
  {
    latin: "Domine, quo vadis?",
    en: "Lord, where are You going? (Tradition on St. Peter)",
    fr: "Seigneur, où allez-Vous ? (Tradition sur Saint Pierre)"
  },
  {
    latin: "Initium sapientiae timor Domini",
    en: "The fear of the Lord is the beginning of wisdom. (Prov 9:10)",
    fr: "La crainte du Seigneur est le commencement de la sagesse. (Pr 9,10)"
  },
  {
    latin: "Beati pauperes spiritu",
    en: "Blessed are the poor in spirit. (Mt 5:3)",
    fr: "Heureux les pauvres de cœur. (Mt 5,3)"
  },
  {
    latin: "Ad Majorem Dei Gloriam",
    en: "For the greater glory of God. (SJ)",
    fr: "Pour la plus grande gloire de Dieu. (SJ)"
  },

  // — REPLACEMENT #2 —
  {
    latin: "Oremus pro invicem",
    en: "Let us pray for one another. (St. Benedict tradition)",
    fr: "Prions les uns pour les autres. (Tradition bénédictine)"
  },

  {
    latin: "Da mihi animas, caetera tolle",
    en: "Give me souls, take the rest. (St. John Bosco)",
    fr: "Donnez-moi des âmes, prenez le reste. (Saint Jean Bosco)"
  },
  {
    latin: "Ubi Petrus, ibi Ecclesia",
    en: "Where Peter is, there is the Church. (St. Ambrose)",
    fr: "Là où est Pierre, là est l’Église. (Saint Ambroise)"
  },
  {
    latin: "Pax vobis",
    en: "Peace be unto you. (Jn 20:19)",
    fr: "La paix soit avec vous. (Jn 20,19)"
  },
  {
    latin: "Si Deus pro nobis, quis contra nos?",
    en: "If God is for us, who can be against us? (Rom 8:31)",
    fr: "Si Dieu est pour nous, qui sera contre nous ? (Rm 8,31)"
  }
];



// UI Text Translations btw 
const TEXTS = {
  en: {
    title: "Vox Traditionis",
    badge: "Pre-Vatican II",
    placeholder: "Ask a question...",
    you: "You",
    bot: "Vox Traditionis",
    disclaimer: "Answers based on Pre-Vatican II (pre-1962) Catholic texts. Secular queries answered normally.",
    error: "Mea culpa. I encountered an error.",
    clearConfirm: "Changing language will start a new conversation. Continue?"
  },
  fr: {
    title: "Vox Traditionis",
    badge: "Avant Vatican II",
    placeholder: "Posez votre question...",
    you: "Vous",
    bot: "Vox Traditionis",
    disclaimer: "Réponses basées sur la doctrine catholique pré-Vatican II (avant 1962). Questions laïques traitées normalement.",
    error: "Mea culpa. J'ai rencontré une erreur.",
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

    } catch (error: any) {
      console.error("Failed to send message", error);
      
      let errorContent = t.error;

      // Custom Error Messages handling
      if (error.message === 'API_NOT_ENABLED') {
        errorContent = language === 'fr' 
          ? "⛔ **L'API n'est pas activée.**\n\nVous avez choisi un projet existant, mais l'API 'Generative Language API' n'est pas active dessus.\n\n[Cliquez ici pour l'activer](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com) puis redémarrez l'application."
          : "⛔ **API Not Enabled.**\n\nYou selected an existing project, but the 'Generative Language API' is not enabled on it.\n\n[Click here to enable it](https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com) and then restart the app.";
      } else if (error.message === 'BILLING_REQUIRED') {
        errorContent = language === 'fr'
          ? "💳 **Facturation Requise.**\n\nLe projet Google Cloud associé à cette clé API nécessite un compte de facturation actif. Google exige souvent une carte bancaire pour vérifier votre identité, même pour l'utilisation gratuite.\n\n[Configurer la facturation](https://console.cloud.google.com/billing)"
          : "💳 **Billing Required.**\n\nThe Google Cloud Project associated with this API key requires an active billing account. Google often requires a credit card for identity verification, even for free usage.\n\n[Setup Billing](https://console.cloud.google.com/billing)";
      } else if (error.message === 'INVALID_KEY') {
        errorContent = language === 'fr'
          ? "🔑 **Clé API Invalide.**\n\nVotre clé API semble incorrecte. Vérifiez votre fichier `.env`."
          : "🔑 **Invalid API Key.**\n\nYour API key appears to be incorrect. Check your `.env` file.";
      } else if (error.message === 'MISSING_KEY') {
        errorContent = language === 'fr'
          ? "❓ **Clé manquante.**\n\nLe système n'a pas trouvé la clé. Assurez-vous d'avoir ajouté `clefAPI` dans les variables d'environnement Vercel."
          : "❓ **Missing Key.**\n\nThe system could not find the key. Ensure you added `clefAPI` in Vercel Environment Variables.";
      } else if (error.message) {
         errorContent += `\n\n(Erreur technique : ${error.message})`;
      }

      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'model',
        content: errorContent,
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

  // Format Text with basic bold and link handling
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Basic link parser for markdown style [Text](URL)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        // Push text before link
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        // Push link
        parts.push(
          <a 
            key={match.index} 
            href={match[2]} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-cardinal-red underline hover:text-cardinal-red-dark font-bold"
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }
      // Push remaining text
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      // If no links, process bold
      const content = parts.length > 0 ? parts : [line];

      return (
        <React.Fragment key={i}>
          {content.map((part, k) => {
            if (typeof part === 'string') {
               return part.split(/(\*\*.*?\*\*)/).map((subPart, j) => {
                if (subPart.startsWith('**') && subPart.endsWith('**')) {
                  return <strong key={`${k}-${j}`} className="font-semibold text-ink">{subPart.slice(2, -2)}</strong>;
                }
                return <span key={`${k}-${j}`}>{subPart}</span>;
              });
            }
            return part;
          })}
          <br />
        </React.Fragment>
      );
    });
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
                    }
                    ${msg.content.includes("⛔") || msg.content.includes("🔑") || msg.content.includes("💳") ? "border-red-300 bg-red-50 text-stone-800" : ""}
                    `}
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
          <div className="text-center mt-2 flex justify-between items-center px-2">
              <p className="text-[10px] text-stone-400 font-serif">{t.disclaimer}</p>
              <p className="text-[9px] text-stone-300 uppercase font-display tracking-widest">v1.1 FSSPX</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;