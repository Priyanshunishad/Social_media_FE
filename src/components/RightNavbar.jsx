// src/components/Rightbar.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiMessageCircle } from "react-icons/fi"; // message icon

function Rightbar() {
  const { getAllUsers, user, followUser } = useAuth();
  const [users, setAllUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [following, setFollowing] = React.useState([]);

  const handleFollow = async (userId) => {
    try {
      await followUser(userId);
      setFollowing((prev) => [...prev, userId]);
    } catch (err) {
      console.error("Follow failed:", err);
    }
  };

  // ✅ Handle message click → redirect to /message with user
  const handleMessage = (targetUser) => {
    const chatUser = {
      id: targetUser.id,
      username: targetUser.username,
      firstName: targetUser.firstName || "",
      lastName: targetUser.lastName || "",
      name:
        `${targetUser.firstName || ""} ${targetUser.lastName || ""}`.trim() ||
        targetUser.username,
      avatar:
        targetUser.profilePicture ||
        `https://ui-avatars.com/api/?name=${targetUser.username}&size=128&background=random&color=fff`,
    };

    localStorage.setItem("selectedChatUser", JSON.stringify(chatUser));
    window.location.href = "/message"; // redirect
  };

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        if (data?.users) {
          setAllUsers(
            user ? data.users.filter((u) => u.id !== user.id) : data.users
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (getAllUsers) {
      fetchUsers();
      const interval = setInterval(fetchUsers, 10000);
      return () => clearInterval(interval);
    }
  }, [getAllUsers, user?.id]);

  return (
    <div className="w-[300px] sticky top-[60px] h-screen overflow-y-auto p-4 hidden md:block">
      {/* Header */}
      <div className="flex justify-between text-sm font-semibold text-gray-600">
        <span>Suggestions for you</span>
        <span className="cursor-pointer text-blue-500 hover:underline">
          See all
        </span>
      </div>

      {/* Followings */}
      <h3 className="mt-4 text-base font-bold">Followings</h3>
      {loading ? (
        <p className="mt-3 text-sm text-gray-500">Loading users...</p>
      ) : users.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No users found</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={
                    u.profilePicture ||
                    `https://ui-avatars.com/api/?name=${u.username}`
                  }
                  alt={u.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-sm font-medium">{u.username}</span>
              </div>

              <div className="flex items-center gap-2">
                {following.includes(u.id) ? (
                  <button
                    className="btn btn-xs bg-gray-300 text-gray-700 cursor-default"
                    disabled
                  >
                    Following
                  </button>
                ) : (
                  <button
                    className="btn btn-xs btn-primary normal-case"
                    onClick={() => handleFollow(u.id)}
                  >
                    Follow
                  </button>
                )}

                {/* ✅ Message icon */}
                <button
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => handleMessage(u)}
                  title="Send Message"
                >
                  <FiMessageCircle size={18} className="text-blue-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Rightbar;
