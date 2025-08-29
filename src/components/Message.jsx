// src/pages/Message.jsx
import React, { useState } from "react";
import LeftNavbar from "../components/LeftNavbar";

const Message = () => {
  const chats = [
    {
      id: 1,
      name: "Priya Sharma",
      lastMsg: "Hey! What's up?",
      time: "2h",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: 2,
      name: "Rahul Verma",
      lastMsg: "See you tomorrow ✌",
      time: "1d",
      avatar: "https://randomuser.me/api/portraits/men/65.jpg",
    },
    {
      id: 3,
      name: "Ananya Singh",
      lastMsg: "Check this out 🔥",
      time: "3d",
      avatar: "https://randomuser.me/api/portraits/women/55.jpg",
    },
  ];

  const [selectedChat, setSelectedChat] = useState(null);
  const [activeTab, setActiveTab] = useState("Primary");
  const tabs = ["Primary", "General", "Channels", "Requests"];

  return (
    <div className="flex h-screen bg-white">
      {/* ✅ Left Sidebar */}
      <LeftNavbar />

      {/* ✅ Main Messages Section */}
      <div className="flex flex-1">
        {/* Left Column (Chat List) */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b font-bold text-lg text-left">
            __priyanshu__
          </div>

          {/* Tabs */}
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-3 py-2 text-sm font-medium text-center ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {tab}
                {tab === "Requests" && (
                  <span className="ml-1 text-xs">(1)</span>
                )}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="p-3 border-b">
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-full">
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>

          {/* Chat List */}
          <div className="flex-1 overflow-y-auto">
            <ul>
              {chats.map((chat) => (
                <li
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                    selectedChat?.id === chat.id ? "bg-gray-200" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={chat.avatar}
                      alt={chat.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-sm">{chat.name}</p>
                      <p className="text-xs text-gray-500">{chat.lastMsg}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{chat.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column (Chat Window / Placeholder) */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="border-b p-4 flex items-center gap-3">
                <img
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-semibold">{selectedChat.name}</span>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                <div className="self-start bg-gray-200 px-3 py-2 rounded-2xl w-fit">
                  Hey! How are you?
                </div>
                <div className="self-end bg-blue-500 text-white px-3 py-2 rounded-2xl w-fit">
                  I'm good! You?
                </div>
              </div>

              {/* Input Box */}
              <div className="border-t p-3 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Message..."
                  className="flex-1 border rounded-full px-3 py-2 text-sm focus:outline-none"
                />
                <button className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 text-sm">
                  Send
                </button>
              </div>
            </>
          ) : (
            // Empty State Placeholder
            <div className="flex flex-col items-center justify-center flex-1 text-center">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-bold">Your messages</h2>
              <p className="text-sm text-gray-500">
                Send private messages to your friends.
              </p>
              <button className="mt-4 bg-blue-500 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-600">
                Send message
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
