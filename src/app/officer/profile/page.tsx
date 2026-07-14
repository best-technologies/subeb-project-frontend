"use client";

import React, { useState, useEffect } from "react";
import { useExamOfficerProfile, useUpdateExamOfficerProfile } from "@/services/hooks/useExamOfficer";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Phone, MapPin, Building, Upload, Camera, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { uploadApi } from "@/services/api/upload";

type ProfileFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
};

export default function ExamOfficerProfile() {
  const { data: profile, isLoading } = useExamOfficerProfile();
  const updateMutation = useUpdateExamOfficerProfile();
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormData>();

  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        address: profile.address || "",
      });
      if (profile.user?.profilePicture) {
        setPreviewUrl(profile.user.profilePicture);
      }
    }
  }, [profile, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      let pictureUrl = profile?.user?.profilePicture;
      
      if (profilePicture) {
        setIsUploading(true);
        try {
          const uploadRes = await uploadApi.uploadImage(profilePicture);
          pictureUrl = uploadRes.url;
        } catch (err: any) {
          toast.error(err.response?.data?.message || "Failed to upload profile picture.");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      updateMutation.mutate({
        ...data,
        profilePicture: pictureUrl
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-500 mt-1">Manage your personal information and account settings.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Profile Picture Section */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-100">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
                  ) : previewUrl ? (
                    <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <label className="absolute bottom-1 right-1 bg-brand-primary text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-brand-secondary transition-colors" title="Upload new picture">
                  <Camera size={18} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={isUploading || updateMutation.isPending} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-bold text-gray-900">{profile?.firstName} {profile?.lastName}</h3>
                <p className="text-brand-primary font-medium">{profile?.designation || 'LGA Exam Officer'}</p>
                <p className="text-sm text-gray-500 mt-1">{profile?.lga?.name} LGA, {profile?.stateRef?.name} State</p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> First Name
                </label>
                <Input
                  {...register("firstName", { required: "First name is required" })}
                  error={errors.firstName?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" /> Last Name
                </label>
                <Input
                  {...register("lastName", { required: "Last name is required" })}
                  error={errors.lastName?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" /> Email Address
                </label>
                <Input
                  value={profile?.email}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-400">Email cannot be changed.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" /> Phone Number
                </label>
                <Input
                  {...register("phone", { required: "Phone number is required" })}
                  error={errors.phone?.message}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> Office Address
                </label>
                <Input
                  {...register("address")}
                  placeholder="E.g., SUBEB LGA Office, Main Street..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button 
                type="submit" 
                disabled={(!isDirty && !profilePicture) || updateMutation.isPending}
                className="w-full sm:w-auto"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}