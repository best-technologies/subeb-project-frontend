"use client";

import React, { useState, useMemo } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createSchool, CreateSchoolPayload } from "@/services/api/schools";
import { useEnrollmentMetadata } from "@/services/hooks/useEnrollment";
import { capitalizeInitials } from "@/utils/formatters";
import { toast } from "react-hot-toast";
import {
  School,
  Building2,
  Phone,
  User,
  Calendar,
  Users,
  Loader2,
  GraduationCap,
  Sparkles,
} from "lucide-react";

// Strict schema matching DB fields and NestJS CreateSchoolDto
const formSchema = z.object({
  // Required fields
  name: z.string().trim().min(3, "School name must be at least 3 characters"),
  level: z.enum(["PRIMARY", "SECONDARY"], {
    message: "Please select a school level",
  }),
  lgaId: z.string().min(1, "Please select a Local Government Area"),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),

  // Optional fields
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    }),
  website: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        try {
          const url =
            val.startsWith("http://") || val.startsWith("https://")
              ? val
              : `https://${val}`;
          new URL(url);
          return true;
        } catch {
          return false;
        }
      },
      {
        message: "Please enter a valid website URL",
      }
    ),
  principalName: z.string().trim().optional(),
  principalPhone: z.string().trim().optional(),
  principalEmail: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: "Please enter a valid email address",
    }),
  establishedYear: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = Number(val);
        return !isNaN(num) && num >= 1800 && num <= new Date().getFullYear();
      },
      {
        message: `Year must be between 1800 and ${new Date().getFullYear()}`,
      }
    ),
  capacity: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Capacity must be a positive number",
      }
    ),
  totalStudents: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Students count cannot be negative",
      }
    ),
  totalTeachers: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Teachers count cannot be negative",
      }
    ),
});

type FormValues = z.infer<typeof formSchema>;

interface AddSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  lgas?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

type TabType = "basic" | "contact" | "facility";

export const AddSchoolDialog: React.FC<AddSchoolDialogProps> = ({
  isOpen,
  onClose,
  lgas = [],
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("basic");

  // Fallback LGA fetch if not passed from parent
  const { data: metadataData, loading: loadingMetadata } =
    useEnrollmentMetadata();
  const availableLgas = useMemo(() => {
    if (lgas && lgas.length > 0) return lgas;
    return metadataData?.localGovernments || [];
  }, [lgas, metadataData]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level: "PRIMARY",
      lgaId: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      principalName: "",
      principalPhone: "",
      principalEmail: "",
      establishedYear: "",
      capacity: "",
      totalStudents: "",
      totalTeachers: "",
    },
    shouldUnregister: false,
    mode: "onTouched",
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateSchoolPayload) => createSchool(payload),
    onSuccess: (res) => {
      toast.success(res?.message || "School created successfully!");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });
      form.reset();
      setActiveTab("basic");
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("Failed to create school:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create school. Please try again.";
      toast.error(errorMsg);
    },
  });

  const onSubmit = (values: FormValues) => {
    // Clean payload: omit empty optional fields so backend validators don't fail
    const payload: CreateSchoolPayload = {
      name: values.name.trim(),
      level: values.level,
      lgaId: values.lgaId,
      address: values.address.trim(),
    };

    if (values.phone?.trim()) payload.phone = values.phone.trim();
    if (values.email?.trim()) payload.email = values.email.trim();
    if (values.website?.trim()) payload.website = values.website.trim();
    if (values.principalName?.trim())
      payload.principalName = values.principalName.trim();
    if (values.principalPhone?.trim())
      payload.principalPhone = values.principalPhone.trim();
    if (values.principalEmail?.trim())
      payload.principalEmail = values.principalEmail.trim();
    if (values.establishedYear && String(values.establishedYear).trim())
      payload.establishedYear = Number(values.establishedYear);
    if (values.capacity && String(values.capacity).trim())
      payload.capacity = Number(values.capacity);
    if (values.totalStudents !== undefined && String(values.totalStudents).trim())
      payload.totalStudents = Number(values.totalStudents);
    if (values.totalTeachers !== undefined && String(values.totalTeachers).trim())
      payload.totalTeachers = Number(values.totalTeachers);

    createMutation.mutate(payload);
  };

  // Switch to the tab that contains validation errors
  const onError = (errors: FieldErrors<FormValues>) => {
    if (errors.name || errors.level || errors.lgaId || errors.address) {
      setActiveTab("basic");
      toast.error("Please fill in all required school details.");
    } else if (
      errors.phone ||
      errors.email ||
      errors.website ||
      errors.principalName ||
      errors.principalPhone ||
      errors.principalEmail
    ) {
      setActiveTab("contact");
      toast.error("Please review the contact & leadership fields.");
    } else {
      setActiveTab("facility");
      toast.error("Please review the capacity & metrics fields.");
    }
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      form.reset();
      setActiveTab("basic");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[620px] p-0 overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-800 p-6 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Add New School
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                  Abia State
                </span>
              </DialogTitle>
              <DialogDescription className="text-emerald-100/90 text-xs mt-1">
                Register a new primary or secondary school into the ASUBEB directory.
              </DialogDescription>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex gap-2 mt-5 bg-black/20 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "basic"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Basic Info</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-amber-400/30 text-amber-200 font-bold">
                Req
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "contact"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact & Leadership</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("facility")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "facility"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Capacity & Stats</span>
            </button>
          </div>
        </div>

        {/* Form Body and Footer */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
              {/* TAB 1: BASIC INFORMATION (REQUIRED) */}
              <div
                className={
                  activeTab === "basic"
                    ? "space-y-4 animate-in fade-in-50 duration-200"
                    : "hidden"
                }
              >
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Fields marked with <strong className="text-rose-600">*</strong> are required to generate the unique school code and register the institution.
                  </span>
                </div>

                {/* School Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        School Name <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Aba Model Primary School"
                          className="h-10 text-sm focus-visible:ring-brand-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Level & LGA Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* School Level */}
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          School Level <span className="text-rose-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PRIMARY">
                              Primary School
                            </SelectItem>
                            <SelectItem value="SECONDARY">
                              Secondary School
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Local Government Area */}
                  <FormField
                    control={form.control}
                    name="lgaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                          <span>
                            Local Government Area <span className="text-rose-500">*</span>
                          </span>
                          {loadingMetadata && (
                            <span className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" /> Loading
                            </span>
                          )}
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 text-sm">
                              <SelectValue placeholder="Select LGA" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-56">
                            {availableLgas.map((lga) => (
                              <SelectItem key={lga.id} value={lga.id}>
                                {capitalizeInitials(lga.name)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Physical Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Physical Address <span className="text-rose-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 12 School Road, Ogbor Hill, Aba"
                          className="h-10 text-sm focus-visible:ring-brand-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* TAB 2: CONTACT & LEADERSHIP (OPTIONAL) */}
              <div
                className={
                  activeTab === "contact"
                    ? "space-y-4 animate-in fade-in-50 duration-200"
                    : "hidden"
                }
              >
                <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-3 text-xs text-gray-600 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Optional contact information for the institution and the principal or head teacher.
                  </span>
                </div>

                {/* School Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          School Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. +234 801 234 5678"
                            className="h-10 text-sm focus-visible:ring-brand-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          School Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="e.g. info@school.edu.ng"
                            className="h-10 text-sm focus-visible:ring-brand-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Website */}
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        School Website URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. https://school.edu.ng"
                          className="h-10 text-sm focus-visible:ring-brand-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t border-gray-100 pt-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                    Principal / Head Teacher
                  </h4>

                  {/* Principal Name */}
                  <FormField
                    control={form.control}
                    name="principalName"
                    render={({ field }) => (
                      <FormItem className="mb-3">
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Principal's Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Dr. Ngozi Chukwu"
                            className="h-10 text-sm focus-visible:ring-brand-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Principal Phone & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="principalPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">
                            Principal Phone Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. +234 802 345 6789"
                              className="h-10 text-sm focus-visible:ring-brand-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="principalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-semibold text-gray-700">
                            Principal Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="e.g. principal@school.edu.ng"
                              className="h-10 text-sm focus-visible:ring-brand-primary"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* TAB 3: CAPACITY & STATS (OPTIONAL) */}
              <div
                className={
                  activeTab === "facility"
                    ? "space-y-4 animate-in fade-in-50 duration-200"
                    : "hidden"
                }
              >
                <div className="bg-gray-50 border border-gray-200/80 rounded-lg p-3 text-xs text-gray-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Optional institutional metrics and capacity records from the database schema.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Established Year */}
                  <FormField
                    control={form.control}
                    name="establishedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Year Established
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 1995"
                            min={1800}
                            max={new Date().getFullYear()}
                            className="h-10 text-sm focus-visible:ring-brand-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* School Capacity */}
                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Student Capacity
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="e.g. 600"
                            min={0}
                            className="h-10 text-sm focus-visible:ring-brand-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Initial Student Count */}
                  <FormField
                    control={form.control}
                    name="totalStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Initial Student Count
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0 (Defaults to 0)"
                            min={0}
                            className="h-10 text-sm focus-visible:ring-brand-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Initial Teacher Count */}
                  <FormField
                    control={form.control}
                    name="totalTeachers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Initial Teacher Count
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0 (Defaults to 0)"
                            min={0}
                            className="h-10 text-sm focus-visible:ring-brand-primary"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <DialogFooter className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between sm:justify-between shrink-0">
              <div className="flex items-center gap-2">
                {activeTab !== "basic" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setActiveTab(activeTab === "facility" ? "contact" : "basic")
                    }
                    className="text-xs h-9 px-3 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    Previous Section
                  </Button>
                ) : null}

                {activeTab !== "facility" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setActiveTab(activeTab === "basic" ? "contact" : "facility")
                    }
                    className="text-xs h-9 px-3 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  >
                    Next Section →
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClose}
                  disabled={createMutation.isPending}
                  className="text-xs h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="text-xs h-9 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <School className="w-3.5 h-3.5" />
                      <span>Add School</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddSchoolDialog;
