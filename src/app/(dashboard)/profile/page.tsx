"use client";
import Image from "next/image";
import React from "react";
import { User, Mail, Phone, MapPin, Calendar, Shield } from "lucide-react";

const ProfilePage: React.FC = () => {
  // Mock user data - this would typically come from an API or auth context
  const userProfile = {
    name: "Admin User",
    email: "admin@asubeb.edu.ng",
    phone: "+234 801 234 5678",
    role: "System Administrator",
    department: "Information Technology",
    location: "Umuahia, Nigeria",
    joinedDate: "July 2025",
    avatar: null, // URL to avatar image
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Profile</h1>
        <p className="text-gray-600">
          Manage your account settings and information
        </p>
      </div>

      {/* Profile Information Card */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-brand-primary p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-brand-secondary rounded-full flex items-center justify-center">
              {userProfile.avatar ? (
                <Image
                  src={userProfile.avatar}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-brand-secondary-contrast" />
              )}
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

      {/* Account Actions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Account Actions
        </h3>
        <div className="space-y-3">
          <button className="w-full md:w-auto px-6 py-3 bg-brand-primary text-brand-primary-contrast rounded-lg hover:bg-brand-primary-2 transition-colors duration-200">
            Edit Profile
          </button>
          <button className="w-full md:w-auto ml-0 md:ml-3 px-6 py-3 bg-brand-secondary text-brand-secondary-contrast rounded-lg hover:bg-brand-accent transition-colors duration-200">
            Change Password
          </button>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          System Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Last Login</p>
            <p className="font-medium text-gray-800">Today, 09:30 AM</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Session Timeout</p>
            <p className="font-medium text-gray-800">30 minutes</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Account Status</p>
            <p className="font-medium text-green-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
