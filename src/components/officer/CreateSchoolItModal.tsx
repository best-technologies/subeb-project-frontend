"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateSchoolIt,
  useExamOfficerSchools,
} from "@/services/hooks/useExamOfficer";
import {
  CheckCircle,
  Copy,
  Check,
  Laptop,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export interface SchoolOption {
  id: string;
  name: string;
  code: string;
  level: string;
  lgaId: string;
  lgaName: string;
  studentCount: number;
  assignedIt?: {
    id: string;
    name: string;
    schoolItId: string;
    email: string;
  } | null;
  hasAssignedIt: boolean;
}

const createSchoolItSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .regex(/^[0-9+\s-]{7,15}$/, "Please enter a valid phone number"),
  schoolId: z.string().min(1, "Please select an assigned school"),
  profilePicture: z.string().optional(),
});

type CreateSchoolItFormValues = z.infer<typeof createSchoolItSchema>;

interface CreateSchoolItModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface CreatedCredentials {
  fullName: string;
  email: string;
  schoolItId: string;
  tempPassword?: string;
  schoolName: string;
}

export default function CreateSchoolItModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateSchoolItModalProps) {
  const { data: schools = [], isLoading: loadingSchools } = useExamOfficerSchools();
  const createMutation = useCreateSchoolIt();
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const form = useForm<CreateSchoolItFormValues>({
    resolver: zodResolver(createSchoolItSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      schoolId: "",
      profilePicture: "",
    },
  });

  const handleModalClose = () => {
    form.reset();
    setCreatedCredentials(null);
    setCopied(false);
    onClose();
  };

  const onSubmit = async (values: CreateSchoolItFormValues) => {
    try {
      const result = await createMutation.mutateAsync({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
        schoolId: values.schoolId,
        profilePicture: values.profilePicture || undefined,
      });

      const typedSchools = schools as SchoolOption[];
      const selectedSchool = typedSchools.find((s: SchoolOption) => s.id === values.schoolId);

      setCreatedCredentials({
        fullName: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email.trim().toLowerCase(),
        schoolItId: result.schoolItId,
        tempPassword: result.tempPassword,
        schoolName: selectedSchool?.name || result.school?.name || "Assigned School",
      });

      form.reset();
      onSuccess?.();
    } catch {
      // Error handled by hook toast
    }
  };

  const handleCopyCredentials = () => {
    if (!createdCredentials) return;
    const text = `School IT Portal Credentials:\nFull Name: ${createdCredentials.fullName}\nSIT ID: ${createdCredentials.schoolItId}\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.tempPassword || "Sent to email"}\nAssigned School: ${createdCredentials.schoolName}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-white border border-gray-100 shadow-xl">
        {createdCredentials ? (
          /* Success Screen with Generated Credentials */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4 shadow-xs">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Personnel Created Successfully!
              </h2>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                The School IT officer has been registered and permanently attached to your LGA officer profile.
              </p>
            </div>

            {/* Credentials Card */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 sm:p-5 space-y-3.5">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5">
                <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
                  Login Credentials
                </span>
                <span className="text-xs bg-emerald-200/60 text-emerald-900 font-medium px-2 py-0.5 rounded-md">
                  Role: School IT
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-500 block">Personnel Name</span>
                  <span className="font-semibold text-gray-900 text-sm">
                    {createdCredentials.fullName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">School-IT ID</span>
                  <span className="font-mono font-bold text-emerald-800 text-sm">
                    {createdCredentials.schoolItId}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Email Address</span>
                  <span className="font-medium text-gray-900 truncate block">
                    {createdCredentials.email}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Assigned School</span>
                  <span className="font-medium text-gray-900 truncate block">
                    {createdCredentials.schoolName}
                  </span>
                </div>
              </div>

              {createdCredentials.tempPassword && (
                <div className="bg-white rounded-lg p-3 border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-gray-500 block">
                      Temporary Password
                    </span>
                    <span className="font-mono text-base font-bold text-gray-900 tracking-wider">
                      {createdCredentials.tempPassword}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCredentials}
                    className="flex items-center gap-1.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3.5 flex items-start gap-3 text-xs text-blue-900">
              <Mail className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">Notification Sent</p>
                <p className="text-blue-700/90 mt-0.5">
                  An automated email containing these credentials and portal instructions has been dispatched to{" "}
                  <strong>{createdCredentials.email}</strong>.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyCredentials}
                className="w-1/2 flex items-center justify-center gap-2"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                <span>{copied ? "Copied" : "Copy Details"}</span>
              </Button>
              <Button
                type="button"
                onClick={handleModalClose}
                className="w-1/2 bg-brand-primary text-white hover:bg-brand-primary/90"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* Creation Form */
          <>
            <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                    Add School IT Personnel
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500 mt-0.5">
                    Assign a dedicated IT officer to a school in your LGA jurisdiction.
                  </DialogDescription>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                {/* Name Fields (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          First Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                            <Input
                              placeholder="e.g. Chinedu"
                              className="pl-9 text-sm rounded-xl border-gray-200 focus:border-brand-primary"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Last Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                            <Input
                              placeholder="e.g. Okafor"
                              className="pl-9 text-sm rounded-xl border-gray-200 focus:border-brand-primary"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Contact Fields (2 Columns) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Email Address <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                            <Input
                              type="email"
                              placeholder="e.g. chinedu@example.com"
                              className="pl-9 text-sm rounded-xl border-gray-200 focus:border-brand-primary"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Phone Number <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                            <Input
                              placeholder="e.g. 08012345678"
                              className="pl-9 text-sm rounded-xl border-gray-200 focus:border-brand-primary"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[11px]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Assigned School (Dropdown from Officer's LGA(s)) */}
                <FormField
                  control={form.control}
                  name="schoolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Assigned School (LGA Jurisdiction) <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          disabled={loadingSchools}
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-full text-sm rounded-xl border-gray-200 focus:border-brand-primary">
                            <SelectValue
                              placeholder={
                                loadingSchools
                                  ? "Loading schools in your LGA..."
                                  : "Select a school to assign"
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="max-h-60 rounded-xl">
                            {(schools as SchoolOption[]).map((school: SchoolOption) => (
                              <SelectItem key={school.id} value={school.id} className="text-xs">
                                <div className="flex items-center justify-between gap-3 w-full">
                                  <span className="font-medium text-gray-900">{school.name}</span>
                                  <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                                    {school.code} • {school.level}
                                  </span>
                                  {school.hasAssignedIt && (
                                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                                      Has IT
                                    </span>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Only schools within your assigned LGA(s) are listed.
                      </p>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                {/* Notice Box */}
                <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    <strong>Permanent Attribution:</strong> You will be attached as the creator of this personnel. If administrative LGA reassignments occur, the personnel creation and audit trail will remain linked.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleModalClose}
                    disabled={createMutation.isPending}
                    className="rounded-xl text-xs font-medium px-4 py-2"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl text-xs font-semibold px-5 py-2 shadow-xs flex items-center gap-2"
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Personnel...</span>
                      </>
                    ) : (
                      <>
                        <Laptop className="w-4 h-4" />
                        <span>Create School IT</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
