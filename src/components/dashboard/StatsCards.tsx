import React from "react";
import {
  Map,
  School,
  Users,
  SquareSigma,
  SquareLibrary,
  VenusAndMars,
} from "lucide-react";
import { AdminDashboardData } from "@/services/types/adminDashboardResponse";

interface StatsCardsProps {
  dashboardData: AdminDashboardData | null;
}

const StatsCards: React.FC<StatsCardsProps> = ({ dashboardData }) => {
  // Use real API data from the new structure
  const summary = dashboardData?.summary;
  const totalStudents = summary?.totalStudents || 0;
  const maleStudents = summary?.totalMale || 0;
  const femaleStudents = summary?.totalFemale || 0;
  const totalLgas = summary?.totalLgas || 0;
  const totalSchools = summary?.totalSchools || 0;

  // Session & Term Card
  const SessionTermCard = () => (
    <div className="bg-brand-accent rounded-xl p-6 hover:opacity-90 transition-all duration-300 group shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brand-accent-contrast text-lg font-semibold">
          Session & Term
        </h3>
        <SquareLibrary className="w-8 h-8 text-brand-accent-contrast" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-brand-accent-contrast/80 text-sm font-medium">
            Session
          </p>
          <p className="text-brand-accent-contrast font-bold">
            {dashboardData?.currentSession?.name || "Not Set"}
          </p>
          {dashboardData?.currentSession?.isCurrent ? (
            <span className="inline-block mt-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
              Active
            </span>
          ) : (
            <span className="inline-block mt-1 px-3 py-1 bg-gray-500 text-white text-xs rounded-full font-medium">
              Inactive
            </span>
          )}
        </div>
        <div className="text-center border-l border-brand-accent-contrast/20">
          <p className="text-brand-accent-contrast/80 text-sm font-medium">
            Term
          </p>
          <p className="text-brand-accent-contrast font-bold">
            {dashboardData?.currentTerm?.name?.split("_")[0] || "Not Set"}
          </p>
          {dashboardData?.currentTerm?.isCurrent ? (
            <span className="inline-block mt-1 px-3 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
              Active
            </span>
          ) : (
            <span className="inline-block mt-1 px-3 py-1 bg-gray-500 text-white text-xs rounded-full font-medium">
              Inactive
            </span>
          )}
        </div>
      </div>
    </div>
  );

  // Combined Totals Card
  const TotalsCard = () => (
    <div className="bg-brand-primary rounded-xl p-6 hover:opacity-90 transition-all duration-300 group shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brand-primary-contrast text-lg font-semibold">
          Overview
        </h3>
        <SquareSigma className="w-8 h-8 text-brand-primary-contrast" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Map className="w-5 h-5 text-brand-primary-contrast/80" />
          </div>
          <p className="text-brand-primary-contrast/80 text-xs font-medium">
            LGAs
          </p>
          <p className="text-brand-primary-contrast text-xl font-bold">
            {totalLgas}
          </p>
        </div>
        <div className="text-center border-l border-r border-brand-primary-contrast/20">
          <div className="flex items-center justify-center mb-2">
            <School className="w-5 h-5 text-brand-primary-contrast/80" />
          </div>
          <p className="text-brand-primary-contrast/80 text-xs font-medium">
            Schools
          </p>
          <p className="text-brand-primary-contrast text-xl font-bold">
            {totalSchools}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Users className="w-5 h-5 text-brand-primary-contrast/80" />
          </div>
          <p className="text-brand-primary-contrast/80 text-xs font-medium">
            Students
          </p>
          <p className="text-brand-primary-contrast text-xl font-bold">
            {totalStudents}
          </p>
        </div>
      </div>
    </div>
  );

  // Students by Gender Card
  const GenderCard = () => (
    <div className="bg-brand-secondary rounded-xl p-6 hover:opacity-90 transition-all duration-300 group shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-brand-secondary-contrast text-lg font-semibold">
          Students by Gender
        </h3>
        <VenusAndMars className="w-8 h-8 text-brand-secondary-contrast" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-brand-secondary-contrast/80 text-sm font-medium">
            Male
          </p>
          <p className="text-brand-secondary-contrast text-lg font-bold">
            {maleStudents}
          </p>
          <p className="text-brand-secondary-contrast/70 text-xs">
            ({Math.round((maleStudents / totalStudents) * 100) || 0}%)
          </p>
        </div>
        <div className="text-center border-l border-brand-secondary-contrast/20">
          <p className="text-brand-secondary-contrast/80 text-sm font-medium">
            Female
          </p>
          <p className="text-brand-secondary-contrast text-lg font-bold">
            {femaleStudents}
          </p>
          <p className="text-brand-secondary-contrast/70 text-xs">
            ({Math.round((femaleStudents / totalStudents) * 100) || 0}%)
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SessionTermCard />
      <TotalsCard />
      <GenderCard />
    </div>
  );
};

export default StatsCards;
