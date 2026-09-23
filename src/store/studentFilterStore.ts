import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PerformanceStudent, School } from "@/services/types/studentsDashboardResponse";

export interface SearchParams {
  session?: string;
  term?: string;
  lgaId?: string;
  schoolId?: string;
  classId?: string;
  gender?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FilterOptions {
  schools: Array<{ id: string; name: string; code?: string }>;
  classes: Array<{ id: string; name: string }>;
}

export interface SchoolStats {
  name: string;
  code: string;
  totalStudents: number;
  genderBreakdown: {
    male: number;
    female: number;
  };
}

export interface StudentFilterState {
  searchParams: SearchParams;
  students: PerformanceStudent[];
  originalStudents: PerformanceStudent[];
  filterOptions: FilterOptions;
  schoolStats: SchoolStats | null;
  totalStudents: number;
  totalPages: number;
  selectedLgaName: string;
  selectedSchoolName: string;

  // Actions
  setSearchParams: (
    params: SearchParams | ((prev: SearchParams) => SearchParams)
  ) => void;
  setStudents: (students: PerformanceStudent[]) => void;
  setOriginalStudents: (students: PerformanceStudent[]) => void;
  setFilterOptions: (
    options: FilterOptions | ((prev: FilterOptions) => FilterOptions)
  ) => void;
  setSchoolStats: (stats: SchoolStats | null) => void;
  setTotalStudents: (total: number) => void;
  setTotalPages: (pages: number) => void;
  setSelectedLgaName: (name: string) => void;
  setSelectedSchoolName: (name: string) => void;
  resetFilters: () => void;
}

const initialSearchParams: SearchParams = {
  page: 1,
  limit: 10,
};

const initialFilterOptions: FilterOptions = {
  schools: [],
  classes: [],
};

export const useStudentFilterStore = create<StudentFilterState>()(
  persist(
    (set, get) => ({
      searchParams: initialSearchParams,
      students: [],
      originalStudents: [],
      filterOptions: initialFilterOptions,
      schoolStats: null,
      totalStudents: 0,
      totalPages: 1,
      selectedLgaName: "",
      selectedSchoolName: "",

      setSearchParams: (params) =>
        set((state) => ({
          searchParams:
            typeof params === "function" ? params(state.searchParams) : params,
        })),

      setStudents: (students) => set({ students }),

      setOriginalStudents: (originalStudents) => set({ originalStudents }),

      setFilterOptions: (options) =>
        set((state) => ({
          filterOptions:
            typeof options === "function"
              ? options(state.filterOptions)
              : options,
        })),

      setSchoolStats: (schoolStats) => set({ schoolStats }),

      setTotalStudents: (totalStudents) => set({ totalStudents }),

      setTotalPages: (totalPages) => set({ totalPages }),

      setSelectedLgaName: (selectedLgaName) => set({ selectedLgaName }),

      setSelectedSchoolName: (selectedSchoolName) => set({ selectedSchoolName }),

      resetFilters: () =>
        set(() => ({
          searchParams: initialSearchParams,
          filterOptions: initialFilterOptions,
          schoolStats: null,
          students: [],
          totalStudents: 0,
          totalPages: 1,
          selectedLgaName: "",
          selectedSchoolName: "",
        })),
    }),
    {
      name: "subeb_student_filter_storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
