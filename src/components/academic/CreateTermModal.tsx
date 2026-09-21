"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
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
import { DatePicker } from "@/components/ui/date-picker";
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
import { useCreateTerm, useSessions } from "@/services/hooks/useAcademic";
import { CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

const formSchema = z
  .object({
    sessionId: z.string().min(1, "Please select an academic session"),
    name: z.enum(["FIRST_TERM", "SECOND_TERM", "THIRD_TERM"], {
      message: "Please select a term",
    }),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().min(1, "End Date is required"),
    status: z.enum(["OPEN", "CLOSED"], { message: "Please select a status" }),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be strictly after the start date",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export function CreateTermModal({
  isOpen,
  onClose,
  defaultSessionId,
}: {
  isOpen: boolean;
  onClose: () => void;
  defaultSessionId?: string;
}) {
  const createTermMutation = useCreateTerm();
  const { data: sessionsData, isLoading: loadingSessions } = useSessions();
  const prevIsOpenRef = useRef(false);

  const sessions = useMemo(() => {
    return (sessionsData?.data || [])
      .slice()
      .sort((a: any, b: any) => b.name.localeCompare(a.name));
  }, [sessionsData?.data]);

  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTermName, setCreatedTermName] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionId: defaultSessionId || "",
      name: undefined as unknown as "FIRST_TERM" | "SECOND_TERM" | "THIRD_TERM",
      startDate: "",
      endDate: "",
      status: "OPEN",
    },
  });

  // Keep form reset strictly when isOpen transitions from false to true
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setIsSuccess(false);
      const targetSessionId =
        defaultSessionId || (sessions.length > 0 ? sessions[0].id : "");
      form.reset({
        sessionId: targetSessionId,
        name: undefined as unknown as "FIRST_TERM" | "SECOND_TERM" | "THIRD_TERM",
        startDate: "",
        endDate: "",
        status: "OPEN",
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, defaultSessionId, sessions, form]);

  const watchedSessionId = form.watch("sessionId");
  const selectedSession = sessions.find((s: any) => s.id === watchedSessionId);

  // Compute date limits based on selected session
  const { minTermDate, maxTermDate } = useMemo(() => {
    if (!selectedSession) return { minTermDate: undefined, maxTermDate: undefined };

    let minDate: string | undefined = undefined;
    let maxDate: string | undefined = undefined;

    if (selectedSession.startDate) {
      const d = new Date(selectedSession.startDate);
      if (!isNaN(d.getTime())) {
        minDate = d.toISOString().split("T")[0];
      }
    }
    if (selectedSession.endDate) {
      const d = new Date(selectedSession.endDate);
      if (!isNaN(d.getTime())) {
        maxDate = d.toISOString().split("T")[0];
      }
    }

    // Fallback based on session name YYYY/YYYY (e.g. 2025/2026)
    const match = selectedSession.name?.match(/^(\d{4})\/(\d{4})$/);
    if (match) {
      if (!minDate) minDate = `${match[1]}-01-01`;
      if (!maxDate) maxDate = `${match[2]}-12-31`;
    }

    return { minTermDate: minDate, maxTermDate: maxDate };
  }, [selectedSession]);

  const formatTermLabel = (name: string) => {
    return name
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const onSubmit = (values: FormValues) => {
    // Validate bounds before submitting
    if (minTermDate && values.startDate < minTermDate) {
      form.setError("startDate", {
        message: `Start date cannot precede session start (${minTermDate})`,
      });
      return;
    }
    if (maxTermDate && values.endDate > maxTermDate) {
      form.setError("endDate", {
        message: `End date cannot exceed session end (${maxTermDate})`,
      });
      return;
    }

    createTermMutation.mutate(
      {
        sessionId: values.sessionId,
        name: values.name,
        startDate: new Date(values.startDate + "T00:00:00").toISOString(),
        endDate: new Date(values.endDate + "T23:59:59").toISOString(),
        isActive: values.status === "OPEN",
        isCurrent: values.status === "OPEN",
      },
      {
        onSuccess: () => {
          setCreatedTermName(formatTermLabel(values.name));
          setIsSuccess(true);
          toast.success(`Term ${formatTermLabel(values.name)} created successfully!`);
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ||
            (error as Error)?.message ||
            "Failed to create term. Please try again.";
          toast.error(message);
        },
      }
    );
  };

  const handleClose = () => {
    setIsSuccess(false);
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md">
        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold text-gray-900 text-center">
                Term Created Successfully
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 text-center">
                Academic Term{" "}
                <strong className="text-gray-800 font-semibold">{createdTermName}</strong> has
                been created and assigned to{" "}
                <strong className="text-gray-800 font-semibold">
                  {selectedSession?.name || "the session"}
                </strong>
                .
              </DialogDescription>
            </DialogHeader>
            <div className="pt-4">
              <Button
                onClick={handleClose}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900">
                    Create New Term
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    Add an evaluation term to an academic session.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Academic Session
                      </FormLabel>
                      <Select
                        onValueChange={(val) => {
                          field.onChange(val);
                          // Clear dates when session changes so new limits take effect
                          form.setValue("startDate", "");
                          form.setValue("endDate", "");
                        }}
                        defaultValue={field.value}
                        value={field.value}
                        disabled={loadingSessions}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm">
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
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Term Name
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm">
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

                {selectedSession && minTermDate && maxTermDate && (
                  <div className="p-2.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                    <span>
                      Allowed dates for {selectedSession.name}: <strong>{minTermDate}</strong> to{" "}
                      <strong>{maxTermDate}</strong>
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          Start Date
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            min={minTermDate}
                            max={maxTermDate}
                            placeholder="Select start date"
                            disabled={!watchedSessionId}
                          />
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
                        <FormLabel className="text-xs font-semibold text-gray-700">
                          End Date
                        </FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                            min={form.watch("startDate") || minTermDate}
                            max={maxTermDate}
                            placeholder="Select end date"
                            disabled={!watchedSessionId}
                          />
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
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Initial Status
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-10 text-sm">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OPEN">Open (Activate)</SelectItem>
                          <SelectItem value="CLOSED">Closed (Inactive)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-3 gap-2 sm:gap-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={createTermMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
                    disabled={createTermMutation.isPending}
                  >
                    {createTermMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Term"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
