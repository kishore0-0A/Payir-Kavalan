import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Phone, Video, MoreVertical, CheckCheck } from 'lucide-react';
import base44 from '@/api/apiClient';

export default function Chat() {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const [expert, setExpert] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I saw your recent crop scan. How can I help you today?", sender: 'expert', timestamp: new Date(Date.now() - 3600000) }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isAudioCalling, setIsAudioCalling] = useState(false);
  const [isVideoCalling, setIsVideoCalling] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Fetch expert details
    base44.entities.ExpertProfile.list().then(experts => {
      const found = experts?.find(e => e.id === expertId);
      if (found) setExpert(found);
    }).catch(() => {});
  }, [expertId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage('');

    // Simulate expert response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: "I've received your message. Could you provide a clear photo of the leaf's underside?",
        sender: 'expert',
        timestamp: new Date()
      }]);
    }, 1500);
  };

  if (!expert) {
    return (
      <div className="flex h-[calc(100vh-4.5rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4.5rem)] max-w-4xl flex-col bg-background sm:p-4">
      <div className="flex flex-1 flex-col overflow-hidden rounded-none sm:rounded-3xl border-x sm:border border-border/50 bg-card shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 bg-card/80 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={expert.image_url} alt={expert.name} className="h-12 w-12 rounded-full object-cover shadow-sm" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-success" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">{expert.name}</h2>
                <p className="text-xs font-medium text-primary">{expert.role}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 relative">
            <button 
              onClick={() => setIsAudioCalling(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Phone className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsVideoCalling(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <Video className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-border/50 bg-card p-2 shadow-xl animate-in slide-in-from-top-2">
                <button 
                  onClick={() => { alert(`Viewing profile for ${expert.name}`); setShowMenu(false); }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                >
                  View Profile
                </button>
                <button 
                  onClick={() => { setMessages([]); setShowMenu(false); }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-muted"
                >
                  Clear Chat
                </button>
                <button 
                  onClick={() => { alert(`Blocked ${expert.name}`); setShowMenu(false); navigate('/experts'); }}
                  className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  Block Expert
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-muted/10">
          <div className="flex justify-center">
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">Today</span>
          </div>
          
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`group relative max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  isUser 
                    ? 'rounded-br-sm bg-primary text-primary-foreground' 
                    : 'rounded-bl-sm bg-muted text-foreground border border-border/50'
                }`}>
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
                  <div className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] opacity-70`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isUser && <CheckCheck className="h-3.5 w-3.5" />}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-card p-4 sm:p-5">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full rounded-full border border-border/50 bg-muted/50 py-3.5 pl-6 pr-14 text-sm outline-none transition-all focus:border-primary/50 focus:bg-background focus:ring-4 focus:ring-primary/10"
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
            >
              <Send className="h-4 w-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Audio Call Overlay */}
      {isAudioCalling && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950 text-white animate-in zoom-in-95 duration-300">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping duration-1000" />
              <img src={expert.image_url} alt={expert.name} className="relative z-10 h-32 w-32 rounded-full border-4 border-slate-800 object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{expert.name}</h2>
              <p className="mt-2 text-white/50 text-sm tracking-widest uppercase">Calling...</p>
            </div>
          </div>
          <div className="absolute bottom-20 flex items-center gap-8">
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
              <Phone className="h-6 w-6 text-white" />
            </button>
            <button 
              onClick={() => setIsAudioCalling(false)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-transform active:scale-95"
            >
              <Phone className="h-7 w-7 text-white rotate-[135deg]" />
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors">
              <Video className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Video Call Overlay */}
      {isVideoCalling && (
        <div className="fixed inset-0 z-[200] bg-slate-950 animate-in zoom-in-95 duration-300">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Simulated expert video stream (blurred avatar) */}
            <img src={expert.image_url} alt="Expert video" className="h-full w-full object-cover blur-md opacity-40" />
            <div className="absolute flex flex-col items-center">
              <img src={expert.image_url} alt={expert.name} className="h-24 w-24 rounded-full border-4 border-slate-800 object-cover shadow-xl" />
              <p className="mt-4 text-xl font-bold text-white">Connecting video...</p>
            </div>
          </div>
          {/* User mini video placeholder */}
          <div className="absolute right-6 top-6 h-48 w-32 rounded-2xl bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center text-slate-500">
             You
          </div>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 rounded-3xl bg-slate-900/80 p-4 backdrop-blur-xl">
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-white">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
            </button>
            <button className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors text-white">
              <Video className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setIsVideoCalling(false)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive shadow-lg shadow-destructive/20 hover:bg-destructive/90 transition-transform active:scale-95 text-white"
            >
              <Phone className="h-6 w-6 rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
