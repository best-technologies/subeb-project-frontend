"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Dialog } from "@/components/ui/dialog";
import { useRegister, getAuthErrorMessage } from "@/services/hooks/useAuth";
import { PASSWORD_REQUIREMENTS } from "@/services/types/auth";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";

// Password validation schema
const registerSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(
        PASSWORD_REQUIREMENTS.minLength,
        `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`
      )
      .regex(
        PASSWORD_REQUIREMENTS.hasUppercase,
        "Password must contain at least one uppercase letter"
      )
      .regex(
        PASSWORD_REQUIREMENTS.hasLowercase,
        "Password must contain at least one lowercase letter"
      )
      .regex(
        PASSWORD_REQUIREMENTS.hasNumber,
        "Password must contain at least one number"
      )
      .regex(
        PASSWORD_REQUIREMENTS.hasSpecialChar,
        "Password must contain at least one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const password = form.watch("password");

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= PASSWORD_REQUIREMENTS.minLength) strength++;
    if (PASSWORD_REQUIREMENTS.hasUppercase.test(pwd)) strength++;
    if (PASSWORD_REQUIREMENTS.hasLowercase.test(pwd)) strength++;
    if (PASSWORD_REQUIREMENTS.hasNumber.test(pwd)) strength++;
    if (PASSWORD_REQUIREMENTS.hasSpecialChar.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength <= 2) return "Weak";
    if (passwordStrength <= 3) return "Fair";
    if (passwordStrength <= 4) return "Good";
    return "Strong";
  };

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const response = await registerMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });

      if (response.success) {
        setShowSuccessDialog(true);
        form.reset();
      } else {
        setErrorMessage(getAuthErrorMessage(response));
        setShowErrorDialog(true);
      }
    } catch (error: unknown) {
      setErrorMessage(getAuthErrorMessage(error));
      setShowErrorDialog(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    router.push("/login");
  };

  return (
    <>
      {/* Loading Modal */}
      <LoadingModal
        isOpen={registerMutation.isPending}
        message="Creating your account..."
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={handleSuccessClose}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Successfully Registered!
            </h3>
            <p className="text-gray-600 mb-6">
              Your account has been created successfully. Now, try and login.
            </p>
            <Button onClick={handleSuccessClose} className="w-full">
              Go to Login
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
              Registration Failed
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
              Create Your Account
            </h2>
            <p className="text-brand-light-accent-1 text-sm">
              Join us to manage student examinations
            </p>
          </div>

          {/* Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-brand-heading"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  className="mt-1 w-full"
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-brand-heading"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  className="mt-1 w-full"
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

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
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a strong password"
                  className="mt-1 w-full pr-10"
                  {...form.register("password")}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
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

              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < passwordStrength
                            ? getStrengthColor()
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Password strength:{" "}
                    <span className="font-medium">{getStrengthText()}</span>
                  </p>
                </div>
              )}

              {/* Password Requirements */}
              {(passwordFocused || password) && (
                <div className="mt-2 p-3 bg-gray-50 rounded-md text-xs">
                  <p className="font-medium text-gray-700 mb-2">
                    Password must contain:
                  </p>
                  <ul className="space-y-1">
                    <li
                      className={
                        password.length >= 8
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      ✓ At least 8 characters
                    </li>
                    <li
                      className={
                        PASSWORD_REQUIREMENTS.hasUppercase.test(password)
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      ✓ One uppercase letter
                    </li>
                    <li
                      className={
                        PASSWORD_REQUIREMENTS.hasLowercase.test(password)
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      ✓ One lowercase letter
                    </li>
                    <li
                      className={
                        PASSWORD_REQUIREMENTS.hasNumber.test(password)
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      ✓ One number
                    </li>
                    <li
                      className={
                        PASSWORD_REQUIREMENTS.hasSpecialChar.test(password)
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      ✓ One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <Label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-brand-heading"
              >
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className="mt-1 w-full pr-10"
                  {...form.register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  {form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-white font-medium rounded-lg transition-colors"
              size="default"
              disabled={registerMutation.isPending}
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-light-accent-1">
              Already have an account?{" "}
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

export default Register;
