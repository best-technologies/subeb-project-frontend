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
import { Badge } from "@/components/ui/badge";
import { useLogin, getAuthErrorMessage } from "@/services/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import {
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";

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
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Get redirect URL from query params or default to dashboard
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  // Redirect if already authenticated with valid tokens
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      if (isAuthenticated && !errorMessage) {
        // Verify we actually have tokens before redirecting
        const tokens = localStorage.getItem("asubeb_access_token");
        if (tokens) {
          router.push(redirectTo);
        }
      }
    };

    checkAuthAndRedirect();
  }, [isAuthenticated, errorMessage, router, redirectTo]);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage("");
    try {
      const response = await loginMutation.mutateAsync(values);

      if (response.success) {
        // Clear form for security
        form.reset();

        // Redirect based on user role or redirectTo param
        const role = response.data?.user?.role;
        const normalizedRole = role?.toLowerCase();
        let target = "/dashboard";

        if (redirectTo && redirectTo !== "/" && redirectTo !== "/dashboard") {
          target = redirectTo;
        } else if (normalizedRole === "subeb_officer") {
          target = "/officer/dashboard";
        } else if (normalizedRole === "school_it") {
          target = "/school-it/dashboard";
        } else {
          target = "/dashboard";
        }

        router.push(target);
      } else {
        setErrorMessage(getAuthErrorMessage(response));
      }
    } catch (error: unknown) {
      const errorMsg = getAuthErrorMessage(error);
      setErrorMessage(errorMsg);
      // Clean up any stale tokens in storage upon failed authentication
      if (typeof window !== "undefined") {
        localStorage.removeItem("asubeb_access_token");
        localStorage.removeItem("asubeb_refresh_token");
      }
    }
  };

  return (
    <>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={loginMutation.isPending}
        title="Signing In..."
        message="Please wait while we verify your credentials."
      />

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

            <div>
              <Label
                htmlFor="password"
                className="text-sm font-medium text-brand-heading"
              >
                Password
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pr-10"
                  {...form.register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.password && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.password.message}
                </p>
              )}

              {/* Warning badge below password input field */}
              {errorMessage && (
                <div className="mt-3">
                  {errorMessage.toLowerCase().includes("deactivat") ? (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs shadow-xs">
                      <ExclamationCircleIcon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="warning" className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5">
                            Warning
                          </Badge>
                          <span className="font-semibold text-amber-950">Account Deactivated</span>
                        </div>
                        <p className="text-amber-900/90 leading-normal">{errorMessage}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5 p-3 rounded-lg border border-red-200 bg-red-50 text-red-900 text-xs shadow-xs">
                      <ExclamationCircleIcon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Badge variant="destructive" className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5">
                            Error
                          </Badge>
                          <span className="font-semibold text-red-950">Sign In Failed</span>
                        </div>
                        <p className="text-red-900/90 leading-normal">{errorMessage}</p>
                      </div>
                    </div>
                  )}
                </div>
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
          <LoadingModal isOpen={true} title="Please wait..." message="Loading..." />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
};

export default Login;
