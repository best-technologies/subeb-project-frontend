"use client";

import React, { useState, useMemo } from "react";
import { useOfficers } from "@/services/hooks/useOfficers";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, Edit2 } from "lucide-react";
import AddOfficerForm from "@/components/officers/AddOfficerForm";
import EditOfficerModal from "@/components/officers/EditOfficerModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { capitalizeWords } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OfficerAvatarProps {
  user?: {
    firstName?: string;
    lastName?: string;
    profilePicture?: string;
  };
}

function OfficerAvatar({ user }: OfficerAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "O";
  const hasPicture = Boolean(user?.profilePicture && user.profilePicture.trim() !== "" && !imgError);

  if (hasPicture) {
    return (
      <img
        className="h-10 w-10 rounded-full object-cover border border-gray-100 shadow-xs"
        src={user!.profilePicture}
        alt={`${user?.firstName || ""} ${user?.lastName || ""}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-sm">
      {initials}
    </div>
  );
}

export default function OfficersPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error } = useOfficers(page, 10, searchQuery);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);

  const officers = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.meta)
    ? data.meta
    : Array.isArray((data as any)?.officers)
    ? (data as any).officers
    : [];

  const rawPagination =
    (data?.meta as any)?.pagination ||
    (data?.data as any)?.pagination ||
    (data as any)?.pagination;

  const total = rawPagination?.total ?? officers.length;
  const totalPages = rawPagination?.totalPages ?? Math.ceil(total / 10) ?? 1;

  // Filter officers client-side as well for instant feedback
  const filteredOfficers = useMemo(() => {
    if (!searchQuery.trim()) return officers;
    const q = searchQuery.toLowerCase().trim();
    return officers.filter((o: any) => {
      const fullName = `${o.user?.firstName || ""} ${o.user?.lastName || ""}`.toLowerCase();
      const email = (o.user?.email || "").toLowerCase();
      const phone = (o.phone || "").toLowerCase();
      const lgaName = (o.lga?.name || "").toLowerCase();
      return (
        fullName.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        lgaName.includes(q)
      );
    });
  }, [officers, searchQuery]);

  const handleEditClick = (officer: any) => {
    setSelectedOfficer({
      id: officer.id,
      firstName: officer.user?.firstName || "",
      lastName: officer.user?.lastName || "",
      email: officer.user?.email || "",
      phone: officer.phone || "",
      lgaId: officer.lgaId || "",
      profilePicture: officer.user?.profilePicture || "",
    });
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Officers</h1>
          <p className="text-gray-600">Manage SUBEB exam officers</p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-brand-primary text-white hover:bg-brand-primary/90 font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors cursor-pointer"
        >
          <Plus size={18} />
          <span>Add Officer</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email, or LGA..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary transition-colors bg-white text-gray-900 placeholder:text-gray-400"
            />
          </div>
          <div className="text-sm text-gray-500">
            Total: <span className="font-semibold text-gray-900">{total}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-brand-accent-background">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  LGA
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    Loading officers...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-red-500">
                    Failed to load officers
                  </td>
                </tr>
              ) : filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    {searchQuery ? "No matching officers found" : "No officers found"}
                  </td>
                </tr>
              ) : (
                filteredOfficers.map((officer: any) => (
                  <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-10 w-10">
                          <OfficerAvatar user={officer.user} />
                        </div>
                        <div className="font-medium text-gray-900 capitalize">
                          {officer.user?.firstName} {officer.user?.lastName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {officer.user?.email || officer.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {officer.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {officer.lga ? capitalizeWords(officer.lga.name) : "Unassigned"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(officer)}>
                            <Edit2 className="mr-2 h-4 w-4" />
                            <span>Edit Officer</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            Showing <span className="font-semibold text-gray-900">{total > 0 ? (page - 1) * 10 + 1 : 0}</span> to{" "}
            <span className="font-semibold text-gray-900">{Math.min(page * 10, total)}</span> of{" "}
            <span className="font-semibold text-gray-900">{total}</span> officers
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="text-xs"
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      page === pNum
                        ? "bg-brand-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="text-xs"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Add Officer Dialog (ShadCN-based) */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Enrol New Officer</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Fill in the details below to enrol a new SUBEB exam officer.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <AddOfficerForm onSuccess={() => setIsAddModalOpen(false)} />
          </div>
        </DialogContent>
      </Dialog>

      <EditOfficerModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        officer={selectedOfficer}
        onSuccess={() => setIsEditModalOpen(false)}
      />
    </div>
  );
}
