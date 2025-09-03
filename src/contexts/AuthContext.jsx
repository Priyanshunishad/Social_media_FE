import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api"; // axios instance

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // logged in user
  const [loading, setLoading] = useState(true); // to show spinner until auth check finishes

  // ✅ Check if a user session exists when app loads
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user"); // backend: return { user }
        setUser(res.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ==========================
  // 🔹 USER FUNCTIONS
  // ==========================
  const signup = async (signupInput) => {
    const res = await api.post("/user/signup", signupInput);
    return res.data;
  };

  const login = async (loginInput) => {
    const res = await api.post("/user/login", loginInput);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    const res = await api.post("/user/logout");
    setUser(null);
    return res.data;
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put(`/user/editProfile`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || "Error" };
    }
  };

  const fetchUserByUsername = async (username) => {
    const res = await api.get(`/user/${username}`);
    return res.data;
  };

  const searchUsers = async (query) => {
    try {
      const res = await api.get(`/user/search?query=${query}`);
      return res.data;
    } catch {
      return { success: false, data: [] };
    }
  };

  const getAllUsers = async () => {
    try {
      const res = await api.get("/user/users");
      return res.data;
    } catch {
      return { success: false, users: [] };
    }
  };

  const followUser = async (userId) => {
    const res = await api.post(`/user/follow/${userId}`);
    return res.data;
  };

  // ==========================
  // 🔹 POST & COMMENT FUNCTIONS
  // ==========================
  const createPost = async (formData) => {
    const res = await api.post("/post", formData);
    return res.data;
  };

  const fetchFeed = async () => {
    const res = await api.get("/post/feed");
    return res.data;
  };

  const deletePost = async (postId) => {
    const res = await api.delete(`/post/${postId}`);
    return res.data;
  };

  const fetchProfilePosts = async () => {
    const res = await api.get(`/post`);
    return res.data;
  };

  const getComments = async (postId) => {
    const res = await api.get(`/post/comments/${postId}`);
    return res.data;
  };

  const commentsOnPost = async (postId, comment) => {
    const res = await api.post(`/post/comment/${postId}`, { text: comment });
    return res.data;
  };

  const addReply = async (commentId, reply) => {
    const res = await api.post(`/post/reply-on-comment/${commentId}`, { text: reply });
    return res.data;
  };

  // ==========================
  // 🔹 CHAT FUNCTIONS
  // ==========================
  const fetchChat = async (receiverId) => {
    const res = await api.get(`/chat/fetch/${receiverId}`);
    return res.data;
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get("/chat/fetch");
      return res.data;
    } catch {
      return { success: false, chats: [] };
    }
  };
// ==========================
// 🔹 ADMIN FUNCTIONS
// ==========================

// Auth (Both Admin & Super Admin)
const loginAdmin = async (input) => {
  const res = await api.post("/admin/login", input);
  return res.data;
};

// ==========================
// 🔹 Admin Functions
// ==========================
const fetchAdminUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

const fetchAdmins = async () => {
  const res = await api.get("/admin/admins");
  return res.data;
};

const requestUserDeletion = async (id, reason) => {
  const res = await api.post(`/admin/request-user-deletion/${id}`, { reason });
  return res.data;
};

const getAllPostsForAdmin = async () => {
  const res = await api.get("/admin/posts");
  return res.data;
};

const requestPostDeletion = async (postId, reason) => {
  const res = await api.post(`/admin/request-post-deletion/${postId}`, { reason });
  return res.data;
};

// ==========================
// 🔹 Super Admin Functions
// ==========================
const createAdmin = async (data) => {
  const res = await api.post("/admin/create-admin", data);
  return res.data;
};

const editAdmin = async (id, data) => {
  const res = await api.put(`/admin/edit-admin/${id}`, data);
  return res.data;
};

const deleteUser = async (id) => {
  const res = await api.delete(`/admin/delete-user/${id}`);
  return res.data;
};

const getPendingUserDeletions = async () => {
  const res = await api.get("/admin/pending-user-deletions");
  return res.data;
};

const handleUserDeletion = async (requestId, action) => {
  const res = await api.patch(`/admin/handle-user-deletion/${requestId}`, { action: action.toUpperCase() });
  return res.data;
};

const getPendingPostDeletions = async () => {
  const res = await api.get("/admin/pending-post-deletions");
  return res.data;
};

const handlePostDeletion = async (requestId, action) => {
  const res = await api.patch(`/admin/handle-post-deletion/${requestId}`, { action: action.toUpperCase()});
  return res.data;
};

  
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        setUser,

        // User
        signup,
        login,
        logout,
        updateProfile,
        fetchUserByUsername,
        searchUsers,
        getAllUsers,
        followUser,

        // Post
        createPost,
        fetchFeed,
        deletePost,
        fetchProfilePosts,
        getComments,
        commentsOnPost,
        addReply,

        // Chat
        fetchChat,
        fetchHistory,

        // Admin
        loginAdmin,
        fetchAdminUsers,
        fetchAdmins,

        deleteUser,
        createAdmin,
        handlePostDeletion,
        getAllPostsForAdmin,
        getPendingPostDeletions,
        requestPostDeletion,
        handleUserDeletion,
        getPendingUserDeletions,
        editAdmin,
        requestUserDeletion

      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

