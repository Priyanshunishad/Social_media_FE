import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router";
// import { useAuth } from "../../contexts/AuthContext";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();
  const [signupInput, setSignupInput] = useState({
    email: "",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const { signup } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const registerHandler = async (e) => {
  e.preventDefault();
  try {
    const res = await signup(signupInput);
    console.log(res);

    if (res && res.success) {
      toast.success(res.message);
      navigate("/login");
    } else {
      // If backend sends a message, show it
      toast.error(res?.message || "Signup failed. Please try again.");
    }
  } catch (err) {
    console.error(err);
    // If backend returns an error response (e.g. 400, 500)
    toast.error(err?.response?.data?.message || "Something went wrong.");
  }
};

  return (
    <div className="flex w-full min-h-screen items-center justify-center bg-gray-50">
      <div className="flex w-full max-w-md shadow-lg bg-white rounded-lg p-8">
        <div className="flex flex-col w-full">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <span className="font-['Dancing_Script',cursive] text-5xl font-bold text-gray-800">
              instagram
            </span>
          </div>

          {/* Signup Form */}
          <form
            onSubmit={registerHandler}
            className="flex flex-col gap-4 w-full"
          >
            <input
              name="firstName"
              value={signupInput.firstName}
              onChange={handleChange}
              placeholder="First Name"
              type="text"
              required
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="lastName"
              value={signupInput.lastName}
              onChange={handleChange}
              placeholder="Last Name"
              type="text"
              required
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="email"
              value={signupInput.email}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              required
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="username"
              value={signupInput.username}
              onChange={handleChange}
              placeholder="Username"
              type="text"
              required
              className="w-full h-11 px-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              name="password"
              value={signupInput.password}
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
              Sign Up
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-sm text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Footer */}
          <div className="text-center text-sm">
            <span>Have an account?</span>
            <Link
              to="/login"
              className="ml-1 text-blue-500 font-medium hover:underline"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
