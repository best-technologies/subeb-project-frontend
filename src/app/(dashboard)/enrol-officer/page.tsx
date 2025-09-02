"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function EnrolOfficerPage() {
  type FormState = {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nin: string;
  };
  type ErrorState = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    nin?: string;
  };
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nin: "",
  });
  const [errors, setErrors] = useState<ErrorState>({});

  function validate(): ErrorState {
    const newErrors: ErrorState = {};
    if (!form.firstName) newErrors.firstName = "First Name is required";
    if (!form.lastName) newErrors.lastName = "Last Name is required";
    if (!form.email) newErrors.email = "Email is required";
    if (!form.phone) newErrors.phone = "Phone Number is required";
    if (!form.nin) newErrors.nin = "NIN is required";
    else if (!/^\d{11}$/.test(form.nin))
      newErrors.nin = "NIN must be 11 digits";
    return newErrors;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      // Submit logic here
      setForm({ firstName: "", lastName: "", email: "", phone: "", nin: "" });
    }
  }

  return (
    <div className="max-w-md mx-auto bg-background text-foreground rounded-xl shadow-xl p-6 mt-10">
      <h2 className="text-xl font-bold mb-4 text-center">Enrol Officer</h2>
      <form onSubmit={handleSubmit} className="space-y-2 w-full">
        <Input
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          error={errors.firstName}
          autoFocus
        />
        <Input
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          error={errors.lastName}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Phone Number"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        <Input
          label="NIN"
          name="nin"
          value={form.nin}
          onChange={handleChange}
          error={errors.nin}
          maxLength={11}
          pattern="\d{11}"
          inputMode="numeric"
        />
        <div className="pt-2">
          <Button
            type="submit"
            variant="default"
            size="default"
            className="w-full"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
}
