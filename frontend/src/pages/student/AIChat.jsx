// src/pages/student/AIChat.jsx
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { apiPost } from '../../services/api';
import { SectionHeader, Spinner } from '../../components/ui';

const QUICK_QUESTIONS = [
  'What is my seat number?',
  'When does my exam start?',
  'Which hall am I allocated to?',
  'Who is my invigilator?',
  'What should I bring to the exam?',
  'How do I download my hall ticket?',
];

const INITIAL_MESSAGES = [
  { role: 'assistant', content: "Hi! I'm **ExamBot**, your AI examination assistant powered by Groq. I have full access to your allocation details.\n\nYou can ask me about your **hall, seat number, exam timing, invigilator contacts**, or anything exam-related. How can I help?" }
];

export default function AIChat() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const chatMutation = useMutation({
    mutationFn: (msgs) => apiPost('/chat', { messages: msgs }),
    onSuccess: (res) => {
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.reply }]);
    },
    onError: () => {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I had trouble responding. Please try again.' }]);
    },
  });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    const newMessages = [...messages, { role: 'user', content: msg }];
    setMessages(newMessages);
    setInput('');
    const apiMsgs = newMessages.slice(1).map(m => ({ role: m.role, content: m.content })); // exclude initial greeting
    chatMutation.mutate(apiMsgs);
  };

  const renderContent = (text) => {
    // Simple markdown: **bold**, newlines
    return text.split('\n').map((line, i) => (
      <span key={i}>{line.replace(/\*\*(.+?)\*\*/g, '').split(/\*\*(.+?)\*\*/).map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}<br /></span>
    ));
  };

  return (
    <div className="space-y-5 h-[calc(100vh-180px)] flex flex-col">
      <SectionHeader
        eyebrow="AI Powered"
        title="Exam Assistant"
        subtitle="Powered by Groq LLaMA 3 · Context-aware responses"
        action={<div className="flex items-center gap-2 text-[11px] bg-emerald-exam-light text-emerald-exam border border-emerald-exam-border rounded-full px-3 py-1.5 font-mono font-black"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />AI LIVE</div>}
      />

      {/* Quick questions */}
      <div className="flex flex-wrap gap-2">
        {QUICK_QUESTIONS.map(q => (
          <button key={q} onClick={() => send(q)} disabled={chatMutation.isPending}
            className="text-[11px] px-3 py-1.5 rounded-full border border-navy/10 hover:border-gold/50 hover:bg-gold/5 transition-all font-semibold disabled:opacity-40">
            {q}
          </button>
        ))}
      </div>

      {/* Chat window */}
      <div className="card flex-1 overflow-y-auto scrollbar-none p-5 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'items-start gap-3'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center text-gold text-sm shrink-0 mt-0.5">A</div>
              )}
              <div className={msg.role === 'user' ? 'chat-user' : 'chat-bot'}>
                {renderContent(msg.content)}
              </div>
            </motion.div>
          ))}
          {chatMutation.isPending && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center shrink-0">
                <Spinner size="sm" color="gold" />
              </div>
              <div className="chat-bot text-navy/40 italic">Thinking…</div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Ask about your exam, hall, seat, or timing…"
          className="field-input flex-1"
          disabled={chatMutation.isPending}
        />
        <button onClick={() => send()} disabled={!input.trim() || chatMutation.isPending} className="btn btn-gold px-5">
          {chatMutation.isPending ? <Spinner size="sm" color="navy" /> : '→'}
        </button>
      </div>
    </div>
  );
}
