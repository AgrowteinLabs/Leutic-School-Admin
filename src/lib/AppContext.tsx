/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { graphqlRequest } from "./graphqlClient";

export interface AcademicTerm {
  name: string;
  startDate: string;
  endDate: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED";
  termsCount: number;
  terms: AcademicTerm[];
}

export interface SchoolProfile {
  id: string;
  name: string;
  schoolCode: string;
  address: string;
  contact: string;
  email: string;
  website: string;
  activeGrades: string[];
}

interface AppContextType {
  schoolProfile: SchoolProfile | null;
  activeAcademicYear: AcademicYear | null;
  academicYears: AcademicYear[];
  isLoading: boolean;
  refetchSchoolProfile: () => Promise<void>;
  refetchAcademicYears: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DEFAULT_FALLBACK_GRADES = [
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12"
];

const GET_SCHOOL_PROFILE = `
  query GetSchoolProfile($schoolId: ID!) {
    school(id: $schoolId) {
      id
      name
      schoolCode
      address
      contact
      email
      website
      activeGrades
    }
  }
`;

const GET_ACTIVE_YEAR = `
  query GetActiveYear($schoolId: String!) {
    activeAcademicYear(schoolId: $schoolId) {
      id
      name
      startDate
      endDate
      status
      termsCount
      terms {
        name
        startDate
        endDate
      }
    }
  }
`;

const LIST_ACADEMIC_YEARS = `
  query ListAcademicYears($schoolId: String!) {
    academicYears(schoolId: $schoolId) {
      id
      name
      status
      startDate
      endDate
      termsCount
      terms {
        name
        startDate
        endDate
      }
    }
  }
`;

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile | null>(null);
  const [activeAcademicYear, setActiveAcademicYear] = useState<AcademicYear | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSchoolProfile = useCallback(async () => {
    const schoolId = localStorage.getItem("school_id");
    if (!schoolId) {
      setSchoolProfile(null);
      return;
    }
    try {
      const data = await graphqlRequest<{ school: SchoolProfile }>(GET_SCHOOL_PROFILE, { schoolId });
      if (data?.school) {
        setSchoolProfile(data.school);
      }
    } catch (err) {
      console.error("[AppContext] Failed to fetch school profile:", err);
    }
  }, []);

  const fetchAcademicYears = useCallback(async () => {
    const schoolId = localStorage.getItem("school_id");
    if (!schoolId) {
      setActiveAcademicYear(null);
      setAcademicYears([]);
      return;
    }
    try {
      const activeRes = await graphqlRequest<{ activeAcademicYear: AcademicYear | null }>(GET_ACTIVE_YEAR, { schoolId });
      const yearsRes = await graphqlRequest<{ academicYears: AcademicYear[] }>(LIST_ACADEMIC_YEARS, { schoolId });
      
      setActiveAcademicYear(activeRes?.activeAcademicYear || null);
      setAcademicYears(yearsRes?.academicYears || []);
    } catch (err) {
      console.error("[AppContext] Failed to fetch academic years:", err);
    }
  }, []);

  const refetchAll = useCallback(async () => {
    setIsLoading(true);
    await Promise.allSettled([fetchSchoolProfile(), fetchAcademicYears()]);
    setIsLoading(false);
  }, [fetchSchoolProfile, fetchAcademicYears]);

  useEffect(() => {
    let lastSchoolId = localStorage.getItem("school_id");
    if (lastSchoolId) {
      refetchAll();
    } else {
      setIsLoading(false);
    }

    const interval = setInterval(() => {
      const currentSchoolId = localStorage.getItem("school_id");
      if (currentSchoolId !== lastSchoolId) {
        lastSchoolId = currentSchoolId;
        if (currentSchoolId) {
          refetchAll();
        } else {
          setSchoolProfile(null);
          setActiveAcademicYear(null);
          setAcademicYears([]);
        }
      }
    }, 1000);

    const handleStorageChange = () => {
      const currentId = localStorage.getItem("school_id");
      if (currentId !== lastSchoolId) {
        lastSchoolId = currentId;
        if (currentId) {
          refetchAll();
        } else {
          setSchoolProfile(null);
          setActiveAcademicYear(null);
          setAcademicYears([]);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refetchAll]);

  return (
    <AppContext.Provider
      value={{
        schoolProfile,
        activeAcademicYear,
        academicYears,
        isLoading,
        refetchSchoolProfile: fetchSchoolProfile,
        refetchAcademicYears: fetchAcademicYears,
        refetchAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
