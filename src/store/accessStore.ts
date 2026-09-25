import { create } from "zustand";
import { isAccessCacheValid } from "@/lib/accessCache";

interface AccessState {
  isAccessReady: boolean;
  setIsAccessReady: (ready: boolean) => void;
}

export const useAccessStore = create<AccessState>((set) => ({
  isAccessReady:
    typeof window !== "undefined"
      ? isAccessCacheValid(["super_admin", "subeb_officer", "school_it"])
      : false,
  setIsAccessReady: (ready: boolean) => set({ isAccessReady: ready }),
}));
