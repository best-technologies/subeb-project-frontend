"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isRouteActive } from "@/utils/navigation";
import { cn } from "@/lib/utils";

export interface SidebarNavItemProps {
  id?: string;
  href: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  aliases?: string[];
  exact?: boolean;
  /**
   * Optional manual override for active state.
   * If omitted, active state is automatically determined using the current pathname.
   */
  isActive?: boolean;
  onNavigate?: () => void;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

/**
 * Reusable utility component for Sidebar navigation items.
 *
 * Automatically keeps parent navigation items highlighted when users navigate
 * to child or details pages (e.g., /officer/results/[schoolId] highlights /officer/results,
 * /students/[id] highlights /students, /school-it/results/[studentId] highlights /school-it/results).
 */
export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  href,
  label,
  icon,
  disabled = false,
  aliases,
  exact,
  isActive: manualIsActive,
  onNavigate,
  className,
  activeClassName,
  inactiveClassName,
}) => {
  const pathname = usePathname();

  const active =
    manualIsActive !== undefined
      ? manualIsActive
      : isRouteActive(pathname, href, { exact, aliases });

  const defaultActiveClasses =
    "bg-brand-secondary text-brand-secondary-contrast shadow-lg";
  const defaultInactiveClasses =
    "text-brand-primary-contrast/80 hover:bg-brand-secondary hover:text-brand-secondary-contrast";

  return (
    <li>
      <Link
        href={href}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          onNavigate?.();
        }}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
          active
            ? activeClassName || defaultActiveClasses
            : inactiveClassName || defaultInactiveClasses,
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className
        )}
      >
        <span className="text-lg">{icon}</span>
        <span className="font-medium">{label}</span>
        {disabled && (
          <span className="ml-auto text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
            Soon
          </span>
        )}
      </Link>
    </li>
  );
};

export const SidebarLink = SidebarNavItem;
export default SidebarNavItem;
