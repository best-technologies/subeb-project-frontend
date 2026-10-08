import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'react-hot-toast';
import { uploadApi } from '@/services/api/upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, BookOpen, UserPlus, Loader2, Image as ImageIcon } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  student?: any;
  schoolId: string;
  classes?: any[];
}

export function SchoolItStudentModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  student,
  schoolId,
  classes = [],
}: StudentModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      gender: 'MALE',
      dateOfBirth: '',
      classId: '',
      schoolId,
    },
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!student;

  // Set default values when editing or resetting
  React.useEffect(() => {
    if (student) {
      reset({
        firstName: student.firstName || '',
        lastName: student.lastName || '',
        gender: student.gender || 'MALE',
        dateOfBirth: student.dateOfBirth
          ? new Date(student.dateOfBirth).toISOString().split('T')[0]
          : '',
        classId: student.classId || '',
        schoolId,
      });
      setPreviewUrl(student.profilePicture || null);
    } else {
      reset({
        firstName: '',
        lastName: '',
        gender: 'MALE',
        dateOfBirth: '',
        classId: '',
        schoolId,
      });
      setProfilePic(null);
      setPreviewUrl(null);
    }
  }, [student, isOpen, reset, schoolId]);

  const handleFormSubmit = async (data: any) => {
    try {
      let profilePictureUrl = student?.profilePicture;

      if (profilePic) {
        setUploading(true);
        const uploadRes = await uploadApi.uploadImage(profilePic);
        profilePictureUrl = uploadRes.url;
      }

      const payload: any = {
        ...data,
        schoolId,
        profilePicture: profilePictureUrl,
      };

      // Preserve existing studentId when editing; omit when creating so backend auto-generates it
      if (isEditing && student?.studentId) {
        payload.studentId = student.studentId;
      }

      onSubmit(payload);
    } catch (err) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto p-0 rounded-2xl bg-white border border-gray-100 shadow-xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 tracking-tight">
                {isEditing ? 'Edit Student Details' : 'Enrol New Student'}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {isEditing
                  ? 'Update student records and details for your school.'
                  : 'Register a new student into your school database.'}
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-semibold text-gray-700">
                First Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <Input
                  id="firstName"
                  placeholder="e.g. Chukwudi"
                  className="pl-9 text-sm rounded-xl border-gray-200 focus:border-brand-primary"
                  {...register('firstName', { required: 'First name is required' })}
                />
              </div>
              {errors.firstName && (
                <p className="text-[11px] text-red-500 mt-0.5">{String(errors.firstName.message || 'Required')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-semibold text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <Input
                  id="lastName"
                  placeholder="e.g. Favour"
                  className="pl-9 text-sm rounded-xl border-gray-200 focus:border-brand-primary"
                  {...register('lastName', { required: 'Last name is required' })}
                />
              </div>
              {errors.lastName && (
                <p className="text-[11px] text-red-500 mt-0.5">{String(errors.lastName.message || 'Required')}</p>
              )}
            </div>
          </div>

          {/* Row 2: Gender & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gender" className="text-xs font-semibold text-gray-700">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="gender"
                rules={{ required: 'Gender is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || 'MALE'}>
                    <SelectTrigger className="text-sm rounded-xl border-gray-200 focus:border-brand-primary">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth" className="text-xs font-semibold text-gray-700">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="dateOfBirth"
                rules={{ required: 'Date of birth is required' }}
                render={({ field }) => (
                  <DatePicker
                    value={field.value || ''}
                    onChange={field.onChange}
                    placeholder="Select date of birth"
                    max={new Date().toISOString().split('T')[0]}
                    min={
                      new Date(new Date().getFullYear() - 25, new Date().getMonth(), new Date().getDate())
                        .toISOString()
                        .split('T')[0]
                    }
                    className="rounded-xl border-gray-200 text-sm focus:border-brand-primary"
                  />
                )}
              />
              {errors.dateOfBirth && (
                <p className="text-[11px] text-red-500 mt-0.5">{String(errors.dateOfBirth.message || 'Required')}</p>
              )}
            </div>
          </div>

          {/* Row 3: Class & Profile Picture (Side by Side) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="classId" className="text-xs font-semibold text-gray-700">
                Class <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="classId"
                rules={{ required: 'Class is required' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="text-sm rounded-xl border-gray-200 focus:border-brand-primary">
                      <SelectValue placeholder="Select Class" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.classId && (
                <p className="text-[11px] text-red-500 mt-0.5">Please select a class</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="profilePic" className="text-xs font-semibold text-gray-700">
                  Profile Picture
                </Label>
                <span className="text-[10px] text-gray-400 font-normal">Optional</span>
              </div>
              <div className="flex items-center gap-2">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                )}
                <Input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer rounded-xl border-gray-200 focus:border-brand-primary h-9"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      setProfilePic(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading || uploading}
              className="rounded-xl text-xs font-medium px-4 py-2 h-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || uploading}
              className="bg-brand-primary text-white hover:bg-brand-primary-2 rounded-xl text-xs font-semibold px-5 py-2 h-auto shadow-xs flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading Photo...</span>
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Student...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{isEditing ? 'Save Changes' : 'Enrol Student'}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
