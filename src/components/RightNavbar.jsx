// src/components/Rightbar.jsx
import React from "react";

function Rightbar() {
  // 🔹 Dummy followings list (pure frontend)
  const followings = [
    { id: 1, username: "john_doe", profilePic: "https://i.pravatar.cc/40?img=1" },
    { id: 2, username: "emma_watson", profilePic: "https://i.pravatar.cc/40?img=2" },
    { id: 3, username: "mike_tyson", profilePic: "https://i.pravatar.cc/40?img=3" },
    { id: 4, username: "sara_connor", profilePic: "https://i.pravatar.cc/40?img=4" },
    { id: 5, username: "tony_stark", profilePic: "https://i.pravatar.cc/40?img=5" },
  ];

  return (
    <div className="w-[300px] sticky top-[60px] h-screen overflow-y-auto p-4 hidden md:block">
      {/* Header */}
      <div className="flex justify-between text-sm font-semibold text-gray-600">
        <span>Suggestions for you</span>
        <span className="cursor-pointer text-blue-500 hover:underline">See all</span>
      </div>

      {/* Followings */}
      <h3 className="mt-4 text-base font-bold">Followings</h3>
      <ul className="mt-3 space-y-3">
        {followings.map((user) => (
          <li
            key={user.id}
            className="flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <img
                src={user.profilePic}
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <span className="text-sm font-medium">{user.username}</span>
            </div>
            <button className="btn btn-xs btn-primary normal-case">Follow</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Rightbar;
