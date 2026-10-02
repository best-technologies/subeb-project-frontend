"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

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
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Dialog } from "@/components/ui/custom-dialog";
import { useForgotPassword, getAuthErrorMessage } from "@/services/hooks/useAuth";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordContent = () => {
  const router = useRouter();
  const forgotPasswordMutation = useForgotPassword();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: values.email.trim().toLowerCase(),
      });

      if (response.success) {
        // Redirect to reset password page with email pre-filled
        router.push(
          `/reset-password?email=${encodeURIComponent(
            values.email.trim().toLowerCase()
          )}`
        );
      } else {
        setErrorMessage(
          response.message || "Failed to send recovery code. Please try again."
        );
        setShowErrorDialog(true);
      }
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error));
      setShowErrorDialog(true);
    }
  };

  return (
    <>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={forgotPasswordMutation.isPending}
        title="Sending Recovery Code..."
        message="Please wait while we send a 6-digit recovery code to your email."
      />

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationCircleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Request Failed
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

      {/* Main Container */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-sm p-8 mt-8 lg:mt-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-brand-primary rounded-2xl"></div>
            </div>
            <h2 className="text-xl font-medium text-brand-heading mb-2">
              Forgot your password?
            </h2>
            <p className="text-brand-light-accent-1 text-sm">
              Enter your registered email address and we&apos;ll send you a 6-digit recovery code.
            </p>
          </div>

          {/* ShadCN Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-brand-heading">
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="yourname@asubeb.gov.ng"
                        className="mt-1 w-full"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-3 text-white font-medium rounded-lg transition-colors"
                size="default"
                disabled={forgotPasswordMutation.isPending}
              >
                Send Recovery Code
              </Button>
            </form>
          </Form>

          {/* Footer - Sign in link structured identically to other auth pages */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-light-accent-1">
              Remember your password?{" "}
              <Link
                href="/login"
                className="font-medium text-brand-primary hover:text-brand-primary-hover hover:underline"
                aria-label="Sign in"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const ForgotPassword = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingModal isOpen={true} title="Please wait..." message="Loading..." />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
};

export default ForgotPassword;
