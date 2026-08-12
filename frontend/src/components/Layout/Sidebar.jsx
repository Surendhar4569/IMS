import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown, ChevronRight, X, ShieldAlert } from "lucide-react"; // Changed to ShieldAlert
import { menuItems } from "../../config/menuItems";

const Sidebar = ({ isOpen, onClose }) => {
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (id) => {
    setOpenMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <>
      {/* Mobile Overlay - z-30 matches header, placed below sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40
          h-screen w-72
          bg-slate-900 text-white
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
          <div className="flex items-center gap-3">
            {/* Platform Icon */}
            <ShieldAlert size={28} className="text-blue-400 shrink-0" /> 
            
            {/* Title and Tagline */}
            <div className="flex flex-col">
              <h1 className="text-lg font-bold tracking-wider leading-tight">
                IMS Platform
              </h1>
              <span className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Incident Management System
              </span>
            </div>
          </div>

          <button
            className="lg:hidden p-1 rounded hover:bg-slate-700 transition"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation - Scrollable if content overflows */}
        <nav className="flex-1 overflow-y-auto p-3 scrollbar-thin">
          {menuItems.map((menu) => {
            const Icon = menu.icon;

            // Normal Menu
            if (!menu.children) {
              return (
                <NavLink
                  key={menu.id}
                  to={menu.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 mb-1 transition-colors duration-200
                    ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "hover:bg-slate-800 text-slate-300"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span className="font-medium">{menu.label}</span>
                </NavLink>
              );
            }

            // Accordion Menu
            return (
              <div key={menu.id} className="mb-1">
                <button
                  onClick={() => toggleMenu(menu.id)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <span className="font-medium">{menu.label}</span>
                  </div>
                  <div className={`transform transition-transform duration-300 ${openMenus[menu.id] ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Accordion Children with smooth height transition */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openMenus[menu.id] ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="ml-8 mt-1 border-l border-slate-700 pl-3">
                    {menu.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `block rounded-md px-3 py-2 mb-1 text-sm transition-colors duration-200
                          ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "hover:bg-slate-800 text-slate-400 hover:text-white"
                          }`
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;