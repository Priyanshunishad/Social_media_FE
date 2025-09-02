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
  const hasJoinedRef = useRef(false);

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

  // WebSocket setup and message handling
  useEffect(() => {
    if (!user) return;

    const setupWebSocket = () => {
      console.log("🔧 Setting up WebSocket for user:", user.id);
      
      // Check WebSocket connection state
      if (ws.readyState === WebSocket.CONNECTING) {
        console.log("⏳ WebSocket is connecting...");
      } else if (ws.readyState === WebSocket.OPEN) {
        console.log("✅ WebSocket is already open");
        setIsConnected(true);
        
        // Join if not already joined
        if (!hasJoinedRef.current) {
          ws.send(JSON.stringify({
            type: "join",
            userId: user.id,
          }));
          hasJoinedRef.current = true;
          console.log("📝 Sent join message for user:", user.id);
        }
      } else if (ws.readyState === WebSocket.CLOSED) {
        console.log("❌ WebSocket is closed");
        setIsConnected(false);
      }

      // WebSocket event handlers
      const handleOpen = () => {
        console.log("🔗 WebSocket opened");
        setIsConnected(true);
        
        // Send join message when connection opens
        ws.send(JSON.stringify({
          type: "join",
          userId: user.id,
        }));
        hasJoinedRef.current = true;
        console.log("📝 Sent join message for user:", user.id);
      };

      const handleMessage = (event) => {
        console.log("📨 Raw WebSocket message received:", event.data);
        
        try {
          const data = JSON.parse(event.data);
          console.log("📨 Parsed WebSocket message:", data);

          // Handle different message types
          if (data.type === 'message' || data.type === 'chat' || data.message) {
            console.log("💬 Processing chat message:", data);
            
            // Create standardized message object
            const newChatMessage = {
              id: data.id || `msg-${Date.now()}-${Math.random()}`,
              senderId: data.senderId,
              receiverId: data.receiverId,
              sender: data.sender || {
                id: data.senderId,
                username: data.senderUsername || 'Unknown'
              },
              receiver: data.receiver || {
                id: data.receiverId,
                username: data.receiverUsername || 'Unknown'
              },
              message: data.message,
              type: data.msgType || data.type || 'text',
              createdAt: data.createdAt || new Date().toISOString(),
              status: 'delivered'
            };

            console.log("📝 Standardized message:", newChatMessage);

            // Add message to chats immediately
            setChats(prevChats => {
              // Check for duplicates
              const isDuplicate = prevChats.some(chat => 
                (chat.id === newChatMessage.id) ||
                (chat.senderId === newChatMessage.senderId && 
                 chat.receiverId === newChatMessage.receiverId && 
                 chat.message === newChatMessage.message &&
                 Math.abs(new Date(chat.createdAt) - new Date(newChatMessage.createdAt)) < 2000)
              );
              
              if (isDuplicate) {
                console.log("🔄 Duplicate message detected, skipping");
                return prevChats;
              }

              console.log("✅ Adding new message to chat list");
              return [...prevChats, newChatMessage];
            });
          } else if (data.type === 'join') {
            console.log("👋 User joined:", data);
          } else {
            console.log("❓ Unknown message type:", data);
          }
        } catch (error) {
          console.error("❌ Error parsing WebSocket message:", error, event.data);
        }
      };

      const handleClose = (event) => {
        console.log("❌ WebSocket closed:", event.code, event.reason);
        setIsConnected(false);
        hasJoinedRef.current = false;
        
        // Attempt to reconnect after 2 seconds
        setTimeout(() => {
          console.log("🔄 Attempting to reconnect...");
          setupWebSocket();
        }, 2000);
      };

      const handleError = (error) => {
        console.error("❌ WebSocket error:", error);
        setIsConnected(false);
      };

      // Remove existing listeners to prevent duplicates
      ws.removeEventListener('open', handleOpen);
      ws.removeEventListener('message', handleMessage);
      ws.removeEventListener('close', handleClose);
      ws.removeEventListener('error', handleError);

      // Add new listeners
      ws.addEventListener('open', handleOpen);
      ws.addEventListener('message', handleMessage);
      ws.addEventListener('close', handleClose);
      ws.addEventListener('error', handleError);

      // If already open, trigger open handler
      if (ws.readyState === WebSocket.OPEN) {
        handleOpen();
      }
    };

    setupWebSocket();

    // Cleanup function
    return () => {
      console.log("🧹 Cleaning up WebSocket listeners");
      ws.removeEventListener('open', () => {});
      ws.removeEventListener('message', () => {});
      ws.removeEventListener('close', () => {});
      ws.removeEventListener('error', () => {});
    };
  }, [user]);

  // Send message function
  const handleSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedChat || !isConnected) {
      console.log("❌ Cannot send message:", {
        hasMessage: !!newMessage.trim(),
        hasSelectedChat: !!selectedChat,
        isConnected
      });
      return;
    }

    const messageText = newMessage.trim();
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    console.log("📤 Preparing to send message:", {
      to: selectedChat.id,
      message: messageText,
      from: user.id
    });

    // Create optimistic message for immediate UI feedback
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
      createdAt: new Date().toISOString(),
    };

    // Add optimistic message to UI
    setChats(prevChats => [...prevChats, optimisticMessage]);
    setNewMessage("");

    // Prepare WebSocket message
    const wsMessage = {
      type: "chat",
      senderId: user.id,
      receiverId: selectedChat.id,
      message: messageText,
      msgType: "text",
      timestamp: new Date().toISOString()
    };

    try {
      console.log("📤 Sending WebSocket message:", wsMessage);
      ws.send(JSON.stringify(wsMessage));
      console.log("✅ Message sent via WebSocket");

      // Update optimistic message to show as sent
      setTimeout(() => {
        setChats(prevChats => 
          prevChats.map(chat => 
            chat.id === tempId 
              ? { ...chat, status: "sent" }
              : chat
          )
        );
      }, 100);

    } catch (error) {
      console.error("❌ Failed to send message:", error);
      
      // Remove optimistic message on failure and restore text
      setChats(prevChats => prevChats.filter(chat => chat.id !== tempId));
      setNewMessage(messageText);
      
      alert("Failed to send message. Please try again.");
    }
  }, [newMessage, selectedChat, isConnected, user]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Generate conversations list
  const chatList = React.useMemo(() => {
    if (!user || !chats.length) return [];

    console.log("🔄 Regenerating chat list from", chats.length, "messages");

    const conversations = chats.reduce((acc, chat) => {
      const otherUser = chat.senderId === user.id
        ? (chat.receiver || { id: chat.receiverId, username: 'Unknown' })
        : (chat.sender || { id: chat.senderId, username: 'Unknown' });

      if (!otherUser?.id || otherUser.id === user.id) return acc;

      const existingIndex = acc.findIndex(c => c.id === otherUser.id);
      const chatTime = new Date(chat.createdAt).getTime();

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

      if (existingIndex === -1) {
        acc.push(conversationData);
      } else if (chatTime > acc[existingIndex].timestamp) {
        acc[existingIndex] = conversationData;
      }

      return acc;
    }, []);

    return conversations.sort((a, b) => b.timestamp - a.timestamp);
  }, [chats, user]);

  // Get messages for selected chat
  const selectedChatMessages = React.useMemo(() => {
    if (!selectedChat || !user) return [];

    const messages = chats
      .filter(chat =>
        (chat.senderId === user.id && chat.receiverId === selectedChat.id) ||
        (chat.senderId === selectedChat.id && chat.receiverId === user.id)
      )
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    console.log(`💬 Selected chat messages for ${selectedChat.username}:`, messages.length);
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
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                     title={isConnected ? 'Connected' : 'Disconnected'} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Online' : 'Offline'}
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
                    className={`flex items-center justify-between px-3 py-3 cursor-pointer hover:bg-gray-100 ${
                      selectedChat?.id === chat.id
                        ? "bg-blue-50 border-r-2 border-blue-500"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full"
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
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm text-gray-500">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${!showSidebar ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-3 flex items-center gap-3 bg-white">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded mr-2"
                >
                  ←
                </button>
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <span className="font-semibold block">{selectedChat.name}</span>
                  <p className="text-xs text-gray-500">@{selectedChat.username}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-xs text-gray-500">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                {selectedChatMessages.length > 0 ? (
                  <div className="space-y-2">
                    {selectedChatMessages.map((chat) => {
                      const isOwnMessage = chat.senderId === user.id;
                      return (
                        <div
                          key={chat.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-2xl relative ${
                              isOwnMessage
                                ? "bg-blue-500 text-white"
                                : "bg-white border"
                            } ${chat.status === 'sending' ? 'opacity-70' : ''}`}
                          >
                            <p className="text-sm">{chat.message}</p>
                            <p className="text-xs opacity-60 mt-1">
                              {new Date(chat.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            {chat.status === 'sending' && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                            )}
                            {chat.status === 'sent' && isOwnMessage && (
                              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-400 rounded-full" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-2">👋</div>
                    <p className="text-gray-500">Start the conversation with {selectedChat.name}!</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="border-t p-3 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Message ${selectedChat.name}...`}
                    className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || !isConnected}
                    className={`px-4 py-2 rounded-full text-white text-sm font-medium transition-all ${
                      !newMessage.trim() || !isConnected
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
                    }`}
                  >
                    Send
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-1 text-center">
                    Connection lost. Attempting to reconnect...
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-lg font-bold mb-2">Your Messages</h2>
              <p className="text-sm text-gray-500 mb-4">
                Select a conversation to start messaging
              </p>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-500">
                  {isConnected ? 'Connected and ready' : 'Connecting...'}
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