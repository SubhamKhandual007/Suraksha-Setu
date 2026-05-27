import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Suraksha.module.css";
import Picker from "emoji-picker-react";
import { tokenManager } from "../services/api";
import surakshaAvatar from "../assets/logo.webp"; 
import { 
  Trash2, 
  Paperclip, 
  Smile, 
  Send, 
  Mic, 
  MicOff
} from 'lucide-react';

const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || "";

const ChatScreen: React.FC = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [userData, setUserData] = useState<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const recognition = useRef<any>(null);

  useEffect(() => {
    const user = tokenManager.getUserData();
    if (user) {
      setUserData(user);
    }
  }, []);

  const getTime = () =>
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // 🔊 Voice Output (Hindi Female Voice)
  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Get all available voices
    const voices = window.speechSynthesis.getVoices();
    
    // Find a Hindi voice (hi-IN)
    // Most browsers have 'Google हिंदी' or similar
    const hindiVoice = voices.find(voice => 
      voice.lang.includes('hi') || voice.lang.includes('HI')
    );

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    // Adjust parameters for a clearer, slightly more female tone
    utterance.lang = "hi-IN";
    utterance.pitch = 1.1; // Slightly higher pitch for female tone
    utterance.rate = 0.9;  // Slightly slower for better clarity in Hinglish
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // 🧠 AI System Prompt
  const safetySystemMessage = `
You are Suraksha AI (Tourist Safety Assistant)

- Speak in Hinglish (Mixture of Hindi and English)
- Help user stay safe while traveling
- Suggest nearby police, hospitals, hotels
- Detect danger situations
- Be professional yet friendly

Emergency Rules:
If user says "help", "danger", "emergency", "bachao":
→ respond urgently
→ guide to SOS

User Profile:
${JSON.stringify(userData || {}, null, 2)}
`;

  // 🚀 Initialize
  useEffect(() => {
    const userName = userData?.name || "Tourist";
    const welcome = `Welcome ${userName}!
Main hoon Suraksha AI
Tumhari safety meri responsibility hai
Kahin bhi problem ho — bas bolo!`;

    if (messages.length === 0) {
      setMessages([{ text: welcome, sender: "ai", timestamp: getTime() }]);
      speakText(welcome);
    }

    // 🎤 Speech Recognition
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.lang = "en-IN";

      recognition.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        sendMessage(transcript);
      };

      recognition.current.onend = () => setIsListening(false);
    }
  }, [userData, speakText]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔀 Navigation Logic
  const redirectToFeature = (input: string) => {
    const text = input.toLowerCase();

    if (text.includes("police")) return { path: "/map", name: "police station", state: { filter: "police" } };
    if (text.includes("hospital")) return { path: "/map", name: "hospital", state: { filter: "hospital" } };
    if (text.includes("hotel")) return { path: "/hotels", name: "hotels" };
    if (text.includes("map") || text.includes("location")) return { path: "/map", name: "map" };
    if (text.includes("id")) return { path: "/id", name: "ID" };
    if (text.includes("sos") || text.includes("emergency")) return { path: "/emergency", name: "sos" };

    return null;
  };

  // 💬 Send Message
  const sendMessage = async (input = userInput, attachedImage: string | null = null) => {
    if (!input.trim() && !attachedImage) return;

    const timestamp = getTime();

    setMessages((prev) => [...prev, { text: input, sender: "user", timestamp, image: attachedImage }]);
    setUserInput("");
    setIsTyping(true);

    const lower = input.toLowerCase();

    // 🚨 Emergency Detection
    if (lower.includes("help") || lower.includes("danger") || lower.includes("bachao")) {
      const alertMsg = "🚨 Emergency detect hui! SOS alert trigger kar rahi hoon...";
      setMessages((prev) => [
        ...prev,
        { text: alertMsg, sender: "ai", timestamp: getTime() },
      ]);
      speakText(alertMsg);
      setTimeout(() => navigate("/emergency"), 1200);
      setIsTyping(false);
      return;
    }

    // 🔀 Redirect
    const redirectInfo = redirectToFeature(input) as any;
    if (redirectInfo) {
      const msg = `chalo tourist main tujhe ${redirectInfo.name} page pe le jata hun`;
      setMessages((prev) => [...prev, { text: msg, sender: "ai", timestamp }]);
      speakText(msg);
      setTimeout(() => {
        if (redirectInfo.state) {
          navigate(redirectInfo.path, { state: redirectInfo.state });
        } else {
          navigate(redirectInfo.path);
        }
      }, 1000);
      setIsTyping(false);
      return;
    }

    if (!GROQ_API_KEY) {
      setTimeout(() => {
        const error = "API Key missing. Par aap SOS ya Map feature use kar sakte hain!";
        setMessages((prev) => [...prev, { text: error, sender: "ai", timestamp: getTime() }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_API_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: safetySystemMessage },
              ...conversationHistory,
              { role: "user", content: input },
            ],
          }),
        }
      );

      const data = await response.json();
      const aiText = data.choices[0].message.content;

      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: input },
        { role: "assistant", content: aiText },
      ]);

      setMessages((prev) => [
        ...prev,
        { text: aiText, sender: "ai", timestamp: getTime() },
      ]);

      speakText(aiText);
    } catch (err) {
      const error = "Network issue 😅 fir se try karo...";
      setMessages((prev) => [
        ...prev,
        { text: error, sender: "ai", timestamp: getTime() },
      ]);
    }

    setIsTyping(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          sendMessage("Uploaded an image", reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        sendMessage(`Uploaded file: ${file.name}`);
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
    setConversationHistory([]);
  };

  return (
    <div className={styles.chatContainer}>
      {/* Header */}
      <div className={styles.header}>
        <img src={surakshaAvatar} alt="avatar" className={styles.avatar} />
        <div className={styles.headerInfo}>
          <h3 className={styles.headerTitle}>Suraksha AI</h3>
          <p className={styles.headerSubtitle}>Your Tourist Safety Assistant</p>
        </div>
        <button className={styles.deleteButton} onClick={clearChat} title="Clear Chat">
          <Trash2 size={20} />
        </button>
      </div>

      {/* Chat Box */}
      <div className={styles.chatBox}>
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender === "user" ? styles.userMessage : styles.aiMessage}>
            {msg.image && (
              <img 
                src={msg.image} 
                alt="uploaded" 
                style={{ width: '100%', maxWidth: '250px', borderRadius: '12px', marginBottom: '8px', display: 'block' }} 
              />
            )}
            {msg.text && <span>{msg.text}</span>}
            <span className={styles.timestamp}>{msg.timestamp}</span>
          </div>
        ))}
        {isTyping && (
          <div className={styles.typing}>
            Suraksha AI is typing...
          </div>
        )}
        <div ref={chatEndRef}></div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickReplies}>
        <button onClick={() => sendMessage("Find nearby hotels")}>🏨 Nearby Hotels</button>
        <button onClick={() => sendMessage("Find police station")}>🚓 Police Station</button>
        <button onClick={() => sendMessage("Show my location on map")}>📍 Map</button>
        <button onClick={() => sendMessage("Open sos page")}>🚨 SOS</button>
      </div>

      {/* Input */}
      <div className={styles.footer}>
        <div className={styles.inputWrapper}>
          <div className={styles.smileyIcon} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <Smile size={24} />
          </div>
          
          <div className={styles.attachmentIcon} onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={24} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            accept="image/*,.pdf,.doc,.docx"
          />

          {showEmojiPicker && (
            <div className={styles.emojiPicker}>
              <Picker onEmojiClick={(emoji: any) => {
                setUserInput(prev => prev + emoji.emoji);
                setShowEmojiPicker(false);
              }} />
            </div>
          )}

          <input
            className={styles.inputField}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type message..."
          />

          {userInput.trim() ? (
            <button className={styles.sendButton} onClick={() => sendMessage()}>
              <Send size={20} />
            </button>
          ) : (
            <button 
              className={styles.micButton} 
              onClick={() => isListening ? recognition.current?.stop() : setIsListening(true)}
              style={{ background: isListening ? '#ef4444' : '' }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatScreen;
