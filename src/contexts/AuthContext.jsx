import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api"; // axios instance

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Check if user is already logged in (run only once)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user");
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []); // ✅ empty deps → no infinite loop

  const fetchUserByUsername = async (username) => {
    const res = await api.get(`/user/${username}`);
    return res.data;
  };

  const signup = async (signupInput) => {
    const res = await api.post("/user/signup", signupInput);
    return res.data;
  };

  const login = async (loginInput) => {
    const res = await api.post("/user/login", loginInput);
    setUser(res.data);
    return res.data;
  };

  const logout = async () => {
    const res = await api.post("/user/logout");
    setUser(null);
    return res.data;
  };

  const createPost = async (formData) => {
    const res = await api.post("/post", formData);
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

  const fetchFeed = async () => {
    const res = await api.get("/post/feed");
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

  const fetchProfilePosts = async () => {
    const res = await api.get(`/post`);
    return res.data;
  };
  const searchUsers = async (query) => {
    try {
      const res = await api.get(`/user/search?query=${query}`);
      return res.data; // backend returns { success, count, data }
    } catch (err) {
      console.error("Search API error:", err);
      return { success: false, data: [] };
    }
  };
<<<<<<< HEAD

  const getAllUsers = async () => {
    try {
      const res = await api.get("/user/users");
      console.log("Get All Users response:", res.data);
      return res.data; // backend returns { success, users }
    } catch (err) {
      console.error("Get All Users API error:", err);
      return { success: false, users: [] };
    }
  };
=======
  const deletePost =async (postId)=>{
    const res=await api.delete(`post/${postId}`)
    return res.data
  }
>>>>>>> vishal
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signup,
        login,
        logout,
        createPost,
        setUser,
        deletePost,
        fetchFeed,
        getComments,
        commentsOnPost,
        addReply,
        fetchProfilePosts,
        fetchUserByUsername,
        updateProfile,
        searchUsers,
        getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
