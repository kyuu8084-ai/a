import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, User } from '../types';
import { streamMessageFromGemini } from '../services/geminiService';

interface ChatWidgetProps {
  user: User | null;
  onOpenProfile: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user, onOpenProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat from local storage on mount
  useEffect(() => {
    const savedChat = localStorage.getItem('studyWithMe_chatHistory');
    if (savedChat) {
      setMessages(JSON.parse(savedChat));
    } else {
        // Welcome message
        setMessages([{
            id: 'welcome',
            role: 'model',
            text: `Chào ${user?.name || 'bạn'}! Mình là trợ lý học tập StudyWithMe. Mình có thể giúp gì cho việc học của bạn hôm nay?`,
            timestamp: Date.now()
        }]);
    }
  }, []); // Run once on mount

  // Save chat to local storage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('studyWithMe_chatHistory', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading, isStreaming]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    if (!user) {
        onOpenProfile();
        return;
    }

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, newUserMsg]);
    setInputValue('');
    setIsLoading(true); // Show loading dots initially

    // Prepare ID for the coming AI message
    const aiMsgId = (Date.now() + 1).toString();
    let isFirstChunk = true;

    // Use current messages (before this update) as history for context
    await streamMessageFromGemini(
        messages, 
        inputValue, 
        user.name, 
        (chunkText) => {
            if (isFirstChunk) {
                setIsLoading(false); // Hide dots
                setIsStreaming(true); // Start blinking cursor
                // Create the AI message with the first chunk
                setMessages(prev => [...prev, {
                    id: aiMsgId,
                    role: 'model',
                    text: chunkText,
                    timestamp: Date.now()
                }]);
                isFirstChunk = false;
            } else {
                // Append subsequent chunks to the specific AI message
                setMessages(prev => prev.map(msg => 
                    msg.id === aiMsgId 
                        ? { ...msg, text: msg.text + chunkText } 
                        : msg
                ));
            }
        }
    );
    
    setIsStreaming(false); // Stop blinking cursor
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to parse markdown-like syntax
  const formatMessageText = (text: string) => {
    let formatted = text
      // Bold: **text**
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic: *text*
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Bullet points: * item or - item at start of line
      .replace(/(?:^|\n)(?:\*|\-)\s+(.+)/g, '<br/>• $1')
      // Code blocks (simple)
      .replace(/```([\s\S]*?)```/g, '<div class="bg-gray-800 text-white p-2 rounded my-1 text-xs font-mono overflow-x-auto">$1</div>')
      // Line breaks
      .replace(/\n/g, '<br />');

    return { __html: formatted };
  };

  // 3D Robot Icon URL
  const BOT_AVATAR = "https://cdn-icons-png.flaticon.com/512/8943/8943377.png";

  return (
    <>
      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-5px); }
            100% { transform: translateY(0px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          @keyframes messageSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .message-enter {
            animation: messageSlideIn 0.3s ease-out forwards;
          }
          .typing-dot {
            animation: typingBounce 1.4s infinite ease-in-out both;
          }
          .typing-dot:nth-child(1) { animation-delay: -0.32s; }
          .typing-dot:nth-child(2) { animation-delay: -0.16s; }
          @keyframes typingBounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
          }
          
          /* Blinking Cursor Effect */
          .typing-cursor::after {
            content: '▋';
            display: inline-block;
            vertical-align: baseline;
            animation: blink 1s step-end infinite;
            color: var(--primary);
            font-size: 0.8em;
            margin-left: 2px;
            opacity: 0.7;
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `}
      </style>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[990] w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 overflow-hidden border-2 border-white group ${
          isOpen ? 'rotate-90 bg-red-500' : 'bg-white'
        }`}
      >
        {isOpen ? (
          <i className="fas fa-times text-white text-2xl"></i>
        ) : (
          <div className="w-full h-full p-1 animate-float">
            <img 
              src={BOT_AVATAR}
              alt="ChatBot" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {/* Notification badge if closed and maybe has messages (optional logic) */}
        {!isOpen && !isLoading && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></span>
        )}
      </button>

      {/* Chat Interface */}
      <div
        className={`fixed bottom-24 right-6 w-[380px] max-w-[calc(100vw-48px)] h-[550px] max-h-[70vh] bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl z-[990] flex flex-col overflow-hidden border border-white/50 transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary to-accent text-white flex items-center gap-3 shadow-sm z-10">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 overflow-hidden p-1 animate-float">
             <img 
                src={BOT_AVATAR}
                alt="Bot Avatar" 
                className="w-full h-full object-cover"
             />
          </div>
          <div>
            <h3 className="font-bungee text-lg leading-tight">StudyBot AI</h3>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <p className="text-xs text-white/90 font-oswald">Trực tuyến</p>
            </div>
          </div>
          <button 
             onClick={() => {
                 if(confirm('Bạn có chắc muốn xóa lịch sử trò chuyện?')) {
                     setMessages([]);
                     localStorage.removeItem('studyWithMe_chatHistory');
                 }
             }}
             className="ml-auto w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
             title="Xóa lịch sử"
          >
              <i className="fas fa-trash-alt text-sm"></i>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 custom-scrollbar scroll-smooth">
          {messages.map((msg, index) => {
            // Check if this is the last message and it's from the model and we are streaming
            const isLastMessage = index === messages.length - 1;
            const showCursor = isLastMessage && msg.role === 'model' && isStreaming;

            return (
                <div
                key={msg.id}
                className={`flex message-enter ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                {msg.role === 'model' && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 mr-2 flex-shrink-0 self-end mb-1 p-0.5 bg-white shadow-sm">
                        <img 
                            src={BOT_AVATAR}
                            alt="Bot" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div
                    className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm leading-relaxed transition-all hover:shadow-md ${
                    msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-none'
                        : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                    } ${showCursor ? 'typing-cursor' : ''}`}
                >
                    {/* Render HTML content safely */}
                    <div 
                        style={{ fontFamily: 'Segoe UI, sans-serif' }}
                        dangerouslySetInnerHTML={formatMessageText(msg.text)}
                    />
                </div>
                </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start items-end message-enter">
               <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 mr-2 flex-shrink-0 p-0.5 bg-white shadow-sm">
                      <img 
                        src={BOT_AVATAR}
                        alt="Bot" 
                        className="w-full h-full object-cover animate-float"
                      />
               </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1.5 min-w-[60px] justify-center h-[40px]">
                  <div className="w-2 h-2 bg-primary rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-primary rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-primary rounded-full typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-5px_15px_rgba(0,0,0,0.02)] z-10">
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 border border-transparent focus-within:border-primary focus-within:bg-white focus-within:shadow-md transition-all duration-300">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={user ? "Hỏi gì đó đi..." : "Đặt tên để bắt đầu..."}
              className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
              disabled={isLoading || isStreaming}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || isStreaming || !inputValue.trim()}
              className="text-primary w-8 h-8 flex items-center justify-center rounded-full hover:bg-primary/10 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all"
            >
              <i className="fas fa-paper-plane text-lg transform translate-x-[-1px] translate-y-[1px]"></i>
            </button>
          </div>
          {!user && (
              <p className="text-xs text-center mt-2 text-red-500 cursor-pointer hover:underline animate-pulse" onClick={onOpenProfile}>
                  <i className="fas fa-exclamation-circle mr-1"></i> Vui lòng cập nhật tên để chat
              </p>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWidget;