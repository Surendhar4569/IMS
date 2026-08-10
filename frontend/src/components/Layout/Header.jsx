import React from "react";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm h-18 w-full">
      <div className="flex items-center justify-between h-full px-4 sm:px-6">
        
        {/* Left Side: Mobile Menu */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-md hover:bg-gray-100 transition"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
        </div>

        {/* Right Side: Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* User Info - Hidden on smaller screens */}
          <div className="hidden md:block text-right">
            <p className="font-semibold text-gray-800 text-sm leading-tight">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 leading-tight">
              {user?.role || "Role"}
            </p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold uppercase text-sm shrink-0">
            {user?.name?.charAt(0) || "U"}
          </div>

          {/* Subtle Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-md hover:bg-red-50 text-gray-500 hover:text-red-600 transition"
            title="Logout"
          >
            <LogOut size={18} />
          </button>

        </div>
      </div>
    </header>
  );
};

export default Header;