import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { uploadApi } from '@/services/api/upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
  student?: any;
  schoolId: string;
  classes?: any[];
}

export function SchoolItStudentModal({ isOpen, onClose, onSubmit, isLoading, student, schoolId, classes = [] }: StudentModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: student || { gender: 'MALE', schoolId, classId: '' },
  });
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!student;

  // Set default values when editing
  React.useEffect(() => {
    if (student) {
      Object.keys(student).forEach((key) => {
        setValue(key as any, student[key]);
      });
      if (student.dateOfBirth) {
        setValue('dateOfBirth', new Date(student.dateOfBirth).toISOString().split('T')[0]);
      }
    } else {
      reset({ gender: 'MALE', schoolId, classId: '' });
      setProfilePic(null);
    }
  }, [student, isOpen, reset, setValue, schoolId]);

  const handleFormSubmit = async (data: any) => {
    try {
      let profilePictureUrl = data.profilePicture;

      if (profilePic) {
        setUploading(true);
        const uploadRes = await uploadApi.uploadImage(profilePic);
        profilePictureUrl = uploadRes.url;
      }

      onSubmit({
        ...data,
        profilePicture: profilePictureUrl,
        studentId: data.studentId || `STU${Date.now().toString().slice(-6)}`, // Auto-generate if not provided
      });
    } catch (err) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Student Details' : 'Enrol New Student'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" {...register('firstName', { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" {...register('lastName', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <input type="hidden" {...register('gender')} />
              <Select onValueChange={(val) => setValue('gender', val)} defaultValue={student?.gender || 'MALE'}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input type="date" id="dateOfBirth" {...register('dateOfBirth', { required: true })} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="classId">Class *</Label>
              <input type="hidden" {...register('classId', { required: true })} />
              <Select onValueChange={(val) => setValue('classId', val, { shouldValidate: true })} defaultValue={student?.classId || ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID (Leave blank to auto-generate)</Label>
              <Input id="studentId" {...register('studentId')} />
            </div>
          </div>

            <div className="space-y-2 col-span-2 mt-2">
              <Label htmlFor="profilePic">Profile Picture (Optional, S3 Upload)</Label>
              <Input
                id="profilePic"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setProfilePic(e.target.files[0]);
                  }
                }}
              />
            </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading || uploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || uploading}>
              {uploading ? 'Uploading...' : isLoading ? 'Saving...' : 'Save Student'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
