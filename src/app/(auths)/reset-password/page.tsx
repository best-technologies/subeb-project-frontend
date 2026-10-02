"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  useResetPassword,
  useForgotPassword,
  getAuthErrorMessage,
} from "@/services/hooks/useAuth";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

const resetPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    otp: z
      .string()
      .trim()
      .length(6, "Verification code must be exactly 6 digits")
      .regex(/^\d{6}$/, "Verification code must contain only numbers"),
    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const resetPasswordMutation = useResetPassword();
  const forgotPasswordMutation = useForgotPassword();

  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Resend OTP countdown
  const [resendCountdown, setResendCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: initialEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Sync if query param changes
  useEffect(() => {
    if (initialEmail && !form.getValues("email")) {
      form.setValue("email", initialEmail);
    }
  }, [initialEmail, form]);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    try {
      const response = await resetPasswordMutation.mutateAsync({
        email: values.email.trim().toLowerCase(),
        otp: values.otp.trim(),
        newPassword: values.newPassword,
      });

      if (response.success) {
        setShowSuccessDialog(true);
      } else {
        setErrorMessage(
          response.message ||
          "Failed to reset password. Please check your verification code."
        );
        setShowErrorDialog(true);
      }
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error));
      setShowErrorDialog(true);
    }
  };

  const handleResendOtp = async () => {
    const currentEmail = form.getValues("email")?.trim().toLowerCase();
    if (!currentEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentEmail)) {
      form.setError("email", {
        message: "Please enter a valid email address to resend the code",
      });
      return;
    }

    try {
      setResendFeedback(null);
      await forgotPasswordMutation.mutateAsync({ email: currentEmail });
      setResendFeedback("A new 6-digit code has been sent to your email!");
      setCanResend(false);
      setResendCountdown(60);
    } catch (err: unknown) {
      setErrorMessage(getAuthErrorMessage(err));
      setShowErrorDialog(true);
    }
  };

  return (
    <>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={
          resetPasswordMutation.isPending || forgotPasswordMutation.isPending
        }
        title={
          resetPasswordMutation.isPending
            ? "Resetting Password..."
            : "Sending New Code..."
        }
        message={
          resetPasswordMutation.isPending
            ? "Please wait while we update your password."
            : "Please wait while we send a new code to your email."
        }
      />

      {/* Success Dialog */}
      <Dialog
        open={showSuccessDialog}
        onOpenChange={() => { }}
        className="max-w-[340px]"
      >
        <div className="p-5">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
              <CheckCircleIcon className="w-7 h-7 text-brand-green" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5">
              Password Reset Successful!
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              You can now log in using your new credentials.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full py-2.5 text-sm text-white font-medium rounded-lg"
            >
              Sign In Now
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
              Password Reset Failed
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
              Reset your password
            </h2>
            <p className="text-brand-light-accent-1 text-sm">
              Enter the 6-digit code sent to your email and create a new password.
            </p>
          </div>

          {/* ShadCN Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Address */}
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
                        className="mt-1 w-full bg-gray-50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              {/* 6-Digit OTP */}
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-1">
                      <FormLabel className="text-sm font-medium text-brand-heading">
                        6-Digit Recovery Code
                      </FormLabel>
                      {canResend ? (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="text-xs font-medium text-brand-primary hover:text-brand-primary-hover hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <ArrowPathIcon className="w-3 h-3" /> Resend code
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">
                          Resend code in {resendCountdown}s
                        </span>
                      )}
                    </div>
                    <FormControl>
                      <Input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="123456"
                        className="w-full text-center tracking-[0.4em] font-mono text-lg font-semibold placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:font-normal"
                        {...field}
                      />
                    </FormControl>
                    {resendFeedback && (
                      <p className="text-xs text-emerald-600 mt-1">
                        {resendFeedback}
                      </p>
                    )}
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              {/* New Password */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-brand-heading">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative mt-1">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password (min. 6 characters)"
                          className="w-full pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              {/* Confirm New Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-brand-heading">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative mt-1">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          className="w-full pr-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeSlashIcon className="w-5 h-5" />
                          ) : (
                            <EyeIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs text-red-600" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-3 text-white font-medium rounded-lg transition-colors mt-2"
                size="default"
                disabled={resetPasswordMutation.isPending}
              >
                Reset Password
              </Button>
            </form>
          </Form>

          {/* Footer - Structured like other auth pages */}
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

const ResetPassword = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingModal isOpen={true} title="Please wait..." message="Loading..." />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPassword;
