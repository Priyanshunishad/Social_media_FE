import React, { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { useParams } from "react-router-dom";
import EditProfile from "./EditProfile";

function Profile({ userData }) {
  const { username } = useParams();
  const { user: authUser, fetchProfilePosts, fetchUserByUsername } = useAuth();

  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // 🔹 Load user either from props, authUser, or by username in URL
  useEffect(() => {
    const loadUser = async () => {
      setLoadingUser(true);
      try {
        if (userData) {
          setUser(userData);
        } else if (authUser && (!username || authUser.username === username)) {
          setUser(authUser);
        } else if (username) {
          const res = await fetchUserByUsername(username);
          if (res?.success) setUser(res.user);
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, [userData, authUser, username]);

  // 🔹 Fetch posts when user is available
  useEffect(() => {
    const loadPosts = async () => {
      if (!user) return;
      try {
        const profilePosts = await fetchProfilePosts(user.id);
        console.log("profilePosts", profilePosts);
        if (profilePosts.success) setPosts(profilePosts.posts);

      } catch (error) {
        console.error("Failed to load posts:", error);
      }
    };
    loadPosts();
  }, [user]);

  const followHandler = () => {
    setFollowed((prev) => !prev);
  };

  // 🔹 Skeleton UI while loading user
  if (loadingUser) {
    return (
      <div className="flex flex-col items-center w-full mt-6 px-3 animate-pulse">
        <div className="flex w-full max-w-5xl flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-36 h-36 md:w-44 md:h-44 rounded-full bg-gray-300" />
          <div className="flex flex-col flex-1 gap-4">
            <div className="h-6 w-32 bg-gray-300 rounded" />
            <div className="flex gap-8">
              <div className="h-4 w-12 bg-gray-300 rounded" />
              <div className="h-4 w-16 bg-gray-300 rounded" />
              <div className="h-4 w-16 bg-gray-300 rounded" />
            </div>
            <div className="h-4 w-48 bg-gray-300 rounded" />
          </div>
        </div>
        <div className="w-full max-w-5xl border-t mt-8"></div>
        <div className="w-full max-w-5xl grid grid-cols-3 gap-1 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-300" />
          ))}
        </div>
      </div>
    );
  }

  // 🔹 If user still not found
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  // 🔹 Main UI when user is loaded
  return (
    <div className="flex flex-col items-center w-full mt-6 px-3">
      <div className="flex w-full max-w-5xl flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex justify-center md:justify-start">
          <img
            src={
              user.profilePicture ||
              "https://via.placeholder.com/180?text=No+Image"
            }
            alt={`${user.username} profile`}
            className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border"
          />
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-light">{user.username}</h2>
          
            {authUser?.id === user.id && (
              <button
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                onClick={() => setShowEdit(true)}
              >
                Edit Profile
              </button>
            )}
            <EditProfile isOpen={showEdit} onClose={() => setShowEdit(false)} />
            <FiSettings className="text-2xl cursor-pointer" />
            {authUser?.id !== user.id && (
              <button
                onClick={followHandler}
                className={`px-4 py-1 text-sm font-medium rounded-md transition ${
                  followed
                    ? "bg-gray-200 text-black hover:bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {followed ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <div className="flex gap-8 mt-4 text-sm">
            <span>
              <strong>{posts.length}</strong> posts
            </span>
            <span>
              <strong>{user.followers?.length || 0}</strong> followers
            </span>
            <span>
              <strong>{user.following?.length || 0}</strong> following
            </span>
          </div>

          <div className="mt-4">
            <p className="font-semibold capitalize">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-700 max-w-md">
              {user.bio || "No bio available"}
            </p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-5xl border-t mt-8"></div>

      <div className="w-full max-w-5xl grid grid-cols-3 gap-1 mt-6">
        {loadingPosts ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-300 animate-pulse" />
          ))
        ) : posts.length > 0 ? (
          posts.map((p) => (
            <div key={p.id || p._id} className="aspect-square">
              <img
                src={p.image || "https://via.placeholder.com/400"}
                alt="post"
                className="w-full h-full object-cover hover:opacity-90 cursor-pointer"
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-10">
            No posts yet
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
