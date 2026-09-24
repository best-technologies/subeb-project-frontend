"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import {
  updateSchool,
  UpdateSchoolPayload,
  getSchoolById,
} from "@/services/api/schools";
import { SchoolDirectoryItem } from "@/services/types/schoolsDirectoryResponse";
import { useEnrollmentMetadata } from "@/services/hooks/useEnrollment";
import { capitalizeInitials } from "@/utils/formatters";
import { toast } from "react-hot-toast";
import {
  Building2,
  Phone,
  User,
  Calendar,
  Users,
  Loader2,
  GraduationCap,
  Sparkles,
  Save,
  Pencil,
} from "lucide-react";

const formSchema = z.object({
  name: z.string().trim().min(3, "School name must be at least 3 characters"),
  level: z.enum(["PRIMARY", "SECONDARY"], {
    message: "Please select a school level",
  }),
  lgaId: z.string().min(1, "Please select a Local Government Area"),
  address: z.string().trim().min(5, "Address must be at least 5 characters"),
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

interface EditSchoolSheetProps {
  school: SchoolDirectoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  lgas?: Array<{ id: string; name: string }>;
  onSuccess?: () => void;
}

type TabType = "basic" | "contact" | "facility";

export const EditSchoolSheet: React.FC<EditSchoolSheetProps> = ({
  school,
  isOpen,
  onClose,
  lgas = [],
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const { data: metadataData } = useEnrollmentMetadata();
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

  // When school changes or sheet opens, populate initial values
  useEffect(() => {
    if (isOpen && school) {
      form.reset({
        name: school.name || "",
        level: (school.level as "PRIMARY" | "SECONDARY") || "PRIMARY",
        lgaId: school.lga?.id || "",
        address: school.address || "",
        phone: school.phone || "",
        email: school.email || "",
        website: "",
        principalName: school.principalName || "",
        principalPhone: "",
        principalEmail: "",
        establishedYear: school.establishedYear ? String(school.establishedYear) : "",
        capacity: school.capacity ? String(school.capacity) : "",
        totalStudents: school.totalStudents !== undefined ? String(school.totalStudents) : "",
        totalTeachers: "",
      });
      setActiveTab("basic");

      // Fetch fresh details from backend to ensure website, principal phone/email are populated
      setIsLoadingDetails(true);
      getSchoolById(school.id)
        .then((res) => {
          if (res?.data) {
            const d = res.data;
            form.reset({
              name: d.name || "",
              level: d.level || "PRIMARY",
              lgaId: d.lgaId || d.lga?.id || "",
              address: d.address || "",
              phone: d.phone || "",
              email: d.email || "",
              website: d.website || "",
              principalName: d.principalName || "",
              principalPhone: d.principalPhone || "",
              principalEmail: d.principalEmail || "",
              establishedYear: d.establishedYear ? String(d.establishedYear) : "",
              capacity: d.capacity ? String(d.capacity) : "",
              totalStudents: d.totalStudents !== undefined ? String(d.totalStudents) : "",
              totalTeachers: d.totalTeachers !== undefined ? String(d.totalTeachers) : "",
            });
          }
        })
        .catch((err) => {
          console.warn("Could not fetch detailed school profile:", err);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    }
  }, [isOpen, school, form]);

  const updateMutation = useMutation({
    mutationFn: (payload: UpdateSchoolPayload) => {
      if (!school?.id) throw new Error("No school ID provided");
      return updateSchool(school.id, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.message || "School updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      console.error("Failed to update school:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update school. Please try again.";
      toast.error(errorMsg);
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload: UpdateSchoolPayload = {
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

    updateMutation.mutate(payload);
  };

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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="p-0 sm:max-w-xl md:max-w-2xl flex flex-col bg-white border-l border-gray-200 shadow-2xl h-full"
      >
        {/* Header */}
        <SheetHeader className="p-6 bg-gradient-to-r from-emerald-800 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <Pencil className="w-5 h-5 text-white" />
            </div>
            <div>
              <SheetTitle className="text-xl font-bold text-white flex items-center gap-2">
                Edit School Profile
                {school?.code && (
                  <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full border border-white/30 text-white">
                    {school.code}
                  </span>
                )}
              </SheetTitle>
              <SheetDescription className="text-emerald-100/90 text-xs mt-0.5">
                Update institutional credentials, contacts, and capacity records.
              </SheetDescription>
            </div>
          </div>

          {/* Section Navigation Tabs */}
          <div className="flex gap-2 mt-4 bg-black/20 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "basic"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Basic Info</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("contact")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "contact"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contacts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("facility")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "facility"
                  ? "bg-white text-emerald-900 shadow-sm"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Capacity</span>
            </button>
          </div>
        </SheetHeader>

        {/* Form Body and Footer */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onError)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="overflow-y-auto px-6 py-5 flex-1 space-y-4">
              {isLoadingDetails && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Loading full school records...</span>
                </div>
              )}

              {/* TAB 1: BASIC INFORMATION */}
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
                    Core identity fields for the school in Abia State.
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

                  <FormField
                    control={form.control}
                    name="lgaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Local Government Area <span className="text-rose-500">*</span>
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

              {/* TAB 2: CONTACT & LEADERSHIP */}
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
                    Official contact channels and leadership records.
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

              {/* TAB 3: CAPACITY & STATS */}
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
                    Enrollment capacity and institutional metrics.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="totalStudents"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Total Students Enrolled
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            min={0}
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
                    name="totalTeachers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Total Assigned Teachers
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
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

            {/* Footer */}
            <SheetFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between sm:justify-between shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={updateMutation.isPending}
                className="text-xs h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="text-xs h-9 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-md active:scale-95 transition-all flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default EditSchoolSheet;
