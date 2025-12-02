"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/shared/Sidebar";
import PageHeader from "@/components/shared/PageHeader";
import { SimpleFooter } from "@/components/shared/Footer";
import { useAuthStore } from "@/store/authStore";

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const userId = params.id as string;
  const [isValidating, setIsValidating] = useState(true);
  const { user, isAuthenticated } = useAuthStore();

  // Validate role on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      const normalizedRole = user.role.toLowerCase();

      // Only SUBEB_OFFICER can access officer routes
      if (normalizedRole !== "subeb_officer") {
        // Redirect SUPER_ADMIN to their default page
        router.replace("/dashboard");
        return;
      }
    }

    setIsValidating(false);
  }, [isAuthenticated, user, router]);

  // Determine active item based on pathname
  const activeItem = pathname.includes("/profile")
    ? ("profile" as const)
    : ("grade-record" as const);

  // Show loading state while validating role
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - Full Width */}
      <PageHeader />

      {/* Sidebar and Content - Flex grow */}
      <div className="flex flex-1">
        <Sidebar variant="officer" activeItem={activeItem} userId={userId} />
        <div className="flex-1 w-full lg:w-auto">{children}</div>
      </div>

      {/* Footer - Full Width */}
      <SimpleFooter />
    </div>
  );
}
