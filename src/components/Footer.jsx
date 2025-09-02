import React from "react";
import { NavLink } from "react-router-dom";
import {
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineCompass,
} from "react-icons/ai";
import { FiPlusSquare } from "react-icons/fi";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const Footer = () => {
  const {user}=useAuth()
  return (
    <div className="fixed md:hidden block  bottom-0 left-0 w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-lg z-50">
      <div className="flex justify-around items-center py-2 text-white text-2xl">
        {/* Home */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `transition-transform transform hover:scale-125 ${
              isActive ? "text-yellow-300 drop-shadow-md" : "text-white/80"
            }`
          }
        >
          <AiOutlineHome />
        </NavLink>

        {/* Search */}
        <NavLink
          to="/search"
          className={({ isActive }) =>
            `transition-transform transform hover:scale-125 ${
              isActive ? "text-yellow-300 drop-shadow-md" : "text-white/80"
            }`
          }
        >
          <AiOutlineSearch />
        </NavLink>

        {/* Create */}
        <NavLink
          to="/create-post"
          className={({ isActive }) =>
            `text-3xl bg-white text-pink-600 p-2 rounded-full shadow-lg transition hover:rotate-12 hover:scale-110 ${
              isActive ? "ring-2 ring-yellow-300" : ""
            }`
          }
        >
          <FiPlusSquare />
        </NavLink>

        {/* Explore */}
        <NavLink
          to="/explore"
          className={({ isActive }) =>
            `transition-transform transform hover:scale-125 ${
              isActive ? "text-yellow-300 drop-shadow-md" : "text-white/80"
            }`
          }
        >
          <AiOutlineCompass />
        </NavLink>

        {/* Profile */}
        <NavLink
          to={`/profile/${user?.username}`}
          className={({ isActive }) =>
            `transition-transform transform hover:scale-125 ${
              isActive ? "text-yellow-300 drop-shadow-md" : "text-white/80"
            }`
          }
        >
          <FaRegUserCircle />
        </NavLink>
      </div>
    </div>
  );
};

export default Footer;
