import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User as UserIcon, RotateCcw } from 'lucide-react';
import { soundService } from '../services/soundService';
import { PRODUCTS } from '../data/products';

interface Message {
  sender: 'bot' | 'user';
  text: string;
  time: string;
  suggestedSets?: string[];
}

interface LegoBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProductById: (productId: string) => void;
}

export const LegoBotModal: React.FC<LegoBotModalProps> = ({
  isOpen,
  onClose,
  onSelectProductById,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: '¡Hola, Maestro Constructor! Soy BrickBot, tu asesor oficial LEGO®. ¿Buscas sets de Ninjago, Star Wars, Legends of Chima, Scooby-Doo o algo del universo Variado (Technic/Icons)? Dime qué edad o temática te interesa.',
      time: 'Ahora',
      suggestedSets: ['ninjago-71766', 'sw-75192', 'scooby-75902'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    '🐉 ¿Cuáles son los mejores sets de Ninjago?',
    '⭐ Recomiéndame sets de Star Wars',
    '🚐 Cuéntame de la Máquina del Misterio de Scooby-Doo',
    '🦁 ¿Qué sets de Chima tienen vehículos oruga?',
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim()) return;

    soundService.playBrickSnap();
    const userTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

    setMessages((prev) => [
      ...prev,
      { sender: 'user', text: textToSend, time: userTime },
    ]);
    if (!queryText) setInput('');
    setIsTyping(true);

    // Formulate smart LEGO knowledge response
    setTimeout(() => {
      const lower = textToSend.toLowerCase();
      let botReply = '';
      let suggested: string[] = [];

      if (lower.includes('ninjago') || lower.includes('ninja') || lower.includes('dragon')) {
        botReply =
          '¡Por el Spinjitzu! En la sección NINJAGO® te recomiendo con los ojos cerrados el Dragón Legendario de Lloyd (#71766) con alas articuladas de ataque y 747 piezas, o el imponente Navío del Destino (#71797) que incluye 6 minifiguras ninja.';
        suggested = ['ninjago-71766', 'ninjago-71797', 'ninjago-71785'];
      } else if (lower.includes('star wars') || lower.includes('halcon') || lower.includes('mandalorian')) {
        botReply =
          '¡Que la Fuerza te acompañe! Si buscas la joya de la corona, el Halcón Milenario UCS (#75192) tiene 7,541 piezas. Para exhibición elegante, el Casco del Mandaloriano (#75328) en acabado beskar es impresionante.';
        suggested = ['sw-75192', 'sw-75328', 'sw-75301'];
      } else if (lower.includes('scooby') || lower.includes('misterio') || lower.includes('fantasma')) {
        botReply =
          '¡Zoinks! La Máquina del Misterio (#75902) es uno de los sets más buscados y queridos de la historia de LEGO®, viene con Shaggy, Fred, zombi y Scooby-Doo. También la Mansión Embrujada (#75904) de 860 piezas es genial.';
        suggested = ['scooby-75902', 'scooby-75904', 'scooby-75900'];
      } else if (lower.includes('chima') || lower.includes('laval') || lower.includes('cragger') || lower.includes('chi')) {
        botReply =
          '¡El Monte Cavora te llama! En Legends of CHIMA™ tienes el temible Guerrero León de Laval (#70005) con orugas todoterreno o el Barco de Asalto Cocodrilo de Cragger (#70006) que lanza misiles de energía CHI.';
        suggested = ['chima-70005', 'chima-70006', 'chima-70003'];
      } else if (lower.includes('adult') || lower.includes('18+') || lower.includes('icons') || lower.includes('technic')) {
        botReply =
          'Para constructores avanzados, te recomiendo la Máquina del Tiempo de Volver al Futuro (#10300) con luces LED en el condensador de fluzo, o el McLaren de Fórmula 1™ Technic (#42141) con pistones móviles.';
        suggested = ['var-10300', 'var-42141', 'var-21333'];
      } else {
        botReply =
          '¡Todo es increíble cuando construyes con LEGO®! Puedes explorar nuestras secciones temáticas: Ninjago para combates elementales, Star Wars para naves galácticas, Chima para energía mística, Scooby-Doo para enigmas y Variado para ingeniería avanzada.';
        suggested = ['ninjago-71766', 'sw-75301', 'scooby-75902'];
      }

      setIsTyping(false);
      soundService.playSuccessChime();
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          suggestedSets: suggested,
        },
      ]);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg h-[85vh] max-h-[680px] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#D11013] text-white p-4 lego-stud-pattern flex items-center justify-between border-b-2 border-black/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFD500] text-slate-900 flex items-center justify-center font-bold shadow-sm">
              <Bot className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-sm font-black font-lego flex items-center gap-1.5">
                <span>BrickBot · Asesor LEGO®</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <span className="text-[10px] text-red-100">Inteligencia de Construcción</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-full bg-black/20 hover:bg-black/30 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/70">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-[#D11013] text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <p>{msg.text}</p>

                {/* Suggested Product Cards */}
                {msg.suggestedSets && msg.suggestedSets.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Sets recomendados:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {msg.suggestedSets.map((pid) => {
                        const product = PRODUCTS.find((p) => p.id === pid);
                        if (!product) return null;
                        return (
                          <button
                            key={pid}
                            onClick={() => {
                              soundService.playBrickSnap();
                              onClose();
                              onSelectProductById(pid);
                            }}
                            className="p-1.5 bg-slate-50 hover:bg-amber-50 rounded-xl border border-slate-200 text-left flex items-center justify-between gap-2 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img src={product.image} alt={product.name} className="w-7 h-7 object-contain" />
                              <span className="font-bold text-slate-800 text-[11px] truncate">
                                #{product.setNumber} {product.name}
                              </span>
                            </div>
                            <span className="text-xs font-black text-[#D11013] shrink-0">
                              ${product.price.toFixed(2)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white p-2.5 rounded-2xl border border-slate-200 w-28">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D11013] animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFD500] animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#0055BF] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px]">Pensando...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a BrickBot sobre cualquier set..."
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-full border border-slate-300 focus:outline-none focus:border-[#D11013] focus:ring-2 focus:ring-[#D11013]/20"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 bg-[#D11013] hover:bg-[#b00d0f] disabled:bg-slate-200 text-white rounded-full transition-colors cursor-pointer"
              aria-label="Enviar mensaje a BrickBot"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
