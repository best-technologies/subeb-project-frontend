import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateSession } from "@/services/hooks/useAcademic";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

// Custom validation for YYYY/YYYY where year2 = year1 + 1
const sessionNameRegex = /^(\d{4})\/(\d{4})$/;

const formSchema = z.object({
  name: z.string().refine(
    (val) => {
      const match = val.match(sessionNameRegex);
      if (!match) return false;
      const year1 = parseInt(match[1], 10);
      const year2 = parseInt(match[2], 10);
      return year2 === year1 + 1;
    },
    { message: "Session name must be strictly YYYY/YYYY with consecutive years (e.g. 2024/2025)" }
  ),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  status: z.enum(["OPEN", "CLOSED"], { message: "Please select a status" }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateSessionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createSessionMutation = useCreateSession();
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      status: "OPEN",
    },
  });

  const onSubmit = (values: FormValues) => {
    createSessionMutation.mutate(
      {
        name: values.name,
        startDate: new Date(values.startDate).toISOString(),
        endDate: new Date(values.endDate).toISOString(),
        isActive: values.status === "OPEN",
        isCurrent: values.status === "OPEN",
      },
      {
        onSuccess: () => {
          setShowSuccessDialog(true);
          form.reset();
        },
        onError: (error: unknown) => {
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || "Failed to create session. Please try again.";
          setErrorMessage(message);
          setShowErrorDialog(true);
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        {/* We use a div wrapper since our Dialog is custom lightweight wrapper without DialogContent built-in */}
        <div className="p-6 sm:max-w-[500px]">
          <h2 className="text-xl font-bold mb-4">Create New Session</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 2024/2025" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Close</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-primary" disabled={createSessionMutation.isPending}>
                  {createSessionMutation.isPending ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Dialog>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={createSessionMutation.isPending}
        message="Creating session..."
      />

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowSuccessDialog(false);
            handleClose();
          }
        }}
      >
        <div className="p-6 text-center sm:max-w-[400px]">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Session Created Successfully
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            The new academic session has been created and added to the list.
          </p>
          <Button
            onClick={() => {
              setShowSuccessDialog(false);
              handleClose();
            }}
            className="w-full bg-brand-primary"
          >
            Continue
          </Button>
        </div>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
      >
        <div className="p-6 text-center sm:max-w-[400px]">
          <ExclamationCircleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Creation Failed
          </h3>
          <p className="text-sm text-gray-500 mb-6">{errorMessage}</p>
          <Button
            onClick={() => setShowErrorDialog(false)}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            Try Again
          </Button>
        </div>
      </Dialog>
    </>
  );
}
