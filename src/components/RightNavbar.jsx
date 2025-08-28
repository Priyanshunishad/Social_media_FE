// src/components/Rightbar.jsx
import React from "react";
import { useAuth } from "../contexts/AuthContext";

function Rightbar() {
  const { getAllUsers, user } = useAuth();
  const [users, setAllUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
         console.log("Fetched users data:", data);
        if (data?.users) {
          setAllUsers(
            user
              ? data.users.filter((u) => u.id !== user.id) // exclude current user
              : data.users // if no logged in user, just show all
          );
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    // ✅ run only if getAllusers exists
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
        <span className="cursor-pointer text-blue-500 hover:underline">See all</span>
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
                  src={u.profilePic || "https://i.pravatar.cc/40"}
                  alt={u.username}
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-sm font-medium">{u.username}</span>
              </div>
              <button className="btn btn-xs btn-primary normal-case">Follow</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Rightbar;
