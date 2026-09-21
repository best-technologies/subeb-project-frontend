"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/Input";
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
import { useCreateSession } from "@/services/hooks/useAcademic";
import { CheckCircle2, Calendar, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

// Custom validation for YYYY/YYYY where year2 = year1 + 1
const sessionNameRegex = /^(\d{4})\/(\d{4})$/;

const formSchema = z
  .object({
    name: z.string().refine(
      (val) => {
        const match = val.match(sessionNameRegex);
        if (!match) return false;
        const year1 = parseInt(match[1], 10);
        const year2 = parseInt(match[2], 10);
        return year2 === year1 + 1;
      },
      {
        message:
          "Session name must be strictly YYYY/YYYY with consecutive years (e.g. 2025/2026)",
      }
    ),
    startDate: z.string().min(1, "Start Date is required"),
    endDate: z.string().min(1, "End Date is required"),
    status: z.enum(["OPEN", "CLOSED"], { message: "Please select a status" }),
  })
  .superRefine((data, ctx) => {
    const match = data.name.match(sessionNameRegex);
    if (!match) return;
    const year1 = match[1];
    const year2 = match[2];
    const minBound = `${year1}-01-01`;
    const maxBound = `${year2}-12-31`;

    if (data.startDate < minBound || data.startDate > maxBound) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDate"],
        message: `Start date must be between ${minBound} and ${maxBound}`,
      });
    }

    if (data.endDate < minBound || data.endDate > maxBound) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: `End date must be between ${minBound} and ${maxBound}`,
      });
    }

    if (data.startDate && data.endDate && data.endDate <= data.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "End date must be strictly after the start date",
      });
    }
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdSessionName, setCreatedSessionName] = useState("");
  const prevIsOpenRef = useRef(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      status: "OPEN",
    },
  });

  const watchedName = form.watch("name");

  // Dynamically compute date limits based on session name
  const nameMatch = watchedName?.match(sessionNameRegex);
  const minDate = nameMatch ? `${nameMatch[1]}-01-01` : undefined;
  const maxDate = nameMatch ? `${nameMatch[2]}-12-31` : undefined;

  // Reset form once strictly when modal opens to prevent infinite loops
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setIsSuccess(false);
      form.reset({
        name: "",
        startDate: "",
        endDate: "",
        status: "OPEN",
      });
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, form]);

  const onSubmit = (values: FormValues) => {
    createSessionMutation.mutate(
      {
        name: values.name,
        startDate: new Date(values.startDate + "T00:00:00").toISOString(),
        endDate: new Date(values.endDate + "T23:59:59").toISOString(),
        isActive: values.status === "OPEN",
        isCurrent: values.status === "OPEN",
      },
      {
        onSuccess: () => {
          setCreatedSessionName(values.name);
          setIsSuccess(true);
          toast.success(`Session ${values.name} created successfully!`);
        },
        onError: (error: unknown) => {
          const message =
            (error as { response?: { data?: { message?: string } } })?.response?.data
              ?.message ||
            (error as Error)?.message ||
            "Failed to create session. Please try again.";
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
                Session Created Successfully
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-500 text-center">
                Academic Session{" "}
                <strong className="text-gray-800 font-semibold">{createdSessionName}</strong> has
                been created and registered in the schedule.
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
                    Create New Session
                  </DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    Define an academic calendar period (e.g. 2025/2026).
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-semibold text-gray-700">
                        Session Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 2025/2026"
                          className="h-10 text-sm"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Clear date inputs if session name changes to avoid mismatch
                            form.setValue("startDate", "");
                            form.setValue("endDate", "");
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                      {minDate && maxDate ? (
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Session Boundaries: {minDate} to {maxDate}
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-400">
                          Format: YYYY/YYYY (e.g. 2025/2026)
                        </p>
                      )}
                    </FormItem>
                  )}
                />

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
                            min={minDate}
                            max={maxDate}
                            placeholder="Select start date"
                            disabled={!minDate}
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
                            min={form.watch("startDate") || minDate}
                            max={maxDate}
                            placeholder="Select end date"
                            disabled={!minDate}
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
                    disabled={createSessionMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white font-medium"
                    disabled={createSessionMutation.isPending}
                  >
                    {createSessionMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating...</span>
                      </div>
                    ) : (
                      "Create Session"
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
