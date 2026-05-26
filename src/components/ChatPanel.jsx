import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageCircle, X, Circle } from 'lucide-react';
import { CHAT_WS_URL, getAuthToken } from '../utils/api';

export default function ChatPanel({ currentUser, isOpen, onClose }) {
  const [messages, setMessages]       = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [text, setText]               = useState('');
  const [connected, setConnected]     = useState(false);
  const wsRef    = useRef(null);
  const bottomRef = useRef(null);

  const connect = useCallback(() => {
    if (!currentUser) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const token = getAuthToken() || '';
    const ws = new WebSocket(`${CHAT_WS_URL}?token=${encodeURIComponent(token)}`);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'CHAT_HISTORY') {
        setMessages(data.messages);
        setOnlineUsers(data.onlineUsers);
      } else if (data.type === 'CHAT_MESSAGE') {
        setMessages(prev => [...prev, data.message]);
        setOnlineUsers(data.onlineUsers);
      } else if (data.type === 'ONLINE_USERS') {
        setOnlineUsers(data.onlineUsers);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 3 seconds
      setTimeout(connect, 3000);
    };

    ws.onerror = () => ws.close();
  }, [currentUser]);

  useEffect(() => {
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!text.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: 'CHAT_MESSAGE', text: text.trim() }));
    setText('');
  };

  const formatTime = (iso) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const roleColor = (role) =>
    role === 'admin' ? 'text-violet-600' : 'text-blue-500';

  const isMe = (msg) => msg.senderId === currentUser?.id;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed right-0 top-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#151b2b] text-white">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-sm">Group Chat</span>
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Online users */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">
          Online — {onlineUsers.length}
        </p>
        <div className="flex flex-wrap gap-1">
          {onlineUsers.map(u => (
            <span key={u.userId} className="flex items-center gap-1 text-xs bg-white border border-gray-200 rounded-full px-2 py-0.5">
              <Circle className="w-2 h-2 fill-green-400 text-green-400" />
              <span className={`font-medium ${roleColor(u.userRole)}`}>{u.userName}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8">No messages yet. Say hello! 👋</p>
        )}
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col ${isMe(msg) ? 'items-end' : 'items-start'}`}
            >
              {!isMe(msg) && (
                <span className={`text-xs font-bold mb-1 ${roleColor(msg.senderRole)}`}>
                  {msg.senderName}
                  {msg.senderRole === 'admin' && ' 👑'}
                </span>
              )}
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm ${
                isMe(msg)
                  ? 'bg-violet-600 text-white rounded-tr-sm'
                  : 'bg-gray-100 text-gray-800 rounded-tl-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-400 mt-1">{formatTime(msg.createdAt)}</span>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-gray-100 flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          maxLength={1000}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
        <button
          type="submit"
          disabled={!text.trim() || !connected}
          className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}