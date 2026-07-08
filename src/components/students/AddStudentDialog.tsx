import React from "react";
import { Dialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/Button";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/Input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollStudents } from "@/services/api/enrollment";
import { useEnrollmentMetadata, useEnrollmentLgaSchools, useEnrollmentSchoolClasses } from "@/services/hooks/useEnrollment";
import { capitalizeInitials } from "@/utils/formatters";

const formSchema = z.object({
  firstName: z.string().min(1, "First Name is required"),
  lastName: z.string().min(1, "Last Name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  lgaId: z.string().min(1, "LGA is required"),
  schoolId: z.string().min(1, "School is required"),
  classId: z.string().min(1, "Class is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddStudentDialog({ open, onOpenChange, onSuccess }: AddStudentDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "MALE",
      lgaId: "",
      schoolId: "",
      classId: "",
    },
  });

  const selectedLga = form.watch("lgaId");
  const selectedSchool = form.watch("schoolId");

  const { data: metadataData } = useEnrollmentMetadata();
  const { data: schoolsData, loading: loadingSchools } = useEnrollmentLgaSchools(selectedLga);
  const { data: classesData, loading: loadingClasses } = useEnrollmentSchoolClasses(selectedSchool);

  const lgas = metadataData?.localGovernments || [];
  const schools = schoolsData?.schools || [];
  const classes = classesData?.classes || [];

  const enrollMutation = useMutation({
    mutationFn: enrollStudents,
    onSuccess: () => {
      queryClient.invalidateQueries();
      form.reset();
      onOpenChange(false);
      if (onSuccess) onSuccess();
    },
  });

  const onSubmit = (values: FormValues) => {
    enrollMutation.mutate({
      students: [
        {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: new Date(values.dateOfBirth).toISOString(),
          gender: values.gender,
          schoolId: values.schoolId,
          classId: values.classId,
        },
      ],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6 sm:max-w-[500px] w-full">
        <h2 className="text-xl font-bold mb-4">Enrol New Student</h2>
        <div className="mt-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input placeholder="First name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="lgaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local Government Area</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue("schoolId", "");
                          form.setValue("classId", "");
                        }}
                      >
                        <option value="">Select LGA</option>
                        {lgas.map((lga) => (
                          <option key={lga.id} value={lga.id}>{capitalizeInitials(lga.name)}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schoolId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>School {loadingSchools && <span className="text-gray-400 text-xs ml-2">Loading...</span>}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                        {...field}
                        disabled={!selectedLga || loadingSchools}
                        onChange={(e) => {
                          field.onChange(e);
                          form.setValue("classId", "");
                        }}
                      >
                        <option value="">Select School</option>
                        {schools.map((school) => (
                          <option key={school.id} value={school.id}>{capitalizeInitials(school.name)}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class {loadingClasses && <span className="text-gray-400 text-xs ml-2">Loading...</span>}</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                        {...field}
                        disabled={!selectedSchool || loadingClasses}
                      >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>{capitalizeInitials(cls.name)}</option>
                        ))}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ? "Enrolling..." : "Enrol Student"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Dialog>
  );
}
