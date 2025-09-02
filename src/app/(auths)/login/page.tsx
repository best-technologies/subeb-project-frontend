"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-sm p-8 mt-8 lg:mt-0">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo and Title */}
          {/* <IconHeading /> */}
          <div className="flex justify-center mb-4">
            {/* <img src="/logo.svg" alt="Logo" className="h-12 w-auto" /> */}
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
        <form className="space-y-6">
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
              placeholder="E.g. yourname.asubeb.gov@gmail.com"
              className="mt-1 w-full"
              required
            />
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
                placeholder="E.g. $cg527890"
                className="w-full pr-10"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full py-3 text-white font-medium rounded-lg transition-colors"
            size="default"
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
        {/* <div className="mt-6 text-center">
          <p className="text-sm text-brand-light-accent-1">
            Don&apos;t have an account?{" "}
            <Link
              href="/create-account"
              className="font-medium text-brand-primary hover:text-brand-primary-hover hover:underline"
              aria-label="Sign up"
            >
              Sign up
            </Link>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default Login;
