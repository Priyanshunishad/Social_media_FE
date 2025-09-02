

// src/pages/Message.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import LeftNavbar from "../components/LeftNavbar";
import { useAuth } from "../contexts/AuthContext";
import ws from "../utills/webSocket.js";

const Message = () => {
  const [chats, setChats] = useState([]);
  const { user, fetchHistory } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);
  const wsListenersSetRef = useRef(false);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chats]);

  // ✅ Load pre-selected chat from Rightbar
  useEffect(() => {
    const storedUser = localStorage.getItem("selectedChatUser");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setSelectedChat(parsedUser);
        localStorage.removeItem("selectedChatUser");
        setShowSidebar(false);
      } catch (err) {
        console.error("Failed to parse selectedChatUser:", err);
      }
    }
  }, []);

  // Load initial chat history
  useEffect(() => {
    const loadChats = async () => {
      if (!user) return;
      try {
        const res = await fetchHistory();
        if (res.success) {
          console.log("📋 Loaded initial chats:", res.chats.length);
          setChats(res.chats);
        }
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };
    loadChats();
  }, [fetchHistory, user]);

  // Real-time WebSocket setup - FIXED VERSION
  useEffect(() => {
    if (!user || wsListenersSetRef.current) return;

    console.log("🚀 Setting up WebSocket for user:", user.id);

    // WebSocket Message Handler - This is the key fix!
    const handleIncomingMessage = (event) => {
      console.log("📨 RAW WebSocket data received:", event.data);
      
      try {
        const data = JSON.parse(event.data);
        console.log("📨 PARSED WebSocket message:", data);

        // Handle chat messages - ANY message with content
        if (data.message && (data.senderId || data.sender_id || data.from)) {
          console.log("💬 Processing REAL-TIME chat message:", data);
          
          // Create standardized message object
          const realTimeMessage = {
            id: data.id || data.message_id || `rt-${Date.now()}-${Math.random()}`,
            senderId: data.senderId || data.sender_id || data.from,
            receiverId: data.receiverId || data.receiver_id || data.to,
            sender: data.sender || {
              id: data.senderId || data.sender_id || data.from,
              username: data.senderUsername || data.sender_username || 'User',
              firstName: data.senderFirstName || '',
              lastName: data.senderLastName || ''
            },
            receiver: data.receiver || {
              id: data.receiverId || data.receiver_id || data.to,
              username: data.receiverUsername || data.receiver_username || 'User'
            },
            message: data.message,
            type: data.type || data.msgType || 'text',
            createdAt: data.createdAt || data.created_at || data.timestamp || new Date().toISOString(),
            status: 'delivered'
          };

          console.log("✨ STANDARDIZED real-time message:", realTimeMessage);

          // Add to chats IMMEDIATELY - this is the WhatsApp-like behavior
          setChats(prevChats => {
            console.log("🔄 Current chats count:", prevChats.length);
            
            // Advanced duplicate detection
            const isDuplicate = prevChats.some(existingChat => {
              // Check by ID first
              if (existingChat.id === realTimeMessage.id) return true;
              
              // Check by content and participants
              const sameParticipants = (
                existingChat.senderId === realTimeMessage.senderId && 
                existingChat.receiverId === realTimeMessage.receiverId
              );
              const sameMessage = existingChat.message === realTimeMessage.message;
              const timeWindow = Math.abs(
                new Date(existingChat.createdAt) - new Date(realTimeMessage.createdAt)
              ) < 3000; // 3 second window
              
              return sameParticipants && sameMessage && timeWindow;
            });
            
            if (isDuplicate) {
              console.log("🚫 Duplicate message detected, ignoring");
              return prevChats;
            }

            console.log("✅ ADDING NEW REAL-TIME MESSAGE TO CHAT!");
            const newChats = [...prevChats, realTimeMessage];
            console.log("📊 New chats count:", newChats.length);
            return newChats;
          });

          // Show notification for incoming messages (not from current user)
          if (realTimeMessage.senderId !== user.id) {
            console.log("🔔 New message from:", realTimeMessage.sender.username);
            
            // Optional: Browser notification
            if (document.hidden && Notification.permission === 'granted') {
              new Notification(`New message from ${realTimeMessage.sender.username}`, {
                body: realTimeMessage.message,
                icon: realTimeMessage.sender.profilePicture || '/default-avatar.png'
              });
            }
          }
        } 
        // Handle join/system messages
        else if (data.type === 'join' || data.type === 'user_joined') {
          console.log("👋 User joined WebSocket:", data);
        }
        // Handle connection confirmations
        else if (data.type === 'connection' || data.type === 'connected') {
          console.log("🔗 WebSocket connection confirmed:", data);
        }
        else {
          console.log("❓ Unknown WebSocket message type:", data);
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
        console.error("❌ Raw data was:", event.data);
      }
    };

    // Connection state handlers
    const handleOpen = () => {
      console.log("🔗 WebSocket connection OPENED");
      setIsConnected(true);
      
      // Send join message to server
      const joinMessage = {
        type: "join",
        userId: user.id,
        username: user.username,
        action: "join_room"
      };
      
      console.log("📤 Sending JOIN message:", joinMessage);
      ws.send(JSON.stringify(joinMessage));
    };

    const handleClose = (event) => {
      console.log("❌ WebSocket CLOSED:", event.code, event.reason);
      setIsConnected(false);
      wsListenersSetRef.current = false;
      
      // Auto-reconnect after 2 seconds
      setTimeout(() => {
        console.log("🔄 Attempting WebSocket reconnection...");
        setupWebSocketConnection();
      }, 2000);
    };

    const handleError = (error) => {
      console.error("❌ WebSocket ERROR:", error);
      setIsConnected(false);
    };

    // Setup WebSocket connection
    const setupWebSocketConnection = () => {
      console.log("🔧 WebSocket setup - Current state:", ws.readyState);
      
      // Remove any existing listeners first
      ws.removeEventListener('message', handleIncomingMessage);
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('close', handleClose);
      ws.removeEventListener('error', handleError);

      // Add fresh listeners
      ws.addEventListener('message', handleIncomingMessage);
      ws.addEventListener('open', handleOpen);
      ws.addEventListener('close', handleClose);
      ws.addEventListener('error', handleError);

      wsListenersSetRef.current = true;

      // Handle current connection state
      if (ws.readyState === WebSocket.OPEN) {
        console.log("✅ WebSocket already open, triggering join");
        handleOpen();
      } else if (ws.readyState === WebSocket.CONNECTING) {
        console.log("⏳ WebSocket connecting, waiting...");
      } else {
        console.log("❌ WebSocket closed, may need manual reconnection");
        setIsConnected(false);
      }
    };

    // Initialize WebSocket
    setupWebSocketConnection();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup on unmount
    return () => {
      console.log("🧹 Cleaning up WebSocket listeners");
      ws.removeEventListener('message', handleIncomingMessage);
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('close', handleClose);
      ws.removeEventListener('error', handleError);
      wsListenersSetRef.current = false;
    };
  }, [user]);

  // Send message function - IMPROVED
  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat || !isConnected) {
      console.log("❌ Cannot send message - validation failed:", {
        hasMessage: !!newMessage.trim(),
        hasSelectedChat: !!selectedChat,
        isConnected
      });
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const timestamp = new Date().toISOString();

    console.log("📤 SENDING message:", {
      from: user.id,
      to: selectedChat.id,
      message: messageText
    });

    // Create optimistic message (shows immediately in your chat)
    const optimisticMessage = {
      id: tempId,
      senderId: user.id,
      receiverId: selectedChat.id,
      sender: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      receiver: {
        id: selectedChat.id,
        username: selectedChat.username,
      },
      message: messageText,
      type: "text",
      status: "sending",
      createdAt: timestamp,
    };

    // Show message immediately in UI (WhatsApp behavior)
    setChats(prevChats => {
      console.log("📝 Adding optimistic message to UI");
      return [...prevChats, optimisticMessage];
    });
    
    // Clear input immediately
    setNewMessage("");

    // Prepare WebSocket message - try multiple formats for compatibility
    const wsMessage = {
      type: "chat",
      action: "send_message",
      senderId: user.id,
      receiverId: selectedChat.id,
      sender_id: user.id, // Alternative format
      receiver_id: selectedChat.id, // Alternative format
      from: user.id, // Another alternative
      to: selectedChat.id, // Another alternative
      message: messageText,
      msgType: "text",
      timestamp: timestamp,
      createdAt: timestamp,
      // Include sender info for better message handling
      sender: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };

    try {
      console.log("📡 Sending via WebSocket:", wsMessage);
      ws.send(JSON.stringify(wsMessage));
      
      // Update message status to "sent"
      setTimeout(() => {
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === tempId 
              ? { ...chat, status: "sent" }
              : chat
          )
        );
      }, 200);

      console.log("✅ Message sent successfully");

    } catch (error) {
      console.error("❌ Failed to send WebSocket message:", error);
      
      // Remove failed message and restore input
      setChats(prevChats => prevChats.filter(chat => chat.id !== tempId));
      setNewMessage(messageText);
      
      alert("Failed to send message. Please check your connection and try again.");
    }
  }, [newMessage, selectedChat, isConnected, user]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Generate conversations list - OPTIMIZED
  const chatList = React.useMemo(() => {
    if (!user || !chats.length) return [];

    console.log("🔄 Rebuilding chat list from", chats.length, "messages");

    const conversations = new Map();

    chats.forEach(chat => {
      const otherUser = chat.senderId === user.id
        ? (chat.receiver || { id: chat.receiverId, username: 'Unknown' })
        : (chat.sender || { id: chat.senderId, username: 'Unknown' });

      if (!otherUser?.id || otherUser.id === user.id) return;

      const chatTime = new Date(chat.createdAt).getTime();
      const existingConversation = conversations.get(otherUser.id);

      const conversationData = {
        id: otherUser.id,
        name: `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() ||
              otherUser.username ||
              "Unknown User",
        username: otherUser.username || "unknown",
        avatar: otherUser.profilePicture ||
               `https://ui-avatars.com/api/?name=${(otherUser.username || "U").charAt(0)}&size=128&background=random&color=fff`,
        lastMsg: chat.message || "",
        time: new Date(chat.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: chatTime,
      };

      // Only update if this is a newer message
      if (!existingConversation || chatTime > existingConversation.timestamp) {
        conversations.set(otherUser.id, conversationData);
      }
    });

    const result = Array.from(conversations.values()).sort((a, b) => b.timestamp - a.timestamp);
    console.log("📋 Generated chat list with", result.length, "conversations");
    return result;
  }, [chats, user]);

  // Get messages for selected chat - OPTIMIZED
  const selectedChatMessages = React.useMemo(() => {
    if (!selectedChat || !user) return [];

    const messages = chats
      .filter(chat =>
        (chat.senderId === user.id && chat.receiverId === selectedChat.id) ||
        (chat.senderId === selectedChat.id && chat.receiverId === user.id)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    console.log(`💬 Messages for ${selectedChat.username}:`, messages.length);
    return messages;
  }, [chats, selectedChat, user]);

  return (
    <div className="flex h-screen md:h-[80vh] bg-white">
      {/* Navbar */}
      <div className={`${showSidebar || window.innerWidth >= 768 ? "block" : "hidden"} md:block`}>
        <LeftNavbar />
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div className={`${showSidebar ? "flex" : "hidden"} md:flex w-full md:w-1/3 lg:w-1/4 xl:w-1/3 border-r border-gray-200 flex-col bg-white`}>
          {/* Header */}
          <div className="p-3 md:p-4 border-b">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">{user?.username}</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs font-medium text-gray-600">
                  {isConnected ? 'Online' : 'Connecting...'}
                </span>
              </div>
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            {chatList.length > 0 ? (
              <ul>
                {chatList.map((chat) => (
                  <li
                    key={chat.id}
                    onClick={() => {
                      console.log("🎯 Selected chat:", chat);
                      setSelectedChat(chat);
                      if (window.innerWidth < 768) setShowSidebar(false);
                    }}
                    className={`flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedChat?.id === chat.id
                        ? "bg-blue-50 border-r-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{chat.name}</p>
                        <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{chat.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-sm text-gray-500">No conversations yet</p>
                <p className="text-xs text-gray-400 mt-1">Start a new chat to begin messaging</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${!showSidebar ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 flex items-center gap-3 bg-white shadow-sm">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full mr-1"
                >
                  ←
                </button>
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{selectedChat.name}</h2>
                  <p className="text-sm text-gray-500">@{selectedChat.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-gray-600">
                    {isConnected ? 'Active now' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                {selectedChatMessages.length > 0 ? (
                  <>
                    {selectedChatMessages.map((chat) => {
                      const isOwnMessage = chat.senderId === user.id;
                      return (
                        <div
                          key={chat.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative shadow-sm ${
                              isOwnMessage
                                ? "bg-blue-500 text-white"
                                : "bg-white border"
                            } ${chat.status === 'sending' ? 'opacity-75' : ''}`}
                          >
                            <p className="text-sm leading-relaxed">{chat.message}</p>
                            <p className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(chat.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            
                            {/* Message Status Indicators */}
                            {isOwnMessage && (
                              <div className="absolute -bottom-1 -right-1">
                                {chat.status === 'sending' && (
                                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                                )}
                                {chat.status === 'sent' && (
                                  <div className="w-3 h-3 bg-green-400 rounded-full" />
                                )}
                                {chat.status === 'delivered' && (
                                  <div className="w-3 h-3 bg-blue-400 rounded-full" />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">👋</div>
                    <h3 className="text-xl font-semibold mb-2">Say hello to {selectedChat.name}!</h3>
                    <p className="text-gray-500">This is the beginning of your conversation</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-white">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Type a message to ${selectedChat.name}...`}
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || !isConnected}
                    className={`px-6 py-2 rounded-full text-white text-sm font-medium transition-all duration-200 ${
                      !newMessage.trim() || !isConnected
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 active:scale-95 shadow-md'
                    }`}
                  >
                    Send
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-2 text-center animate-pulse">
                    ⚠️ Connection lost. Reconnecting...
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-8">
              <div className="text-8xl mb-6">💬</div>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Welcome to Messages</h2>
              <p className="text-gray-500 mb-6 max-w-md">
                Select a conversation from the sidebar to start chatting, or start a new conversation.
              </p>
              <div className="flex items-center gap-3 text-sm bg-gray-100 px-4 py-2 rounded-full">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-medium text-gray-600">
                  {isConnected ? 'Connected and ready to chat' : 'Connecting to server...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;

