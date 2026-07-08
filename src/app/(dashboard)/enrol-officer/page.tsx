"use client";

import React, { useState } from "react";
import { useOfficers } from "@/services/hooks/useOfficers";
import { Button } from "@/components/ui/Button";
import { Plus, Search, MoreVertical, Edit2 } from "lucide-react";
import AddOfficerForm from "@/components/officers/AddOfficerForm";
import EditOfficerModal from "@/components/officers/EditOfficerModal";
import { Dialog } from "@/components/ui/custom-dialog";
import { capitalizeWords } from "@/utils/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OfficersPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useOfficers(page, 10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState<any>(null);

  const officers = (data?.meta as { id: string; user: { firstName: string; lastName: string; email: string }; phone: string; lgaId?: string; lga?: { name: string } }[]) || [];
  const pagination = (data?.data as { pagination?: { total?: number; totalPages?: number } })?.pagination;
  const total = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 1;

  const handleEditClick = (officer: any) => {
    setSelectedOfficer({
      id: officer.id,
      firstName: officer.user.firstName,
      lastName: officer.user.lastName,
      email: officer.user.email,
      lgaId: officer.lgaId || "",
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
          className="flex items-center gap-2 bg-brand-primary text-white"
        >
          <Plus size={20} />
          <span>Add Officer</span>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search officers..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-brand-primary"
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
              ) : officers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                    No officers found
                  </td>
                </tr>
              ) : (
                officers.map((officer: any) => (
                  <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {officer.user.firstName} {officer.user.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {officer.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {officer.phone}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <div className="p-6">
          <h2 className="sr-only">Enrol New Officer</h2>
          <div className="mt-4">
            <AddOfficerForm onSuccess={() => setIsAddModalOpen(false)} />
          </div>
        </div>
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
