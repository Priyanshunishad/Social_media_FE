// src/pages/Message.jsx
import React, { useEffect, useState, useRef } from "react";
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

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chats, selectedChat]);

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

  // Load old chats
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

  // WebSocket
  useEffect(() => {
    if (!user) return;

    const setupWebSocket = () => {
      if (ws.readyState === WebSocket.OPEN) {
        setIsConnected(true);
        ws.send(
          JSON.stringify({
            type: "join",
            userId: user.id,
          })
        );
        return;
      }

      ws.onopen = () => {
        setIsConnected(true);
        ws.send(
          JSON.stringify({
            type: "join",
            userId: user.id,
          })
        );
        console.log("🔗 WebSocket connected as", user.id);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.message) {
            setChats((prev) => [...prev, data]);
            setTimeout(() => refreshChats(), 100);
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
  }, [user]);

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

  // Send message
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
      const tempMessage = {
        id: `temp-${Date.now()}`,
        senderId: user.id,
        receiverId: selectedChat.id,
        sender: {
          id: user.id,
          username: user.username,
        },
        receiver: {
          id: selectedChat.id,
          username: selectedChat.username,
        },
        message: newMessage.trim(),
        type: "text",
        status: "sending",
        createdAt: new Date().toISOString(),
      };
      setChats((prev) => [...prev, tempMessage]);
      setNewMessage("");
      setTimeout(() => refreshChats(), 500);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Conversations list
  const chatList = chats.reduce((acc, chat) => {
    const otherUser =
      chat.senderId === user.id
        ? chat.receiver || { id: chat.receiverId }
        : chat.sender || { id: chat.senderId };

    if (!otherUser?.id) return acc;

    const existingChat = acc.find((c) => c.id === otherUser.id);
    if (!existingChat) {
      acc.push({
        id: otherUser.id,
        name:
          `${otherUser.firstName || ""} ${otherUser.lastName || ""}`.trim() ||
          otherUser.username ||
          "Unknown User",
        username: otherUser.username || "unknown",
        avatar:
          otherUser.profilePicture ||
          `https://ui-avatars.com/api/?name=${
            (otherUser.username || "U").charAt(0)
          }&size=128&background=random&color=fff`,
        lastMsg: chat.message || "",
        time: new Date(chat.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        timestamp: new Date(chat.createdAt).getTime(),
      });
    } else {
      const chatTime = new Date(chat.createdAt).getTime();
      if (chatTime > existingChat.timestamp) {
        existingChat.lastMsg = chat.message || "";
        existingChat.time = new Date(chat.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
        existingChat.timestamp = chatTime;
      }
    }
    return acc;
  }, []);

  chatList.sort((a, b) => b.timestamp - a.timestamp);

  // Filtered messages
  const selectedChatMessages = selectedChat
    ? chats
        .filter(
          (chat) =>
            (chat.senderId === user.id &&
              chat.receiverId === selectedChat.id) ||
            (chat.senderId === selectedChat.id && chat.receiverId === user.id)
        )
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    : [];

  return (
    <div className="flex h-screen md:h-[80vh] bg-white">
      {/* Navbar */}
      <div
        className={`${
          showSidebar || window.innerWidth >= 768 ? "block" : "hidden"
        } md:block`}
      >
        <LeftNavbar />
      </div>

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <div
          className={`${
            showSidebar ? "flex" : "hidden"
          } md:flex w-full md:w-1/3 lg:w-1/4 xl:w-1/3 border-r border-gray-200 flex-col bg-white`}
        >
          <div className="p-3 md:p-4 border-b font-bold text-lg text-left">
            {user?.username}
          </div>
          <div className="flex-1 overflow-y-auto">
            {chatList.length > 0 ? (
              <ul>
                {chatList.map((chat) => (
                  <li
                    key={chat.id}
                    onClick={() => {
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
                        <p className="font-semibold text-sm truncate">
                          {chat.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {chat.lastMsg}
                        </p>
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

        {/* Chat window */}
        <div
          className={`${
            !showSidebar ? "flex" : "hidden"
          } md:flex flex-1 flex-col`}
        >
          {selectedChat ? (
            <>
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
                <div>
                  <span className="font-semibold block">
                    {selectedChat.name}
                  </span>
                  <p className="text-xs text-gray-500">
                    @{selectedChat.username}
                  </p>
                </div>
              </div>

              <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                {selectedChatMessages.length > 0 ? (
                  <div className="space-y-2">
                    {selectedChatMessages.map((chat) => {
                      const isOwnMessage = chat.senderId === user.id;
                      return (
                        <div
                          key={chat.id}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs px-3 py-2 rounded-2xl ${
                              isOwnMessage
                                ? "bg-blue-500 text-white"
                                : "bg-white border"
                            }`}
                          >
                            <p className="text-sm">{chat.message}</p>
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

              <div className="border-t p-3 bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={`Message ${selectedChat.name}...`}
                    className="flex-1 border rounded-full px-3 py-2 text-sm"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || !isConnected}
                    className="bg-blue-500 text-white px-3 py-2 rounded-full"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-4">
              <div className="text-4xl mb-4">💬</div>
              <h2 className="text-lg font-bold mb-2">Your messages</h2>
              <p className="text-sm text-gray-500">
                Select a conversation or send a new message.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
