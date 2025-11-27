"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  UserRound,
  ChevronDown,
  Menu,
  X,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";
import Link from "next/link";

export default function PageHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigate to user profile
  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/${user.id}/profile`);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push("/login");
  };

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className="border-b border-gray-200 pb-4 pt-4 bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo - Left */}
          <div className="flex items-center gap-2">
            <span className="text-brand-green font-bold text-lg">SUBEB</span>
          </div>

          {/* User Profile - Desktop Only (hidden on mobile/tablet) */}
          <div
            className="hidden lg:flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            onClick={handleProfileClick}
          >
            <div className="w-[30px] h-[30px] bg-brand-green rounded-full flex items-center justify-center">
              <UserRound className="w-4 h-4 text-white" />
            </div>
            {user?.email ? (
              <span className="text-gray-700 font-medium">{user.email}</span>
            ) : (
              <span className="text-red-600 font-medium text-sm">
                Error loading user
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>

          {/* Mobile Menu Icon (visible on mobile/tablet) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-in (from right) */}
      <div
        className={`
          fixed top-0 right-0 h-full w-64 sm:w-80 bg-white shadow-xl z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-brand-green font-bold text-lg">SUBEB</span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-[40px] h-[40px] bg-brand-green rounded-full flex items-center justify-center">
                <UserRound className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col overflow-hidden">
                {user?.email ? (
                  <span
                    className="text-gray-700 font-medium text-sm truncate"
                    title={user.email}
                  >
                    {user.email.length > 12 ? (
                      <>
                        <span className="sm:hidden">
                          {user.email.slice(0, 12)}...
                        </span>
                        <span className="hidden sm:inline">
                          {user.email.length > 20
                            ? `${user.email.slice(0, 20)}...`
                            : user.email}
                        </span>
                      </>
                    ) : (
                      user.email
                    )}
                  </span>
                ) : (
                  <span className="text-red-600 font-medium text-sm">
                    Error loading user
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {user?.id && (
                <>
                  <li>
                    <Link
                      href={`/${user.id}/profile`}
                      onClick={handleMenuItemClick}
                      className={`flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                        pathname === `/${user.id}/profile`
                          ? "bg-[#F5FAF8] text-brand-green border-l-4 border-brand-green rounded-r-lg"
                          : "text-gray-700 hover:bg-gray-100 rounded-lg"
                      }`}
                    >
                      <UserRound size={20} />
                      <span className="font-medium">My Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/${user.id}/grade-record`}
                      onClick={handleMenuItemClick}
                      className={`flex items-center space-x-3 px-4 py-3 transition-all duration-200 ${
                        pathname === `/${user.id}/grade-record`
                          ? "bg-[#F5FAF8] text-brand-green border-l-4 border-brand-green rounded-r-lg"
                          : "text-gray-700 hover:bg-gray-100 rounded-lg"
                      }`}
                    >
                      <ClipboardList size={20} />
                      <span className="font-medium">Grade Record</span>
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 w-full transition-all duration-200"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
