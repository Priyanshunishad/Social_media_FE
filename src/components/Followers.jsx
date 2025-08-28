// src/components/Followers.jsx
import React from "react";

function Followers({ followers, onClose }) {
  // Dummy users if no followers provided
  

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-lg w-[400px] max-h-[500px] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold">Followers</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            ❌
          </button>
        </div>

        {/* Followers List */}
        <div className="divide-y">
          {followers.map((follower, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3">
              <img
                src={
                    follower.profilePicture ||
                    `https://ui-avatars.com/api/?name=${follower.username}`
                  }
                alt={follower.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{follower.username}</p>
                <p className="text-sm text-gray-500">{follower.name || ""}</p>
              </div>
              <button className="ml-auto px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Followers;
