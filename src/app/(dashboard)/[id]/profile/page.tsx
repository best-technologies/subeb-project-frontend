"use client";

import { use } from "react";
import { User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default function UserProfilePage({ params }: ProfilePageProps) {
  const { id } = use(params);
  const { user } = useAuthStore();

  // TODO: Fetch user profile by ID from API
  const userProfile = {
    id: id,
    name:
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : "User",
    email: user?.email || "user@asubeb.edu.ng",
    phone: "+234 801 234 5678",
    role: user?.role || "Officer",
    department: "Education",
    location: "Umuahia, Nigeria",
    joinedDate: new Date(user?.createdAt || Date.now()).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "long",
      }
    ),
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">User Profile</h1>
        <p className="text-gray-600">
          View and manage user account information
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-brand-primary p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-brand-green rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-brand-primary-contrast">
                {userProfile.name}
              </h2>
              <p className="text-brand-primary-contrast/80">
                {userProfile.role}
              </p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-brand-primary" />
                <div>
                  <p className="text-sm text-gray-600">Joined</p>
                  <p className="font-medium text-gray-800">
                    {userProfile.joinedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">User ID</p>
            <p className="font-medium text-gray-800">{userProfile.id}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Joined</p>
            <p className="font-medium text-gray-800">
              {userProfile.joinedDate}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Account Status</p>
            <p className="font-medium text-green-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
