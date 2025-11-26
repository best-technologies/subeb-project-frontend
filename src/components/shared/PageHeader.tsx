"use client";

import { useRouter } from "next/navigation";
import { UserRound, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export default function PageHeader() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Navigate to user profile
  const handleProfileClick = () => {
    if (user?.id) {
      router.push(`/${user.id}/profile`);
    }
  };

  return (
    <div className="border-b border-gray-200 pb-4 pt-4 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo - Left */}
        <div className="flex items-center gap-2">
          {/* <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center">
            <span className="text-brand-secondary-contrast font-bold text-sm">
              A
            </span>
          </div> */}
          <span className="text-brand-green font-bold text-lg">SUBEB</span>
        </div>

        {/* User Profile - Right */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
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
      </div>
    </div>
  );
}
