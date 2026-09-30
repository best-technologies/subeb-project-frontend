"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { getProfile, updateProfile } from "@/services/api/auth";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  KeyRound,
  LogOut,
  Pencil,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    department: string;
    location: string;
    joinedDate: string;
    role: string;
  }>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "08012345678",
    department: "Information Technology (ASUBEB)",
    location: "Umuahia, Abia State, Nigeria",
    joinedDate: user?.createdAt
      ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      : "July 2025",
    role: user?.role || "SYSTEM_ADMIN",
  });

  // Fetch live backend profile if available, merging with locally stored edits
  useEffect(() => {
    let isMounted = true;
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        let savedLocal: any = {};
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem("asubeb_user_profile_data");
          if (raw) {
            try {
              savedLocal = JSON.parse(raw);
            } catch (e) {}
          }
        }

        const res = await getProfile();
        if (isMounted && res?.data) {
          const backendData = res.data;
          setProfileData((prev) => ({
            ...prev,
            firstName: savedLocal.firstName ?? backendData.firstName ?? prev.firstName,
            lastName: savedLocal.lastName ?? backendData.lastName ?? prev.lastName,
            email: backendData.email || prev.email,
            phone: savedLocal.phone ?? backendData.phone ?? prev.phone,
            department: savedLocal.department ?? backendData.department ?? prev.department,
            location: savedLocal.location ?? backendData.location ?? prev.location,
            role: backendData.role || prev.role,
            joinedDate: backendData.createdAt
              ? new Date(backendData.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })
              : prev.joinedDate,
          }));
        } else if (isMounted && savedLocal) {
          setProfileData((prev) => ({
            ...prev,
            ...savedLocal,
          }));
        }
      } catch (err) {
        console.error("Failed to load profile from backend:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update profile data when store user changes
  useEffect(() => {
    if (user) {
      setProfileData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        role: user.role || prev.role,
        phone: user.phone || prev.phone,
        department: user.department || prev.department,
        location: user.location || prev.location,
      }));
    }
  }, [user]);

  // Dialog States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Form State for Editing Profile
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: "",
    department: "",
  });

  const handleOpenEditModal = () => {
    setPhoneError(null);
    setEditForm({
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      phone: profileData.phone,
      location: profileData.location,
      department: profileData.department,
    });
    setIsEditModalOpen(true);
  };

  const handlePhoneChange = (val: string) => {
    // Keep only numeric digits, max 11 digits
    const digitsOnly = val.replace(/\D/g, "").slice(0, 11);
    setEditForm((prev) => ({ ...prev, phone: digitsOnly }));

    if (digitsOnly.length > 0 && digitsOnly.length !== 11) {
      setPhoneError("Phone number must be exactly 11 digits");
    } else {
      setPhoneError(null);
    }
  };

  const validatePhoneNumber = (val: string): { isValid: boolean; error: string | null } => {
    const trimmed = val.trim();
    // Optional field: empty is valid
    if (!trimmed) {
      return { isValid: true, error: null };
    }

    const digitsOnly = trimmed.replace(/\D/g, "");
    if (digitsOnly.length !== 11) {
      return {
        isValid: false,
        error: "Phone number must be exactly 11 digits",
      };
    }

    return { isValid: true, error: null };
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, error } = validatePhoneNumber(editForm.phone);
    if (!isValid) {
      setPhoneError(error);
      toast.error(error || "Invalid phone number format");
      return;
    }

    setPhoneError(null);
    const updatedProfile = {
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      phone: editForm.phone,
      location: editForm.location,
      department: editForm.department,
    };

    setProfileData((prev) => ({
      ...prev,
      ...updatedProfile,
    }));

    if (user) {
      setUser({
        ...user,
        ...updatedProfile,
      });
    }

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("asubeb_user_profile_data", JSON.stringify(updatedProfile));
      } catch (err) {
        console.error("Failed to save profile to localStorage", err);
      }
    }

    // Dispatch update to backend REST API
    try {
      await updateProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
      });
    } catch (err) {
      console.error("Failed to send profile updates to backend:", err);
    }

    toast.success("Profile information updated successfully!");
    setIsEditModalOpen(false);
  };

  const handleSignOutAndChangePassword = () => {
    toast.success("Signing out... Redirecting to Forgot Password page.");
    logout();
    router.push("/forgot-password");
  };

  const formatRoleDisplay = (roleName?: string) => {
    if (!roleName) return "System Administrator";
    const cleaned = roleName.replace(/_/g, " ").toLowerCase();
    return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const fullName =
    profileData.firstName || profileData.lastName
      ? `${profileData.firstName} ${profileData.lastName}`.trim()
      : "Admin User";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your account settings and personal information
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loading ? (
            <Skeleton className="h-6 w-32 rounded-full" />
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              {formatRoleDisplay(profileData.role)}
            </span>
          )}
        </div>
      </div>

      {/* Profile Information Card (Banner Removed Per Requirement) */}
      <Card className="rounded-2xl border border-gray-100 shadow-xs bg-white overflow-hidden">
        <CardHeader className="border-b border-gray-100 bg-linear-to-r from-gray-50/80 via-emerald-50/20 to-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary text-white flex items-center justify-center font-bold text-xl shadow-xs">
              <UserIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              {loading ? (
                <div className="space-y-1.5">
                  <Skeleton className="h-6 w-48 rounded-md" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
              ) : (
                <>
                  <CardTitle className="text-xl font-bold text-gray-900">{fullName}</CardTitle>
                  <CardDescription className="text-xs text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{formatRoleDisplay(profileData.role)}</span>
                  </CardDescription>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  {loading ? (
                    <Skeleton className="h-4 w-44 rounded-md mt-1" />
                  ) : (
                    <p className="font-semibold text-gray-900 text-sm">{profileData.email}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  {loading ? (
                    <Skeleton className="h-4 w-32 rounded-md mt-1" />
                  ) : (
                    <p className="font-semibold text-gray-900 text-sm">{profileData.phone}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  {loading ? (
                    <Skeleton className="h-4 w-48 rounded-md mt-1" />
                  ) : (
                    <p className="font-semibold text-gray-900 text-sm">{profileData.location}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Department</p>
                  {loading ? (
                    <Skeleton className="h-4 w-52 rounded-md mt-1" />
                  ) : (
                    <p className="font-semibold text-gray-900 text-sm">{profileData.department}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Joined Date</p>
                  {loading ? (
                    <Skeleton className="h-4 w-28 rounded-md mt-1" />
                  ) : (
                    <p className="font-semibold text-gray-900 text-sm">{profileData.joinedDate}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-gray-50/60 border border-gray-100/80">
                <div className="w-9 h-9 rounded-lg bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Access Level</p>
                  {loading ? (
                    <Skeleton className="h-4 w-40 rounded-md mt-1" />
                  ) : (
                    <p className="font-semibold text-gray-900 text-sm">State Administrator Access</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions Section */}
      <Card className="rounded-2xl border border-gray-100 shadow-xs bg-white">
        <CardHeader className="p-6 border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-gray-900">Account Actions</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Update profile details or initiate security credentials change
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-3">
          <Button
            onClick={handleOpenEditModal}
            className="w-full sm:w-auto bg-brand-primary hover:bg-brand-primary/90 text-white font-medium px-6 py-2.5 rounded-xl shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <Pencil className="w-4 h-4" />
            <span>Edit Profile</span>
          </Button>
          <Button
            onClick={() => setIsChangePasswordModalOpen(true)}
            variant="outline"
            className="w-full sm:w-auto border-emerald-200 text-emerald-800 hover:bg-emerald-50 font-medium px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <span>Change Password</span>
          </Button>
        </CardContent>
      </Card>

      {/* System Information Section */}
      <Card className="rounded-2xl border border-gray-100 shadow-xs bg-white">
        <CardHeader className="p-6 border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-gray-900">System Information</CardTitle>
          <CardDescription className="text-xs text-gray-500">
            Current security session details and system constraints
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span>Last Login</span>
              </div>
              <p className="font-bold text-gray-900 text-sm">Active Now (Current Session)</p>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
                <span>Session Timeout</span>
              </div>
              <p className="font-bold text-gray-900 text-sm">30 minutes of inactivity</p>
            </div>

            <div className="bg-gray-50/80 p-4 rounded-xl border border-gray-100 space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Account Status</span>
              </div>
              <p className="font-bold text-emerald-700 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                Active Administrator
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Modal (ShadCN Dialog) */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl p-6">
          <form onSubmit={handleSaveProfile}>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center">
                  <Pencil className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-gray-900">Edit Profile</DialogTitle>
                  <DialogDescription className="text-xs text-gray-500">
                    Update your administrator personal contact and location details
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-gray-700">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First Name"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-gray-700">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last Name"
                    className="h-9 text-xs rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="phone" className="text-xs font-semibold text-gray-700">
                    Phone Number
                  </Label>
                  {editForm.phone && (
                    <span
                      className={`text-[11px] font-mono font-medium ${editForm.phone.length === 11 ? "text-emerald-700" : "text-amber-600"
                        }`}
                    >
                      {editForm.phone.length}/11 digits
                    </span>
                  )}
                </div>
                <Input
                  id="phone"
                  type="tel"
                  maxLength={11}
                  value={editForm.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="08012345678"
                  className={`h-9 text-xs rounded-lg transition-colors ${phoneError
                      ? "border-red-500 focus:border-red-500 focus:ring-red-200"
                      : editForm.phone.length === 11
                        ? "border-emerald-500 focus:border-emerald-500"
                        : ""
                    }`}
                />
                {phoneError && (
                  <p className="text-[11px] font-medium text-red-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-xs font-semibold text-gray-700">
                  Department
                </Label>
                <Input
                  id="department"
                  value={editForm.department}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="Department"
                  className="h-9 text-xs rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="location" className="text-xs font-semibold text-gray-700">
                  Location
                </Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, location: e.target.value }))}
                  placeholder="City, State, Country"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                className="h-9 px-4 rounded-lg text-xs font-medium text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-9 px-4 rounded-lg text-xs font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 shadow-2xs cursor-pointer"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Password Guidance Modal (ShadCN Dialog with Warning & Redirect) */}
      <Dialog open={isChangePasswordModalOpen} onOpenChange={setIsChangePasswordModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-amber-700" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">Change Password</DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  Security portal sign-out guidance
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-3">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/90 text-amber-950 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Sign Out & Password Reset Required</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-900/90">
                For security reasons, administrator passwords must be updated through the secure verification portal. To change your password, you should sign out and proceed to the forgot password page.
              </p>
              <p className="text-xs font-semibold text-amber-950 pt-1">
                Click the button below to sign out now and be redirected to the password reset page immediately.
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsChangePasswordModalOpen(false)}
              className="w-full sm:w-auto h-9 px-4 rounded-lg text-xs font-medium text-gray-700 border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSignOutAndChangePassword}
              className="w-full sm:w-auto h-9 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out & Change Password</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
