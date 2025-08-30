// src/components/LeftNavbar.js
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiSearch,
  FiCompass,
  FiPlusCircle,
  FiUser,
  FiLogOut,
  FiMessageCircle,  // ✅ message icon
} from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";

const LeftNavbar = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  // ✅ navItems aligned with Instagram style
  const navItems = [
    { label: "Home", icon: <FiHome />, link: "/" },
    { label: "Search", icon: <FiSearch />, link: "/search" },
    { label: "Explore", icon: <FiCompass />, link: "/explore" },
    { label: "Messages", icon: <FiMessageCircle />, link: "/message" }, // ✅ New Messages tab
    { label: "Add Post", icon: <FiPlusCircle />, link: "/create-post" },
    { label: "Profile", icon: <FiUser />, link: `/profile/${user?.username}` },
  ];

  return (
    <div
      className={`relative top-0 left-0 h-[80vh] bg-white border-r border-gray-200 
      p-6 w-64 md:flex flex-col justify-between hidden 
      transform transition-transform duration-300 z-50
      ${open ? "translate-x-0" : "-translate-x-full"} 
      md:translate-x-0`}
    >
      {/* Header */}
      <div>
        <div className="flex justify-between items-center mb-10">
          <span className="text-2xl font-bold font-serif text-blue-600">
            Trending Talks
          </span>
          <button
            className="md:hidden text-2xl"
            onClick={() => setOpen((prev) => !prev)}
          >
            ☰
          </button>
        </div>

        {/* Nav List */}
        <ul className="space-y-4">
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.link}
                className={({ isActive }) =>
                  `flex items-center gap-x-4 py-3 px-3 rounded-xl transition 
                  ${
                    isActive
                      ? "bg-blue-100 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-lg">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-x-3 py-3 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
      >
        <FiLogOut className="text-xl" />
        Logout
      </button>
    </div>
  );
};

export default LeftNavbar;
