// Student interface for the application
export interface Student {
  id: string;
  schoolName: string;
  lga: string;
  studentName: string;
  examNumber: string;
  class: string;
  gender: 'Male' | 'Female';
  subjects: {
    english: number;
    maths: number;
    basicScience: number;
    socialStudies: number;
    culturalCreativeArts: number;
    crs: number;
    civic: number;
    igbo: number;
    computerStudies: number;
    agriculturalScience: number;
    homeEconomics: number;
    physicalHealthEducation: number;
  };
  totalScore: number;
  averageScore: number;
  position: number;
}

// Subject names mapping
export const subjectNames = {
  english: 'English Language',
  maths: 'Mathematics',
  basicScience: 'Basic Science',
  socialStudies: 'Social Studies',
  culturalCreativeArts: 'Cultural & Creative Arts',
  crs: 'Christian Religious Studies',
  civic: 'Civic Education',
  igbo: 'Igbo Language',
  computerStudies: 'Computer Studies',
  agriculturalScience: 'Agricultural Science',
  homeEconomics: 'Home Economics',
  physicalHealthEducation: 'Physical & Health Education'
}; 