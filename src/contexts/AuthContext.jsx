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
  const loginAdmin = async (credentials) => {
    const res = await api.post("/admin/login", credentials);
    return res.data;
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await api.get("/admin");
      return res.data;
    } catch {
      return { success: false, users: [] };
    }
  };

  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admin/admins");
      return res.data;
    } catch {
      return { success: false, admins: [] };
    }
  };

  const deleteUser = async (userId) => {
    try {
      const res = await api.delete(`/admin/${userId}`);
      return res.data;
    } catch {
      return { success: false };
    }
  };

  const createAdmin = async (adminData) => {
    try {
      const res = await api.post("/admin/create-admin", adminData);
      return res.data;
    } catch {
      return { success: false };
    }
  };

  // ==========================
  // 🔹 CONTEXT VALUE
  // ==========================
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};











// import { createContext, useContext, useState, useEffect } from "react";
// import { api } from "../api"; // axios instance

// const AuthContext = createContext();
// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // ✅ Check if user is already logged in (run only once)
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         const res = await api.get("/user");
//         setUser(res.data.user);
//       } catch (error) {
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchUser();
//   }, []); // ✅ empty deps → no infinite loop

//   const fetchUserByUsername = async (username) => {
//     const res = await api.get(`/user/${username}`);
//     return res.data;
//   };

//   const signup = async (signupInput) => {
//     const res = await api.post("/user/signup", signupInput);
//     return res.data;
//   };

//   const login = async (loginInput) => {
//     const res = await api.post("/user/login", loginInput);
//     setUser(res.data);
//     return res.data;
//   };

//   const logout = async () => {
//     const res = await api.post("/user/logout");
//     setUser(null);
//     return res.data;
//   };

//   const createPost = async (formData) => {
//     const res = await api.post("/post", formData);
//     return res.data;
//   };

//   const updateProfile = async (formData) => {
//     try {
//       const res = await api.put(`/user/editProfile`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (res.data.success) {
//         setUser(res.data.user);
//         return { success: true, user: res.data.user };
//       }
//       return { success: false, message: res.data.message };
//     } catch (err) {
//       return {
//         success: false,
//         message: err?.response?.data?.message || "Error",
//       };
//     }
//   };

//   const fetchFeed = async () => {
//     const res = await api.get("/post/feed");
//     return res.data;
//   };

//   const getComments = async (postId) => {
//     const res = await api.get(`/post/comments/${postId}`);
//     return res.data;
//   };

//   const commentsOnPost = async (postId, comment) => {
//     const res = await api.post(`/post/comment/${postId}`, { text: comment });
//     return res.data;
//   };

//   const addReply = async (commentId, reply) => {
//     const res = await api.post(`/post/reply-on-comment/${commentId}`, {
//       text: reply,
//     });
//     return res.data;
//   };

//   const fetchProfilePosts = async () => {
//     const res = await api.get(`/post`);
//     return res.data;
//   };
//   const searchUsers = async (query) => {
//     try {
//       const res = await api.get(`/user/search?query=${query}`);
//       return res.data; // backend returns { success, count, data }
//     } catch (err) {
//       console.error("Search API error:", err);
//       return { success: false, data: [] };
//     }
//   };

//   const getAllUsers = async () => {
//     try {
//       const res = await api.get("/user/users");
//       console.log("Get All Users response:", res.data);
//       return res.data; // backend returns { success, users }
//     } catch (err) {
//       console.error("Get All Users API error:", err);
//       return { success: false, users: [] };
//     }
//   };

//   const deletePost = async (postId) => {
//     const res = await api.delete(`post/${postId}`);
//     return res.data;
//   };

//   const followUser = async (userId) => {
//     const res = await api.post(`/user/follow/${userId}`);
//     return res.data;
//   };

//   const fetchChat = async (recieverId) => {
//     const res = await api.get(`/chat/fetch/${recieverId}`);
//     return res.data; 
//   };
//  const fetchHistory = async () => {
//   try {
//     const res = await api.get("chat/fetch"); // fetch all chat history
//     return res.data; // ✅ return the response so Message.jsx can use it
//   } catch (err) {
//     console.error("Error fetching chat history:", err);
//     return { success: false, chats: [] };
//   }
// };


//   // ===================
//   // 🔹 ADMIN FUNCTIONS
//   // ===================
//   const loginAdmin = async (credentials) => {
//     const res = await api.post("/admin/login", credentials);
//     return res.data; // backend returns token + success message
//   };

//   const fetchAdminUsers = async () => {
//     try {
//       const res = await api.get("/admin");
//       return res.data; // { success, users }
//     } catch (err) {
//       console.error("fetchAdminUsers error:", err);
//       return { success: false, users: [] };
//     }
//   };

//   const fetchAdmins = async () => {
//     try {
//       const res = await api.get("/admin/admins");
//       return res.data; // { success, admins }
//     } catch (err) {
//       console.error("fetchAdmins error:", err);
//       return { success: false, admins: [] };
//     }
//   };

//   const deleteUser = async (userId) => {
//     try {
//       const res = await api.delete(`/admin/${userId}`);
//       return res.data;
//     } catch (err) {
//       console.error("deleteUser error:", err);
//       return { success: false };
//     }
//   };

//   const createAdmin = async (adminData) => {
//     try {
//       const res = await api.post("/admin/create-admin", adminData);
//       return res.data;
//     } catch (err) {
//       console.error("createAdmin error:", err);
//       return { success: false };
//     }
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         signup,
//         login,
//         logout,
//         fetchChat,
//         fetchHistory,
//         createPost,
//         setUser,
//         deletePost,
//         fetchFeed,
//         getComments,
//         commentsOnPost,
//         addReply,
//         fetchProfilePosts,
//         fetchUserByUsername,
//         updateProfile,
//         searchUsers,
//         getAllUsers,
//         followUser,
//         // Admin
//         loginAdmin,
//         fetchAdminUsers,  
//         fetchAdmins,
//         deleteUser,
//         createAdmin,

//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };
