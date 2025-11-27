"use client";

import { useParams, usePathname } from "next/navigation";
import Sidebar from "@/components/shared/Sidebar";
import PageHeader from "@/components/shared/PageHeader";
import { SimpleFooter } from "@/components/shared/Footer";

export default function OfficerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const userId = params.id as string;

  // Determine active item based on pathname
  const activeItem = pathname.includes("/profile")
    ? ("profile" as const)
    : ("grade-record" as const);

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
