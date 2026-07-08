"use client";
import React from "react";
import {
  LayoutDashboard,
  Users,
  School,
  UserRoundPen,
  User,
  RefreshCw,
  UserRound,
  ClipboardList,
  LogOut,
  UserPlus,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { SchoolNameText } from "@/utils/truncateText";

interface BaseSidebarProps {
  onNavigate?: () => void;
}

interface AdminSidebarProps extends BaseSidebarProps {
  variant?: "admin";
  isOpen: boolean;
  onToggle: () => void;
  onRefresh?: () => void;
}

interface OfficerSidebarProps extends BaseSidebarProps {
  variant: "officer";
  isOpen: boolean;
  onToggle: () => void;
  onRefresh?: () => void;
}

interface SchoolItSidebarProps extends BaseSidebarProps {
  variant: "school-it";
  isOpen: boolean;
  onToggle: () => void;
  onRefresh?: () => void;
}

type SidebarProps = AdminSidebarProps | OfficerSidebarProps | SchoolItSidebarProps;

const Sidebar: React.FC<SidebarProps> = (props) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const variant = props.variant || "admin";

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  let navigationItems: Array<{ id: string; label: string; icon: React.ReactNode; href: string; disabled?: boolean }> = [];
  const { isOpen, onToggle, onRefresh, onNavigate } = props as SidebarProps;

  if (variant === "officer") {
    navigationItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        href: "/officer/dashboard",
      },
      {
        id: "results",
        label: "Results",
        icon: <ClipboardList size={20} />,
        href: "/officer/results",
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        icon: <ClipboardList size={20} />,
        href: "/officer/audit-logs",
      },
      {
        id: "profile",
        label: "My Profile",
        icon: <UserRound size={20} />,
        href: "/officer/profile",
      },
    ];
  } else if (variant === "school-it") {
    navigationItems = [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard size={20} />,
        href: "/school-it/dashboard",
      },
      {
        id: "students",
        label: "Students",
        icon: <Users size={20} />,
        href: "/school-it/students",
      },
      {
        id: "results",
        label: "Results",
        icon: <ClipboardList size={20} />,
        href: "/school-it/results",
      },
    ];
  } else {
    // Admin Sidebar
    navigationItems = [
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
        id: "enrol-student",
        label: "Enrol Student",
        icon: <UserPlus size={20} />,
        href: "/enrol-student",
        disabled: false,
      },
      {
        id: "officers",
        label: "Officers",
        icon: <UserRoundPen size={20} />,
        href: "/enrol-officer",
        disabled: false,
      },
      {
        id: "academic-settings",
        label: "Academic Settings",
        icon: <ClipboardList size={20} />,
        href: "/academic-settings",
        disabled: false,
      },
      {
        id: "profile",
        label: "Profile",
        icon: <User size={20} />,
        href: "/profile",
        disabled: false,
      },
      {
        id: "audit-logs",
        label: "Audit Logs",
        icon: <FileText size={20} />,
        href: "/audit-logs",
        disabled: false,
      },
    ];
  }

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
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center">
                      <span className="text-brand-secondary-contrast font-bold text-sm">
                        A
                      </span>
                    </div>
                    <span className="text-brand-primary-contrast font-bold text-lg">
                      ASUBEB
                    </span>
                  </div>

                  {/* Refresh Icon positioned next to logo */}
                  {onRefresh && (
                    <Button
                      onClick={onRefresh}
                      variant="ghost"
                      size="icon"
                      className="p-2 text-brand-primary-contrast/80 hover:text-brand-primary-contrast hover:bg-white/10 rounded-lg transition-all duration-200 group h-8 w-8"
                      title="Refresh all data"
                    >
                      <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                    </Button>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-brand-primary-contrast/70 text-sm">
                    Student Management System
                  </span>
                  {user?.role === "SCHOOL_IT" && user?.schoolName && (
                    <span className="text-brand-primary-contrast/90 text-xs font-semibold mt-0.5" title={user.schoolName}>
                      <SchoolNameText text={user.schoolName} />
                    </span>
                  )}
                </div>
              </div>

              {/* Mobile close button */}
              <button
                onClick={onToggle}
                className="lg:hidden text-brand-primary-contrast hover:text-brand-secondary p-2"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => onNavigate?.()}
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

          {/* Footer - Logout Button */}
          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-brand-primary-contrast/80 hover:bg-red-500 hover:text-white w-full cursor-pointer"
            >
              <span className="text-lg">
                <LogOut size={20} />
              </span>
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
