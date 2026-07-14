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
import { Dialog } from "@/components/ui/custom-dialog";
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
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone Number is required"),
  address: z.string().min(1, "Address is required"),
  lgaId: z.string().min(1, "Please select an LGA"),
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
    console.log("Form submitted with values:", values);

    // Add designation field for the API
    const submissionData = {
      ...values,
      designation: "Education Officer",
    };

    // Call the API through our new hook
    enrollOfficerMutation.mutate(submissionData, {
      onSuccess: () => {
        console.log("Enrollment successful, resetting form");
        form.reset();
        setShowSuccessDialog(true);
        if (onSuccess) onSuccess();
      },
      onError: (error: unknown) => {
        console.error("Enrollment failed:", error);
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
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Officer Enrolled Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              The SUBEB officer has been enrolled successfully.
            </p>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationCircleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Enrollment Failed
            </h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Button
              onClick={() => setShowErrorDialog(false)}
              variant="outline"
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Dialog>

      <div className="w-full bg-background text-foreground rounded-xl">
        <h2 className="text-xl font-bold mb-4 text-center">Enrol Officer</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-brand-primary/20 bg-brand-primary/5 flex items-center justify-center overflow-hidden">
                  {form.watch("profilePicture") ? (
                    <img src={form.watch("profilePicture")} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-8 h-8 text-brand-primary/40" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="absolute bottom-0 right-0 bg-brand-primary text-white p-1.5 rounded-full shadow-lg hover:bg-brand-primary/90 disabled:opacity-50"
                >
                  {isUploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
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
            
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter first name"
                      autoFocus
                      {...field}
                    />
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
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      {...field}
                    />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
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
                  <FormLabel>Local Government Area</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loadingMetadata}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select LGA" />
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
            <div className="pt-2">
              <Button
                type="submit"
                variant="default"
                size="default"
                className="w-full"
                disabled={enrollOfficerMutation.isPending}
              >
                {enrollOfficerMutation.isPending
                  ? "Enrolling..."
                  : "Enroll Officer"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
