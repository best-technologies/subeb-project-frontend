import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTerm, useSessions } from "@/services/hooks/useAcademic";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";

const formSchema = z.object({
  sessionId: z.string().min(1, "Please select a session"),
  name: z.enum(["FIRST_TERM", "SECOND_TERM", "THIRD_TERM"], { message: "Please select a term" }),
  startDate: z.string().min(1, "Start Date is required"),
  endDate: z.string().min(1, "End Date is required"),
  status: z.enum(["OPEN", "CLOSED"], { message: "Please select a status" }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTermModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const createTermMutation = useCreateTerm();
  const { data: sessionsData, isLoading: loadingSessions } = useSessions();
  const sessions = sessionsData?.data || [];
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionId: "",
      name: undefined as unknown as "FIRST_TERM" | "SECOND_TERM" | "THIRD_TERM",
      startDate: "",
      endDate: "",
      status: "OPEN",
    },
  });

  const onSubmit = (values: FormValues) => {
    createTermMutation.mutate(
      {
        sessionId: values.sessionId,
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
          const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error as Error)?.message || "Failed to create term. Please try again.";
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
        <div className="p-6 sm:max-w-[500px]">
          <h2 className="text-xl font-bold mb-4">Create New Term</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="sessionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingSessions}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Session" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sessions.map((session: { id: string; name: string }) => (
                          <SelectItem key={session.id} value={session.id}>
                            {session.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Term Name</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Term" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FIRST_TERM">First Term</SelectItem>
                        <SelectItem value="SECOND_TERM">Second Term</SelectItem>
                        <SelectItem value="THIRD_TERM">Third Term</SelectItem>
                      </SelectContent>
                    </Select>
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
                <Button type="submit" className="bg-brand-primary" disabled={createTermMutation.isPending}>
                  {createTermMutation.isPending ? "Creating..." : "Create Term"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </Dialog>

      {/* Loading Modal */}
      <LoadingModal
        isOpen={createTermMutation.isPending}
        message="Creating term..."
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
            Term Created Successfully
          </h3>
          <p className="text-sm text-gray-500 mb-6">
            The new academic term has been created and added to the list.
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
