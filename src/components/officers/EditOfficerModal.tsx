"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/Button";
import { useUpdateOfficer } from "@/services/hooks/useOfficers";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  lgaId: z.string().min(1, "Please select an LGA"),
});

type FormValues = z.infer<typeof formSchema>;

export interface EditOfficerModalProps {
  isOpen: boolean;
  onClose: () => void;
  officer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lgaId?: string;
  } | null;
  onSuccess?: () => void;
}

export default function EditOfficerModal({ isOpen, onClose, officer, onSuccess }: EditOfficerModalProps) {
  const updateOfficerMutation = useUpdateOfficer();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  const { data: metadata, loading: loadingMetadata } = useEnrollmentMetadata();
  const lgas = metadata?.localGovernments || [];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      lgaId: "",
    },
  });

  // Populate form when officer changes
  useEffect(() => {
    if (officer) {
      form.reset({
        firstName: officer.firstName || "",
        lastName: officer.lastName || "",
        lgaId: officer.lgaId || "",
      });
    }
  }, [officer, form]);

  function onSubmit(values: FormValues) {
    if (!officer) return;

    updateOfficerMutation.mutate({ id: officer.id, data: values }, {
      onSuccess: () => {
        setShowSuccessDialog(true);
        if (onSuccess) onSuccess();
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update officer. Please try again.";
        setErrorMessage(message);
        setShowErrorDialog(true);
      },
    });
  }

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Edit Officer</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter first name" {...field} />
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

              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input value={officer?.email || ""} disabled className="bg-gray-50" />
                </FormControl>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
              </FormItem>

              <FormField
                control={form.control}
                name="lgaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Government Area (LGA) <span className="text-red-500">*</span></FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingMetadata}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingMetadata ? "Loading LGAs..." : "Select LGA"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          {lgas.map((lga: any) => (
                            <SelectItem key={lga.id} value={lga.id}>
                              {lga.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-brand-primary text-white"
                  disabled={updateOfficerMutation.isPending}
                >
                  {updateOfficerMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Dialog>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={updateOfficerMutation.isPending}
        message="Updating officer..."
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Officer Updated Successfully!
            </h3>
            <p className="text-gray-600 mb-6">
              The SUBEB officer details have been updated.
            </p>
            <Button onClick={handleCloseSuccess} className="w-full">
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
              Update Failed
            </h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Button onClick={() => setShowErrorDialog(false)} className="w-full">
              Try Again
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
