"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Dialog } from "@/components/ui/dialog";
import { useLogin, getAuthErrorMessage } from "@/services/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

// Login validation schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const { isAuthenticated } = useAuthStore();
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Get redirect URL from query params or default to dashboard
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // Redirect if already authenticated with valid tokens
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isAuthenticated) {
        // Verify we actually have tokens before redirecting
        const tokens = localStorage.getItem("asubeb_access_token");
        if (tokens) {
          router.push(redirectTo);
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, router, redirectTo]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await loginMutation.mutateAsync(values);

      if (response.success) {
        // Clear form for security
        form.reset();

        // Redirect all users to homepage after login
        // Users can then navigate to their role-specific pages from the header
        router.push("/");
      } else {
        setErrorMessage(getAuthErrorMessage(response));
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
        isOpen={loginMutation.isPending}
        message="Signing you in..."
      />

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ExclamationCircleIcon className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Login Failed
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

      {/* Main Form */}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-sm p-8 mt-8 lg:mt-0">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-brand-primary rounded-2xl"></div>
            </div>
            <h2 className="text-xl font-medium text-brand-heading mb-2">
              Welcome back!
            </h2>
            <p className="text-brand-light-accent-1 text-sm">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label
                htmlFor="email"
                className="text-sm font-medium text-brand-heading"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="yourname@asubeb.gov.ng"
                className="mt-1 w-full"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="relative">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-brand-heading"
              >
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pr-10"
                  {...form.register("password")}
                />
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-white font-medium rounded-lg transition-colors"
              size="default"
              disabled={loginMutation.isPending}
            >
              Sign In
            </Button>

            <div className="flex items-center justify-center">
              <div className="text-sm mt-6 md:mt-0">
                <Link
                  href="/forgot-password"
                  aria-label="Forgot password"
                  className="font-medium text-brand-primary hover:text-brand-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-light-accent-1">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-brand-primary hover:text-brand-primary-hover hover:underline"
                aria-label="Sign up"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

const Login = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingModal isOpen={true} message="Loading..." />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
};

export default Login;
