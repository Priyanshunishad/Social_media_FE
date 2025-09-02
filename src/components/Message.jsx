import React, { useEffect, useState, useRef } from "react";
import LeftNavbar from "../components/LeftNavbar";
import { useAuth } from "../contexts/AuthContext";
import ws from "../utills/webSocket.js";

const Message = () => {
  const [chats, setChats] = useState([]); // all chat messages
  const { user, fetchHistory } = useAuth();
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chats, selectedChat]);

  // Load old chats (history from DB)
  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await fetchHistory();
        if (res.success) setChats(res.chats);
      } catch (error) {
        console.error("Failed to load chat history:", error);
      }
    };
    loadChats();
  }, [fetchHistory]);

  // WebSocket connection and message handling
  useEffect(() => {
    if (!user) return;

    const setupWebSocket = () => {
      // Check if WebSocket is already connected
      if (ws.readyState === WebSocket.OPEN) {
        setIsConnected(true);
        // Send join message if not already sent
        ws.send(JSON.stringify({
          type: "join",
          userId: user.id,
        }));
        return;
      }

      // Handle WebSocket open
      ws.onopen = () => {
        setIsConnected(true);
        ws.send(JSON.stringify({
          type: "join",
          userId: user.id,
        }));
        console.log("🔗 WebSocket connected as", user.id);
      };

      // Handle incoming messages
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📩 New message:", data);

          // Add new message to chats
          if (data.message) {
            setChats((prev) => {
              // Check if message already exists to prevent duplicates
              const exists = prev.some(chat => 
                chat.id === data.id || 
                (chat.senderId === data.senderId && 
                 chat.receiverId === data.receiverId && 
                 chat.message === data.message &&
                 Math.abs(new Date(chat.createdAt) - new Date(data.createdAt)) < 1000)
              );
              
              if (exists) return prev;
              
              // Remove temporary message with same content if exists
              const filteredPrev = prev.filter(chat => 
                !(chat.id.toString().startsWith('temp-') && 
                  chat.senderId === data.senderId && 
                  chat.receiverId === data.receiverId && 
                  chat.message === data.message)
              );
              
              return [...filteredPrev, data];
            });
            
            // Refresh chat history to ensure we have latest data
            setTimeout(() => {
              refreshChats();
            }, 100);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log("❌ WebSocket disconnected");
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
      };
    };

    setupWebSocket();

    // Cleanup function
    return () => {
      // Don't close the WebSocket here as it might be used by other components
      // Just remove the event listeners if needed
    };
  }, [user]);

  // Refresh chat history
  const refreshChats = async () => {
    try {
      const res = await fetchHistory();
      if (res.success) {
        setChats(res.chats);
      }
    } catch (error) {
      console.error("Failed to refresh chat history:", error);
    }
  };

  // Send a message
  const handleSend = async () => {
    if (!newMessage.trim() || !selectedChat || !isConnected) return;

    const msgObj = {
      type: "chat",
      receiverId: selectedChat.id,
      message: newMessage.trim(),
      msgType: "text",
    };

    try {
      ws.send(JSON.stringify(msgObj));

      // Add message to UI immediately (optimistic update)
      const tempMessage = {
        id: `temp-${Date.now()}`, // temporary id
        senderId: user.id,
        receiverId: selectedChat.id,
        sender: { 
          id: user.id, 
          firstName: user.firstName, 
          lastName: user.lastName,
          username: user.username 
        },
        receiver: { 
          id: selectedChat.id, 
          firstName: selectedChat.firstName, 
          lastName: selectedChat.lastName,
          username: selectedChat.username 
        },
        message: newMessage.trim(),
        type: "text",
        status: "sending",
        createdAt: new Date().toISOString(),
      };

      setChats((prev) => [...prev, tempMessage]);
      setNewMessage("");

      // Refresh chat history after a short delay to get the real message from DB
      setTimeout(() => {
        refreshChats();
      }, 500);

    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Generate chat list for sidebar
  const chatList = chats.reduce((acc, chat) => {
    // Determine the other user in the conversation
    const otherUser = chat.senderId === user.id ? 
      (chat.receiver || { id: chat.receiverId }) : 
      (chat.sender || { id: chat.senderId });

    // Skip if we don't have enough info about the other user
    if (!otherUser || !otherUser.id) return acc;

    // Check if this conversation already exists in our list
    const existingChat = acc.find((c) => c.id === otherUser.id);
    
    if (!existingChat) {
      acc.push({
        id: otherUser.id,
        name: `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() || otherUser.username || "Unknown User",
        username: otherUser.username || "unknown",
        avatar: otherUser.profilePicture || 
          `https://ui-avatars.com/api/?name=${(otherUser.username || "U").charAt(0)}&size=128&background=random&color=fff`,
        lastMsg: chat.message || "",
        time: new Date(chat.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        timestamp: new Date(chat.createdAt).getTime(),
      });
    } else {
      // Update with latest message if this one is newer
      const chatTime = new Date(chat.createdAt).getTime();
      if (chatTime > existingChat.timestamp) {
        existingChat.lastMsg = chat.message || "";
        existingChat.time = new Date(chat.createdAt).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        existingChat.timestamp = chatTime;
      }
    }
    return acc;
  }, []);

  // Sort chat list by most recent message
  chatList.sort((a, b) => b.timestamp - a.timestamp);

  // Get messages for selected chat
  const selectedChatMessages = selectedChat ? 
    chats.filter((chat) => 
      (chat.senderId === user.id && chat.receiverId === selectedChat.id) ||
      (chat.senderId === selectedChat.id && chat.receiverId === user.id)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)) : [];

  return (
    <div className="flex h-screen md:h-[80vh] bg-white">
      {/* Mobile/Desktop LeftNavbar - Hide on mobile when in chat */}
      <div className={`${showSidebar || window.innerWidth >= 768 ? 'block' : 'hidden'} md:block`}>
        <LeftNavbar />
      </div>

      <div className="flex flex-1 relative">
        {/* Left Sidebar - Responsive */}
        <div className={`
          ${showSidebar ? 'flex' : 'hidden'} md:flex
          w-full md:w-1/3 lg:w-1/4 xl:w-1/3
          ${selectedChat && !showSidebar ? 'absolute inset-0 z-10 md:relative md:z-auto' : ''}
          border-r border-gray-200 flex-col bg-white
        `}>
          <div className="p-3 md:p-4 border-b font-bold text-lg text-left flex items-center justify-between">
            <span className="truncate">{user?.username}</span>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={isConnected ? 'Connected' : 'Disconnected'} />
              {/* Mobile close button when in chat */}
              {selectedChat && (
                <button
                  onClick={() => setShowSidebar(false)}
                  className="md:hidden p-1 hover:bg-gray-100 rounded"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="p-3 border-b">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full">
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatList.length > 0 ? (
              <ul>
                {chatList.map((chat) => (
                  <li
                    key={chat.id}
                    onClick={() => {
                      setSelectedChat(chat);
                      // On mobile, hide sidebar when chat is selected
                      if (window.innerWidth < 768) {
                        setShowSidebar(false);
                      }
                    }}
                    className={`flex items-center justify-between px-3 md:px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                      selectedChat?.id === chat.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0"
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${chat.username.charAt(0)}&size=128&background=random&color=fff`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{chat.name}</p>
                        <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{chat.time}</span>
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

        {/* Right Chat Window - Responsive */}
        <div className={`
          ${!showSidebar ? 'flex' : 'hidden'} md:flex
          flex-1 flex-col
          ${showSidebar ? 'w-0 md:w-2/3 lg:w-3/4 xl:w-2/3' : 'w-full'}
        `}>
          {selectedChat ? (
            <>
              {/* Chat Header - Mobile Back Button */}
              <div className="border-b p-3 md:p-4 flex items-center gap-3 bg-white">
                {/* Mobile back button */}
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
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${selectedChat.username.charAt(0)}&size=128&background=random&color=fff`;
                  }}
                />
                <div className="flex-1 min-w-0">
                  <span className="font-semibold block truncate">{selectedChat.name}</span>
                  <p className="text-xs text-gray-500 truncate">@{selectedChat.username}</p>
                </div>
              </div>

              {/* Messages Area - Responsive with bottom padding for mobile footer */}
              <div className="flex-1 p-3 md:p-4 overflow-y-auto bg-gray-50 pb-20 md:pb-4">
                {selectedChatMessages.length > 0 ? (
                  <div className="space-y-2 md:space-y-4">
                    {selectedChatMessages.map((chat, index) => {
                      const isOwnMessage = chat.senderId === user.id;
                      const showAvatar = index === 0 || 
                        selectedChatMessages[index - 1].senderId !== chat.senderId;
                      
                      return (
                        <div
                          key={chat.id}
                          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${
                            showAvatar ? "mt-3 md:mt-4" : "mt-1"
                          }`}
                        >
                          {!isOwnMessage && showAvatar && (
                            <img
                              src={selectedChat.avatar}
                              alt={selectedChat.name}
                              className="w-5 h-5 md:w-6 md:h-6 rounded-full mr-2 mt-1 flex-shrink-0"
                            />
                          )}
                          {!isOwnMessage && !showAvatar && (
                            <div className="w-5 md:w-6 mr-2 flex-shrink-0"></div>
                          )}
                          
                          <div
                            className={`max-w-xs sm:max-w-sm lg:max-w-md px-3 md:px-4 py-2 rounded-2xl break-words ${
                              isOwnMessage
                                ? "bg-blue-500 text-white"
                                : "bg-white border border-gray-200"
                            } ${chat.status === "sending" ? "opacity-70" : ""}`}
                          >
                            <p className="text-sm">{chat.message}</p>
                            <p className={`text-xs mt-1 ${
                              isOwnMessage ? "text-blue-100" : "text-gray-400"
                            }`}>
                              {new Date(chat.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {chat.status === "sending" && " • Sending..."}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-2">👋</div>
                    <p className="text-gray-500">Start the conversation!</p>
                  </div>
                )}
              </div>

              {/* Message Input - Fixed at bottom with padding for mobile footer */}
              <div className="border-t p-3 bg-white fixed bottom-0 left-0 right-0 md:relative md:bottom-auto pb-20 md:pb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Message ${selectedChat.name}...`}
                    className="flex-1 border border-gray-300 rounded-full px-3 md:px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={!isConnected}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || !isConnected}
                    className="bg-blue-500 text-white px-3 md:px-4 py-2 rounded-full hover:bg-blue-600 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <span className="hidden sm:inline">Send</span>
                    <span className="sm:hidden">→</span>
                  </button>
                </div>
                {!isConnected && (
                  <p className="text-xs text-red-500 mt-1 text-center">
                    Disconnected - trying to reconnect...
                  </p>
                )}
              </div>
            </>
          ) : (
            // No chat selected view - Responsive with bottom padding for mobile footer
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4 md:p-8 pb-20 md:pb-8">
              <div className="text-4xl md:text-6xl mb-4">💬</div>
              <h2 className="text-lg md:text-xl font-bold mb-2">Your messages</h2>
              <p className="text-sm text-gray-500 mb-4 max-w-sm">
                Send private messages to your friends.
              </p>
              {chatList.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Select a conversation to start chatting
                  </p>
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="md:hidden bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                  >
                    View Conversations
                  </button>
                </div>
              ) : (
                <button className="bg-blue-500 text-white px-4 md:px-5 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors">
                  Send message
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;