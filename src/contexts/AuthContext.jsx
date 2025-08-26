import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api"; // axios instance

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in (via cookie session)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user"); // GET /api/v1/user/
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);


  // Signup
  const signup = async (signupInput) => {
   const res= await api.post("/user/signup", signupInput); // POST /api/v1/user/signup
    // Optionally, auto-login after signup
    return res.data
  };

  // Login
  const login = async (loginInput) => {
    const res = await api.post("/user/login", loginInput); // POST /api/v1/user/login
    setUser(res.data);
    return res.data;

  };

  // Logout
  const logout = async () => {
  const res=  await api.post("/user/logout"); // POST /api/v1/user/logout
    setUser(null);
    return res.data
  };


  const createPost=async(fromData)=>{
    const res=await api.post('/post',fromData)
    return res.data
  }
  const fetchFeed=async()=>{
    const res= await api.get('/post/feed')
    return res.data
  }
  const getComments=async(postId)=>{
    const res= await api.get(`/post/comments/${postId}`)
    return res.data
  }
  const commentsOnPost=async(postId,comment)=>{
    const res= await api.post(`/post/comment/${postId}`,{text:comment})  
    return res.data
  }

  const addReply=async(commentId,reply)=>{
    const res= await api.post(`/post/reply-on-comment/${commentId}`,{text:reply})
    return res.data 
  }

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
        fetchFeed,
        getComments,
        commentsOnPost,
        addReply
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
// const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// } 