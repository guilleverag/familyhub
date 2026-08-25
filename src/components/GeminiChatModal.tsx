import React, { useState, useRef, useEffect } from 'react';
import type { AppState } from '../types';
import { askGemini } from '../utils/gemini';
import { Sparkles, Send, X, Bot, User, Key, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const SUGGESTIONS = [
  '¿Qué tenemos pendiente hoy?',
  '¿Quién busca a Mathias hoy?',
  '¿Qué tareas le tocan a Guille?',
  '¿Qué tareas le tocan a Dani?',
];

export const GeminiChatModal: React.FC<Props> = ({ isOpen, onClose, state }) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 ¡Hola! Soy tu asistente de **FamilyHub con Gemini AI**. Puedes preguntarme cualquier duda sobre las tareas del hogar, asignaciones o quién busca a los niños.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const botReply = await askGemini(query, state, apiKey);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: '❌ Ocurrió un error al procesar tu consulta.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[650px] max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden relative">
        {/* Chat Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-100 text-base">Asistente FamilyHub</h3>
                <span className="text-[10px] bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-extrabold px-2 py-0.5 rounded-full">
                  Gemini AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Consultas en lenguaje natural en tiempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                apiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
              title="Configurar Clave API de Gemini"
            >
              <Key size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Configuration drawer for API key */}
        {showKeyInput && (
          <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs space-y-2 animate-in slide-in-from-top duration-200">
            <label className="block text-slate-300 font-medium">
              Clave API de Google Gemini (Opcional - Si no se especifica usa el motor inteligente local):
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => setShowKeyInput(false)}
                className="px-3 py-1.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500"
              >
                Guardar
              </button>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none shadow-md font-medium'
                    : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-tl-none'
                }`}
              >
                {msg.text}
                <div className="mt-1 text-[10px] opacity-60 text-right">{msg.timestamp}</div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 animate-pulse">
                <Bot size={16} />
              </div>
              <div className="bg-slate-800/80 text-slate-400 border border-slate-700/60 rounded-2xl rounded-tl-none px-4 py-3 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span>Consultando con Gemini...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto">
          {SUGGESTIONS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(s)}
              className="px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-slate-700/60 text-[11px] font-medium text-slate-300 hover:text-indigo-200 whitespace-nowrap transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Chat Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta algo (ej. ¿Quién busca a Mathias hoy?)..."
            className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
