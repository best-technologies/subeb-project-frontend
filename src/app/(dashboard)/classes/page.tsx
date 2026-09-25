"use client";

import React from "react";
import ClassesTab from "@/components/classes/ClassesTab";
import { useAccessStore } from "@/store/accessStore";

const ClassesPage: React.FC = () => {
  const { isAccessReady } = useAccessStore();

  if (!isAccessReady) {
    return null;
  }

  return <ClassesTab />;
};

export default ClassesPage;
