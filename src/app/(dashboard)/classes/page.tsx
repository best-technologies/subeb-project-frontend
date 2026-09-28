"use client";

import React, { useState, useEffect } from "react";
import ClassesTab from "@/components/classes/ClassesTab";
import { useAccessStore } from "@/store/accessStore";

const ClassesPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const { isAccessReady } = useAccessStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isAccessReady) {
    return null;
  }

  return <ClassesTab />;
};

export default ClassesPage;
