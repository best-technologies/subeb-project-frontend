"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGradeEntryMetadata, useLgaSchools } from "@/services";

export default function AddStudentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const userId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    lgaId: "",
    lgaName: "",
    schoolId: "",
    schoolName: "",
  });

  // Fetch grade entry metadata for LGAs
  const {
    data: gradeMetadata,
    loading: metadataLoading,
    error: metadataError,
  } = useGradeEntryMetadata();

  // Fetch schools when LGA is selected
  const {
    data: lgaSchoolsData,
    loading: schoolsLoading,
    error: schoolsError,
  } = useLgaSchools(formData.lgaId);

  // Extract LGAs from grade metadata
  const lgas = useMemo(
    () => gradeMetadata?.localGovernments || [],
    [gradeMetadata]
  );

  // Extract schools from LGA schools data
  const schools = useMemo(
    () => lgaSchoolsData?.schools || [],
    [lgaSchoolsData]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLgaChange = (value: string) => {
    const selectedLga = lgas.find((lga) => lga.id === value);
    if (selectedLga) {
      setFormData((prev) => ({
        ...prev,
        lgaId: selectedLga.id,
        lgaName: selectedLga.name,
        schoolId: "", // Reset school when LGA changes
        schoolName: "",
      }));
    }
  };

  const handleSchoolChange = (value: string) => {
    const selectedSchool = schools.find((s) => s.id === value);
    if (selectedSchool) {
      setFormData((prev) => ({
        ...prev,
        schoolId: selectedSchool.id,
        schoolName: selectedSchool.name,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.lgaId ||
      !formData.schoolId
    ) {
      setErrorMessage("Please fill in all required fields");
      setShowErrorDialog(true);
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement API call to add student
      // const response = await addStudent(formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setIsLoading(false);
      setShowSuccessDialog(true);

      // Reset form after successful submission
      setFormData({
        firstName: "",
        lastName: "",
        lgaId: "",
        lgaName: "",
        schoolId: "",
        schoolName: "",
      });
    } catch (error) {
      setIsLoading(false);
      setErrorMessage("Failed to add student. Please try again.");
      setShowErrorDialog(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    // Navigate back to grade record or stay on page
    router.push(`/${userId}/grade-record`);
  };

  return (
    <>
      <LoadingModal isOpen={isLoading} message="Adding student..." />
      <LoadingModal
        isOpen={metadataLoading}
        message="Loading Local Government Areas..."
      />
      <LoadingModal
        isOpen={schoolsLoading && !!formData.lgaId}
        message="Loading schools..."
      />

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <div className="p-6">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Student Added Successfully
            </h3>
            <p className="text-gray-600 mb-6">
              {formData.firstName} {formData.lastName} has been added to{" "}
              {formData.schoolName}
            </p>
            <div className="flex gap-3 w-full">
              <Button
                onClick={() => setShowSuccessDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Add Another
              </Button>
              <Button
                onClick={handleSuccessClose}
                className="flex-1 bg-brand-green"
              >
                Done
              </Button>
            </div>
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
      <div className="bg-white min-h-screen">
        <div className="max-w-2xl mx-auto p-6 sm:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-brand-black mb-2">
              Add New Student
            </h1>
            <p className="text-gray-600">
              Fill in the details to add a new student to the system
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-black">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-brand-black-accent"
                  >
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter first name"
                    required
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-brand-black-accent"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter last name"
                    required
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-brand-black">
                School Information
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="lga"
                    className="text-sm font-medium text-brand-black-accent"
                  >
                    Local Government Area{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.lgaId}
                    onValueChange={handleLgaChange}
                    disabled={metadataLoading || lgas.length === 0}
                  >
                    <SelectTrigger className="focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue
                        placeholder={
                          metadataLoading
                            ? "Loading LGAs..."
                            : lgas.length === 0
                            ? "No LGAs available"
                            : "Select Local Government Area"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20">
                      {lgas.map((lga) => (
                        <SelectItem
                          key={lga.id}
                          value={lga.id}
                          className="hover:bg-[#F5FAF8] cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{lga.name}</span>
                            {lga.totalSchools !== undefined && (
                              <span className="ml-auto pl-4 text-xs bg-brand-green text-white px-2 py-1 rounded-full">
                                {lga.totalSchools}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="school"
                    className="text-sm font-medium text-brand-black-accent"
                  >
                    School <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.schoolId}
                    onValueChange={handleSchoolChange}
                    disabled={
                      !formData.lgaId || schoolsLoading || schools.length === 0
                    }
                  >
                    <SelectTrigger className="focus:ring-brand-green hover:border-brand-green/40">
                      <SelectValue
                        placeholder={
                          !formData.lgaId
                            ? "Select LGA first"
                            : schoolsLoading
                            ? "Loading schools..."
                            : schools.length === 0
                            ? "No schools available"
                            : "Select School"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="border-brand-green/20">
                      {schools.map((school) => (
                        <SelectItem
                          key={school.id}
                          value={school.id}
                          className="hover:bg-[#F5FAF8] cursor-pointer"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{school.name}</span>
                            {school.totalClasses !== undefined && (
                              <span className="ml-auto pl-4 text-xs bg-brand-green text-white px-2 py-1 rounded-full">
                                {school.totalClasses}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-green hover:bg-brand-green/90"
                disabled={
                  isLoading ||
                  !formData.firstName.trim() ||
                  !formData.lastName.trim() ||
                  !formData.lgaId ||
                  !formData.schoolId
                }
              >
                Add Student
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
