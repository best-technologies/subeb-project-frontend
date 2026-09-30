"use client";

import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { useEnrollOfficer } from "@/services/hooks/useOfficers";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { LoadingModal } from "@/components/ui/LoadingModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useEnrollmentMetadata } from "@/services/hooks/useEnrollment";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { capitalizeWords } from "@/utils/formatters";
import { uploadApi } from "@/services/api/upload";
import { Camera, Loader2 } from "lucide-react";
import { PlusIcon } from "@heroicons/react/24/outline";

// Zod schema for form validation
const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  phone: z
    .string()
    .min(1, "Phone Number is required")
    .regex(/^[0-9+\s-]{7,15}$/, "Please enter a valid phone number"),
  address: z.string().min(1, "Address is required"),
  lgaId: z.string().min(1, "Please select a Local Government Area"),
  profilePicture: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddOfficerFormProps {
  onSuccess?: () => void;
}

export default function AddOfficerForm({ onSuccess }: AddOfficerFormProps) {
  const enrollOfficerMutation = useEnrollOfficer();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { data: metadata, loading: loadingMetadata } = useEnrollmentMetadata();
  const lgas = metadata?.localGovernments || [];

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      lgaId: "",
      profilePicture: "",
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image must be less than 5MB");
      setShowErrorDialog(true);
      return;
    }

    try {
      setIsUploadingImage(true);
      const data = await uploadApi.uploadImage(file);
      form.setValue("profilePicture", data.url);
    } catch (err) {
      setErrorMessage("Failed to upload image. Please try again.");
      setShowErrorDialog(true);
    } finally {
      setIsUploadingImage(false);
    }
  };

  function onSubmit(values: FormValues) {
    // Add designation field for the API
    const submissionData = {
      ...values,
      designation: "Education Officer",
    };

    // Call the API through hook
    enrollOfficerMutation.mutate(submissionData, {
      onSuccess: () => {
        form.reset();
        setShowSuccessDialog(true);
        if (onSuccess) onSuccess();
      },
      onError: (error: unknown) => {
        const message =
          (
            error as {
              response?: { data?: { message?: string } };
              message?: string;
            }
          )?.response?.data?.message ||
          (error as { message?: string })?.message ||
          "Failed to enroll officer. Please try again.";
        setErrorMessage(message);
        setShowErrorDialog(true);
      },
    });
  }

  return (
    <>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={enrollOfficerMutation.isPending}
        message="Enrolling officer..."
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-sm p-6 text-center">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-7 h-7 text-emerald-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 text-center">
                Officer Enrolled Successfully!
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 text-center mt-1">
                The SUBEB officer has been enrolled successfully.
              </DialogDescription>
            </div>
            <Button
              type="button"
              onClick={() => setShowSuccessDialog(false)}
              className="w-full max-w-[140px] bg-brand-primary text-white hover:bg-brand-primary/90 text-xs py-2 mt-2"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-sm p-6 text-center">
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <ExclamationCircleIcon className="w-7 h-7 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 text-center">
                Enrollment Failed
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 text-center mt-1">
                {errorMessage}
              </DialogDescription>
            </div>
            <Button
              type="button"
              onClick={() => setShowErrorDialog(false)}
              variant="outline"
              className="w-full max-w-[140px] text-xs py-2 mt-2"
            >
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full bg-background text-foreground">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <div className="flex justify-center mb-2">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-brand-primary/20 bg-brand-primary/5 flex items-center justify-center overflow-hidden">
                  {form.watch("profilePicture") ? (
                    <img src={form.watch("profilePicture")} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-7 h-7 text-brand-primary/40" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute bottom-0 right-0 bg-brand-primary text-white p-1.5 rounded-full shadow-md hover:bg-brand-primary/90 disabled:opacity-50"
                >
                  {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PlusIcon className="w-3.5 h-3.5" />}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png, image/jpeg"
                  className="hidden"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter first name" autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="Enter phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lgaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Government Area <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={loadingMetadata}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingMetadata ? "Loading LGAs..." : "Select LGA"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>LGAs</SelectLabel>
                          {lgas.map((lga) => (
                            <SelectItem key={lga.id} value={lga.id}>
                              {capitalizeWords(lga.name)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-3 mt-4">
              <Button
                type="submit"
                className="w-full sm:w-auto bg-brand-primary text-white hover:bg-brand-primary/90 px-6"
                disabled={enrollOfficerMutation.isPending}
              >
                {enrollOfficerMutation.isPending ? "Enrolling..." : "Enroll Officer"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
