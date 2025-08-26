import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import toast from 'react-hot-toast'
// import { useAuth } from "../../contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const [show1, setShow1] = useState(1);
  const { login } = useAuth();


  // image slider logic
  useEffect(() => {
    const interval = setInterval(() => {
      setShow1((prev) => (prev < 4 ? prev + 1 : 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // form state
  const [logInInput, setLogInInput] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLogInInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handlerLoginForm = async (e) => {
  e.preventDefault();
  try {
    const res = await login(logInInput);

    if (res && res.success) {
      toast.success(res.message || "Login successful!");
      navigate(`/profile/${res.user?.username || ""}`);
    } else {
      toast.error(res?.message || "Invalid credentials. Please try again.");
    }
  } catch (err) {
    console.error(err);
    toast.error(err?.response?.data?.message || "Something went wrong during login.");
  }
};


  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-5xl shadow-lg bg-white rounded-lg overflow-hidden">
        {/* LEFT SIDE IMAGE SLIDER */}
        <div
          className="hidden md:flex flex-1 relative min-h-[600px] min-w-[400px] bg-no-repeat bg-right bg-cover"
          style={{ backgroundImage: "url('/image/loginpage.png')" }}
        >
          <div className="absolute top-7 right-[59px] w-[250px] h-[500px] overflow-hidden">
            {["1", "2", "3", "4"].map((num) => (
              <img
                key={num}
                src={`/image/loginpage${num}.png`}
                alt=""
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  show1 === parseInt(num) ? "opacity-100 z-10" : "opacity-0"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT SIDE LOGIN FORM */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-sm">
            {/* Logo */}
            <div className="flex justify-center my-6">
              <span className="font-['Dancing_Script',cursive] text-5xl font-bold text-gray-800">
                instagram
              </span>
            </div>

            {/* Login Form */}
            <form
              onSubmit={handlerLoginForm}
              className="flex flex-col gap-4"
            >
              <input
                name="username"
                value={logInInput.username}
                onChange={handleChange}
                placeholder="Username"
                type="text"
                required
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <input
                name="password"
                value={logInInput.password}
                onChange={handleChange}
                placeholder="Password"
                type="password"
                required
                minLength="6"
                className="w-full h-11 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="submit"
                className="w-full h-11 mt-2 bg-blue-500 text-white rounded-md font-medium hover:bg-blue-600 transition"
              >
                Log In
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gray-300" />
              <span className="px-3 text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-300" />
            </div>

            {/* Signup link */}
            <div className="text-center text-sm">
              <span>Don&apos;t have an account?</span>
              <span
                className="ml-1 text-blue-500 font-medium cursor-pointer hover:underline"
                onClick={() => navigate("/signup")}
              >
                Sign up
              </span>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
