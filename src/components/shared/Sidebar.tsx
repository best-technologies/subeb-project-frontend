"use client";
import React from "react";
import {
  LayoutDashboard,
  Users,
  School,
  UserRoundPen,
  User,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onRefresh?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onRefresh }) => {
  const pathname = usePathname();

  const navigationItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      href: "/dashboard",
      disabled: false,
    },
    {
      id: "students",
      label: "Students",
      icon: <Users size={20} />,
      href: "/students",
      disabled: false,
    },
    {
      id: "schools",
      label: "Schools",
      icon: <School size={20} />,
      href: "/schools",
      disabled: false,
    },
    {
      id: "enrol-officer",
      label: "Enrol Officer",
      icon: <UserRoundPen size={20} />,
      href: "/enrol-officer",
      disabled: false,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-primary text-brand-primary-contrast border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        lg:transform-none
      `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center">
                    <span className="text-brand-secondary-contrast font-bold text-sm">
                      A
                    </span>
                  </div>
                  <span className="text-brand-primary-contrast font-bold text-lg">
                    ASUBEB
                  </span>
                </div>
                <span className="text-brand-primary-contrast/70 text-sm">
                  School Management System
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Refresh Icon */}
                {onRefresh && (
                  <button
                    onClick={onRefresh}
                    className="p-2 text-brand-primary-contrast/80 hover:text-brand-primary-contrast hover:bg-white/10 rounded-lg transition-all duration-200 group"
                    title="Refresh all data"
                  >
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </button>
                )}

                {/* Mobile close button */}
                <button
                  onClick={onToggle}
                  className="lg:hidden text-brand-primary-contrast hover:text-brand-secondary p-2"
                >
                  <span className="text-xl">✕</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                      ${
                        pathname === item.href
                          ? "bg-brand-secondary text-brand-secondary-contrast shadow-lg"
                          : "text-brand-primary-contrast/80 hover:bg-brand-secondary hover:text-brand-secondary-contrast"
                      }
                      ${
                        item.disabled
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }
                    `}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                    {item.disabled && (
                      <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                        Soon
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/profile"
              className={`
                flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  pathname === "/profile"
                    ? "bg-brand-secondary text-brand-secondary-contrast shadow-lg"
                    : "text-brand-primary-contrast/80 hover:bg-brand-secondary hover:text-brand-secondary-contrast"
                }
                cursor-pointer
              `}
            >
              <span className="text-lg">
                <User size={20} />
              </span>
              <span className="font-medium">Profile</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
