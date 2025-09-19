"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useEnrollOfficer } from "@/services/hooks/useEnrollOfficer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

// Zod schema for form validation
const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(1, "Phone Number is required"),
  nin: z
    .string()
    .min(1, "NIN is required")
    .regex(/^\d{11}$/, "NIN must be exactly 11 digits"),
});

type FormValues = z.infer<typeof formSchema>;

export default function EnrolOfficerPage() {
  const enrollOfficerMutation = useEnrollOfficer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      nin: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log("Form submitted with values:", values);

    // Call the API through our new hook
    enrollOfficerMutation.mutate(values, {
      onSuccess: (data) => {
        console.log("Enrollment successful, resetting form");
        form.reset();
      },
      onError: (error) => {
        console.error("Enrollment failed:", error);
        // Form stays populated on error so user can retry
      },
    });
  }

  return (
    <div className="max-w-md mx-auto bg-background text-foreground rounded-xl shadow-xl p-6 mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Enrol Officer</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 w-full"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
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
            name="nin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIN</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter 11-digit NIN"
                    maxLength={11}
                    inputMode="numeric"
                    {...field}
                  />
                </FormControl>
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
  );
}
