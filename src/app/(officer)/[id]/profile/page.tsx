"use client";

import React, { useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { LoadingModal } from "@/components/ui/LoadingModal";
import { Dialog } from "@/components/ui/dialog";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { UserRound } from "lucide-react";

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Security: Verify the user is accessing their own profile
  const profileId = params.id as string;
  if (user && user.id !== profileId) {
    notFound();
  }

  // Form state for profile info
  const [profileData, setProfileData] = useState({
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.email?.split("@")[0] || "Jane Doe",
    email: user?.email || "myself@gmail.com",
    phoneNumber: "+234",
  });

  // Form state for password change
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // TODO: Implement API call to update profile
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccessDialog(true);
    }, 1000);
  };

  const handleChangePassword = async () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setErrorMessage("Please fill in both password fields");
      setShowErrorDialog(true);
      return;
    }

    setIsLoading(true);
    // TODO: Implement API call to change password
    setTimeout(() => {
      setIsLoading(false);
      setPasswordData({ oldPassword: "", newPassword: "" });
      setShowSuccessDialog(true);
    }, 1000);
  };

  return (
    <>
      <LoadingModal isOpen={isLoading} message="Saving changes..." />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Changes Saved
            </h3>
            <p className="text-gray-600 mb-6">
              Your profile has been updated successfully
            </p>
            <Button
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-brand-green"
            >
              Continue
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <Button
              onClick={() => setShowErrorDialog(false)}
              variant="outline"
              className="w-full"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
            {/* Profile Picture Section */}
            <div className="flex items-start gap-6 mb-8 pb-8 border-b border-gray-200">
              <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center flex-shrink-0">
                <UserRound className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <Button
                  variant="outline"
                  className="text-sm border-gray-300 text-gray-700"
                >
                  Upload profile picture
                </Button>
              </div>
            </div>

            {/* Profile Form */}
            <div className="space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Jane Doe"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="myself@gmail.com"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone number
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={profileData.phoneNumber}
                  onChange={handleProfileChange}
                  placeholder="+234"
                  className="w-full max-w-md"
                />
              </div>

              <div>
                <Button
                  onClick={handleSaveProfile}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Save changes
                </Button>
              </div>
            </div>

            {/* Change Password Section */}
            <div className="pt-8 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Change password
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="oldPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Old password
                  </Label>
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your old password"
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="newPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <Button
                  onClick={handleChangePassword}
                  className="bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Save changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
