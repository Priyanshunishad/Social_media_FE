import React, { useEffect, useState, useCallback } from "react";
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
  const [error, setError] = useState(null);

  // Load user with stable dependencies
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      setLoadingUser(true);
      setError(null);

      try {
        if (userData) {
          if (isMounted) setUser(userData);
        } else if (authUser && (!username || authUser.username === username)) {
          if (isMounted) setUser(authUser);
        } else if (username) {
          const res = await fetchUserByUsername(username);
          if (isMounted) {
            if (res?.success && res.user) {
              setUser(res.user);
            } else {
              setError("User not found");
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user:", err);
        if (isMounted) {
          setError("Failed to load user profile");
          setUser(null);
        }
      } finally {
        if (isMounted) setLoadingUser(false);
      }
    };

    loadUser();

    return () => {
      isMounted = false;
    };
    // dependency list reduced to stable identifiers only
  }, [userData, authUser?.id, username]);

  // Fetch posts only when user.id changes
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const loadPosts = async () => {
      setLoadingPosts(true);
      try {
        const profilePosts = await fetchProfilePosts(user.id);
        if (isMounted) {
          if (profilePosts?.success && Array.isArray(profilePosts.posts)) {
            setPosts(profilePosts.posts);
          } else {
            setPosts([]);
          }
        }
      } catch (error) {
        console.error("Failed to load posts:", error);
        if (isMounted) setPosts([]);
      } finally {
        if (isMounted) setLoadingPosts(false);
      }
    };

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const followHandler = useCallback(() => {
    setFollowed((prev) => !prev);
    // API integration placeholder
  }, []);

  const handleEditClose = useCallback(() => {
    setShowEdit(false);
  }, []);

  const handleEditOpen = useCallback(() => {
    setShowEdit(true);
  }, []);

  // Skeleton loader for profile
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
      </div>
    );
  }

  // Error or absent user
  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">{error || "User not found"}</p>
      </div>
    );
  }

  const isOwnProfile = authUser?.id === user.id;
  const postCount = Array.isArray(posts) ? posts.length : 0;
  const followerCount = Array.isArray(user.followers) ? user.followers.length : 0;
  const followingCount = Array.isArray(user.following) ? user.following.length : 0;

  return (
    <div className="flex flex-col items-center w-full mt-6 px-3">
      <div className="flex w-full max-w-5xl flex-col md:flex-row items-center md:items-start gap-8">
        <div className="flex justify-center md:justify-start">
          <img
            src={user.profilePicture || "https://via.placeholder.com/180?text=No+Image"}
            alt={`${user.username || "User"} profile`}
            className="w-36 h-36 md:w-44 md:h-44 rounded-full object-cover border"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/180?text=No+Image";
            }}
          />
        </div>

        <div className="flex flex-col flex-1">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-2xl font-light">{user.username || "Unknown User"}</h2>

            {isOwnProfile && (
              <button
                className="px-3 py-1 text-sm border rounded-md hover:bg-gray-50 transition-colors"
                onClick={handleEditOpen}
                type="button"
              >
                Edit Profile
              </button>
            )}

            <button
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Settings"
              type="button"
            >
              <FiSettings className="text-2xl" />
            </button>

            {!isOwnProfile && authUser && (
              <button
                onClick={followHandler}
                className={`px-4 py-1 text-sm font-medium rounded-md transition-colors ${
                  followed
                    ? "bg-gray-200 text-black hover:bg-gray-300"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                type="button"
              >
                {followed ? "Unfollow" : "Follow"}
              </button>
            )}
          </div>

          <div className="flex gap-8 mt-4 text-sm">
            <span>
              <strong>{postCount}</strong> posts
            </span>
            <span>
              <strong>{followerCount}</strong> followers
            </span>
            <span>
              <strong>{followingCount}</strong> following
            </span>
          </div>

          <div className="mt-4">
            {(user.firstName || user.lastName) && (
              <p className="font-semibold capitalize">
                {user.firstName} {user.lastName}
              </p>
            )}
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
        ) : postCount > 0 ? (
          posts.map((post, index) => (
            <div key={post.id || post._id || `post-${index}`} className="aspect-square">
              <img
                src={post.image || "https://via.placeholder.com/400"}
                alt={`${user.username || "User"} post ${index + 1}`}
                className="w-full h-full object-cover hover:opacity-90 cursor-pointer transition-opacity"
                onError={(e) => {
                  e.currentTarget.src = "https://via.placeholder.com/400";
                }}
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center text-gray-500 py-10">No posts yet</div>
        )}
      </div>

      {showEdit && (
        <EditProfile
          isOpen={showEdit}
          onClose={handleEditClose}
          user={user}
          onUserUpdate={setUser}
        />
      )}
    </div>
  );
}

export default Profile;
