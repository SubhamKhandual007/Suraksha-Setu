import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { 
  Send, 
  Smile, 
  Search, 
  Lightbulb, 
  ShieldCheck, 
  HelpCircle, 
  Users, 
  MoreVertical,
  Flag,
  UserX,
  MessageSquare,
  ArrowLeft
} from 'lucide-react';
import Picker from 'emoji-picker-react';
import { communityAPI, tokenManager } from '../services/api';
import { API_BASE_URL } from '../config';
import styles from './CommunityChat.module.css';

const SOCKET_URL = API_BASE_URL;

const CommunityChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load initial data and connect socket
  useEffect(() => {
    const user = tokenManager.getUserData();
    const token = tokenManager.getToken();
    
    if (!user || !token) {
      navigate('/login');
      return;
    }
    
    setUserData(user);

    // Fetch history
    const fetchHistory = async () => {
      try {
        const res = await communityAPI.getMessages({ limit: 50 });
        if (res.success) {
          setMessages(res.messages);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };

    fetchHistory();

    // Socket Connection
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket');
      socket.emit('authenticate', { token, userType: 'tourist' });
    });

    socket.on('authenticated', () => {
      console.log('Socket authenticated');
    });

    socket.on('new_community_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('user_status', (data) => {
      if (data.onlineCount !== undefined) {
        setOnlineCount(data.onlineCount);
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  const handleSendMessage = (type: string = 'text') => {
    if (!userInput.trim() || !socketRef.current) return;

    socketRef.current.emit('community_message', {
      content: userInput,
      messageType: type
    });

    setUserInput('');
    setShowEmojiPicker(false);
  };

  const handleReport = async (messageId: string) => {
    if (window.confirm('Are you sure you want to report this message?')) {
      try {
        const res = await communityAPI.reportMessage(messageId);
        if (res.success) {
          alert('Message reported. Thank you for keeping the community safe.');
        }
      } catch (err) {
        alert('Failed to report message.');
      }
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearching(false);
      // Reload history if search cleared
      const res = await communityAPI.getMessages({ limit: 50 });
      if (res.success) setMessages(res.messages);
      return;
    }

    setIsSearching(true);
    try {
      const res = await communityAPI.searchMessages(searchQuery);
      if (res.success) {
        setMessages(res.messages);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const getTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getBubbleStyle = (type: string, isOwn: boolean) => {
    if (isOwn) return styles.ownBubble;
    switch (type) {
      case 'tip': return styles.tipBubble;
      case 'safety_update': return styles.safetyBubble;
      case 'help_request': return styles.safetyBubble;
      default: return styles.aiBubble;
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'tip': return <Lightbulb size={14} />;
      case 'safety_update': return <ShieldCheck size={14} />;
      case 'help_request': return <HelpCircle size={14} />;
      case 'crowd_update': return <Users size={14} />;
      default: return null;
    }
  };

  return (
    <div className={styles.communityContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className={styles.iconButton} onClick={() => navigate(-1)}>
            <ArrowLeft size={24} />
          </button>
          <div className={styles.headerInfo}>
            <h3 className={styles.headerTitle}>Tourist Community</h3>
            <div className={styles.onlineStatus}>
              <div className={styles.statusDot}></div>
              <span>{onlineCount} tourists online</span>
            </div>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconButton} onClick={() => setIsSearching(!isSearching)}>
            <Search size={20} />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {isSearching && (
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input 
            className={styles.searchInput}
            placeholder="Search travel tips, places, routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </form>
      )}

      {/* Chat Area */}
      <div className={styles.chatBox}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Welcome to the Community! Start a conversation or share a travel tip.</p>
          </div>
        )}
        
        {messages.map((msg) => {
          const isOwn = msg.sender?._id === userData?._id || msg.sender === userData?._id;
          return (
            <div key={msg._id} className={`${styles.messageWrapper} ${isOwn ? styles.ownMessage : ''}`}>
              {!isOwn && (
                <img 
                  src={msg.sender?.profileImage || `https://ui-avatars.com/api/?name=${msg.sender?.name || 'User'}&background=random`} 
                  alt="avatar" 
                  className={styles.avatar} 
                />
              )}
              <div className={styles.messageContent}>
                {!isOwn && <span className={styles.senderName}>{msg.sender?.name}</span>}
                <div className={`${styles.bubble} ${getBubbleStyle(msg.messageType, isOwn)}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: msg.messageType !== 'text' ? '0.25rem' : '0' }}>
                    {getIconForType(msg.messageType)}
                    {msg.messageType !== 'text' && <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>{msg.messageType.replace('_', ' ')}</strong>}
                  </div>
                  {msg.content}
                  <div className={styles.timestamp}>
                    {getTime(msg.createdAt)}
                    {!isOwn && (
                      <button 
                        onClick={() => handleReport(msg._id)}
                        style={{ background: 'none', border: 'none', padding: '0 0 0 8px', cursor: 'pointer', opacity: 0.5 }}
                        title="Report Message"
                      >
                        <Flag size={10} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef}></div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <div className={styles.quickActions}>
          <button className={styles.actionButton} onClick={() => { setUserInput('💡 Travel Tip: '); handleSendMessage('tip'); }}>
            <Lightbulb size={14} /> Travel Tip
          </button>
          <button className={styles.actionButton} onClick={() => { setUserInput('🚧 Safety Update: '); handleSendMessage('safety_update'); }}>
            <ShieldCheck size={14} /> Safety Update
          </button>
          <button className={styles.actionButton} onClick={() => { setUserInput('🙋 Help needed: '); handleSendMessage('help_request'); }}>
            <HelpCircle size={14} /> Ask for Help
          </button>
          <button className={styles.actionButton} onClick={() => { setUserInput('👥 Crowd Alert: '); handleSendMessage('crowd_update'); }}>
            <Users size={14} /> Crowd Update
          </button>
        </div>

        <div className={styles.inputArea}>
          <button className={styles.iconButton} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile size={20} />
          </button>
          
          <input 
            className={styles.inputField}
            placeholder="Type message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <button 
            className={`${styles.iconButton} ${styles.sendButton}`}
            onClick={() => handleSendMessage()}
            disabled={!userInput.trim()}
          >
            <Send size={18} />
          </button>
        </div>

        {showEmojiPicker && (
          <div className={styles.emojiPicker}>
            <Picker onEmojiClick={(emoji: any) => setUserInput(prev => prev + emoji.emoji)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityChatScreen;
