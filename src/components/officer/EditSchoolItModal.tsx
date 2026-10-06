"use client";

import React, { useEffect } from "react";
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
  useUpdateSchoolIt,
  useExamOfficerSchools,
} from "@/services/hooks/useExamOfficer";
import {
  Laptop,
  Phone,
  User,
  Loader2,
} from "lucide-react";
import { SchoolItRecord, SchoolOption } from "@/app/officer/school-it/page";

const editSchoolItSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 digits")
    .regex(/^[0-9+\s-]{7,15}$/, "Please enter a valid phone number"),
  schoolId: z.string().min(1, "Please select an assigned school"),
  isActive: z.boolean(),
});

type EditSchoolItFormValues = z.infer<typeof editSchoolItSchema>;

interface EditSchoolItModalProps {
  isOpen: boolean;
  onClose: () => void;
  personnel: SchoolItRecord | null;
  onSuccess?: () => void;
}

export default function EditSchoolItModal({
  isOpen,
  onClose,
  personnel,
  onSuccess,
}: EditSchoolItModalProps) {
  const { data: schools = [], isLoading: loadingSchools } = useExamOfficerSchools();
  const updateMutation = useUpdateSchoolIt();

  const form = useForm<EditSchoolItFormValues>({
    resolver: zodResolver(editSchoolItSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      schoolId: "",
      isActive: true,
    },
  });

  useEffect(() => {
    if (personnel) {
      form.reset({
        firstName: personnel.firstName || "",
        lastName: personnel.lastName || "",
        phone: personnel.phone || "",
        schoolId: personnel.school?.id || "",
        isActive: personnel.isActive ?? true,
      });
    }
  }, [personnel, form]);

  const onSubmit = async (values: EditSchoolItFormValues) => {
    if (!personnel) return;
    try {
      await updateMutation.mutateAsync({
        id: personnel.id,
        data: {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phone: values.phone.trim(),
          schoolId: values.schoolId,
          isActive: values.isActive,
        },
      });

      onSuccess?.();
      onClose();
    } catch {
      // Handled by hook toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-white border border-gray-100 shadow-xl">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                Edit School IT Personnel
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                Update officer details or reassign school in your LGA.
              </DialogDescription>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Email (Read-only) */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">
                Email Address (Login Identity)
              </label>
              <div className="px-3.5 py-2 text-sm bg-gray-100 rounded-xl text-gray-700 font-medium">
                {personnel?.email || "-"}
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-gray-700">First Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                        <Input className="pl-9 text-sm rounded-xl border-gray-200" {...field} />
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
                    <FormLabel className="text-xs font-semibold text-gray-700">Last Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                        <Input className="pl-9 text-sm rounded-xl border-gray-200" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700">Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                      <Input className="pl-9 text-sm rounded-xl border-gray-200" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* School Assignment */}
            <FormField
              control={form.control}
              name="schoolId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-gray-700">
                    Assigned School (LGA Jurisdiction)
                  </FormLabel>
                  <FormControl>
                    <Select
                      disabled={loadingSchools}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full text-sm rounded-xl border-gray-200">
                        <SelectValue placeholder="Select assigned school" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl">
                        {(schools as SchoolOption[]).map((school: SchoolOption) => (
                          <SelectItem key={school.id} value={school.id} className="text-xs">
                            <span className="font-medium text-gray-900">{school.name}</span>
                            <span className="text-gray-500 text-[10px] ml-2">({school.code})</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-[11px]" />
                </FormItem>
              )}
            />

            {/* Status Field */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 bg-gray-50/50">
                  <div>
                    <FormLabel className="text-xs font-semibold text-gray-900 block">
                      Account Status
                    </FormLabel>
                    <span className="text-[11px] text-gray-500">
                      {field.value
                        ? "Active — personnel can log in and submit results"
                        : "Inactive — access temporarily restricted"}
                    </span>
                  </div>
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="rounded-xl text-xs font-medium px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-brand-primary text-white hover:bg-brand-primary/90 rounded-xl text-xs font-semibold px-5 py-2 shadow-xs flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
