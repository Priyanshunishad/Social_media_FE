// src/components/FollowingModal.jsx
import React from "react";

function Following({ following , onClose }) {
    
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      {/* Modal Box */}
      <div className="bg-white rounded-xl shadow-lg w-[400px] max-h-[500px] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b p-4">
          <h2 className="text-lg font-semibold">Following</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Following List */}
        <div className="divide-y">
          {following.map((user, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3">
              <img
                 src={
                    user.profilePicture ||
                    `https://ui-avatars.com/api/?name=${user.username}`
                  }
                alt={user.username}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">{user.name || ""}</p>
              </div>
              <button className="ml-auto px-3 py-1 border rounded-lg text-sm font-medium hover:bg-gray-100">
                Following
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Following;
