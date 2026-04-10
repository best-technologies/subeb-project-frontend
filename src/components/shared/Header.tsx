"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Youtube,
  Menu,
  X,
  LayoutDashboard,
  PenSquare,
  UserRound,
  ChevronDown,
  ClipboardList,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import VideoModal from "@/components/shared/VideoModal";

export default function Header() {
  const { user, isAuthenticated } = useAuthStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Wait for auth store to hydrate to prevent flickering
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Get role-based dropdown menu items
  const getDropdownItems = () => {
    if (!user) return [];

    const normalizedRole = user.role.toLowerCase();
    if (normalizedRole === "super_admin") {
      return [
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="w-4 h-4" />,
        },
        {
          label: "Profile",
          href: "/profile",
          icon: <User className="w-4 h-4" />,
        },
      ];
    } else if (normalizedRole === "subeb_officer") {
      return [
        {
          label: "Enter Grades",
          href: "/enter-grades",
          icon: <PenSquare className="w-4 h-4" />,
        },
        {
          label: "Profile",
          href: `/${user.id}/profile`,
          icon: <User className="w-4 h-4" />,
        },
        {
          label: "Grade Record",
          href: `/${user.id}/grade-record`,
          icon: <ClipboardList className="w-4 h-4" />,
        },
      ];
    }

    return [];
  };

  const dropdownItems = getDropdownItems();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when screen is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isMobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white border-b border-gray-200" : "bg-transparent"
      }`}
    >
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isScrolled ? "" : "lg:pt-4"
        }`}
      >
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-gray-900">SUBEB</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthLoading ? (
              <>
                {/* Loading skeleton for buttons */}
                <div className="w-40 h-[51px] bg-gray-200 animate-pulse rounded-full" />
                <div className="w-48 h-[51px] bg-gray-200 animate-pulse rounded-full" />
              </>
            ) : !isAuthenticated ? (
              <>
                <Button
                  variant="outline"
                  className="!rounded-full border-brand-green-accent text-brand-green hover:bg-gray-50 h-[51px] gap-[10px]"
                  onClick={() => setIsVideoModalOpen(true)}
                >
                  <Youtube className="w-4 h-4" />
                  <span>Watch a Demo</span>
                </Button>
                <Link href="/login">
                  <Button className="!rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-[51px] gap-[10px]">
                    <span>Get Started - It&apos;s free</span>
                  </Button>
                </Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center">
                    <UserRound className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-gray-700 font-medium max-w-[200px] truncate">
                    {user?.email}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {dropdownItems.map((item, index) => (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setIsDropdownOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        {item.icon}
                        <span className="text-gray-700 font-medium">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden z-[70] relative p-2 text-gray-900"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Slide-in */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-[60] lg:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col p-8 pt-24 space-y-6">
          {isAuthLoading ? (
            <>
              {/* Loading skeleton for mobile menu */}
              <div className="w-full h-[51px] bg-gray-200 animate-pulse rounded-full" />
              <div className="w-full h-[51px] bg-gray-200 animate-pulse rounded-full" />
            </>
          ) : !isAuthenticated ? (
            <>
              <Button
                variant="outline"
                className="w-full !rounded-full border-brand-green-accent text-brand-green hover:bg-gray-50 h-[51px] gap-[10px] justify-center"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsVideoModalOpen(true);
                }}
              >
                <Youtube className="w-4 h-4" />
                <span>Watch a Demo</span>
              </Button>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full !rounded-full bg-brand-green hover:bg-brand-green/90 text-white h-[51px] gap-[10px] justify-center">
                  <span>Get Started - It&apos;s free</span>
                </Button>
              </Link>
            </>
          ) : (
            <>
              {/* User Info */}
              <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-brand-green rounded-full flex items-center justify-center">
                  <UserRound className="w-5 h-5 text-white" />
                </div>
                <span className="text-gray-700 font-medium text-sm truncate">
                  {user?.email}
                </span>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                {dropdownItems.map((item, index) => (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {item.icon}
                    <span className="text-gray-700 font-medium">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </header>
  );
}
