import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { StaffPage } from "../../settings/pages/StaffPage";
import { StudentsPage } from "../../students/pages/StudentsPage";
import { DriversPage } from "../../transportation/pages/DriversPage";
import { graphqlRequest } from "../../../lib/graphqlClient";

// CSV Templates
const STUDENT_CSV_TEMPLATE = `FullName,AdmissionNumber,RollNumber,EnrollmentGrade,EnrollmentSection,Gender,BloodGroup,Address,MobileNo,Email,Password,FatherName,FatherMobile,FatherOccupation,MotherName,MotherMobile,MotherOccupation,GuardianName,GuardianRelationship,GuardianMobile
John Doe,ADM-001,1,Grade 9,A,Male,O+,123 Main St,9876543210,john@example.com,JohnPass1!,Robert Doe,9876543211,Engineer,Jane Doe,9876543212,Teacher,Robert Doe,Father,9876543211
Alice Smith,ADM-002,2,Grade 10,B,Female,A-,456 Elm St,9876543220,alice@example.com,AlicePass2!,Tom Smith,9876543221,Doctor,Mary Smith,9876543222,Writer,Mary Smith,Mother,9876543222`;

const STAFF_CSV_TEMPLATE = `FullName,Email,MobileNo,Role,Password,EmployeeId,Designation,Department,Qualifications,YearsExperience,WorkShift,BusRouteLabel,Address,QualifiedGrades,SubjectSpecializations,EnrollmentGrade,EnrollmentSection
Dr. Alan Turing,alan.turing@school.edu,9876543210,TEACHER,Turing123!,EMP-001,Senior Lecturer,Mathematics,PhD Computer Science,10,Morning (8:00 - 15:00),Yes - Route A,123 Science Way,Grade 9;Grade 10,Mathematics;Information Technology,Grade 9,A
Ada Lovelace,ada.lovelace@school.edu,9876543211,TEACHER,,EMP-002,Assistant Professor,Science,MSc Informatics,5,Morning (8:00 - 15:00),No,456 Analytical St,Grade 11;Grade 12,Physics;Chemistry,Grade 10,B`;

const DRIVER_CSV_TEMPLATE = `FullName,MobileNo,Password,LicenseNo,LicenseClass,YearsExperience,Address
John Driver,9876543210,Driver123!,DL-12345,Heavy Vehicle,8,123 Transport Way`;

const ALLOWED_DEPARTMENTS = [
  "Mathematics",
  "Science",
  "Languages",
  "Administration",
  "Student Affairs",
  "Humanities",
  "Arts",
  "Technology",
  "Sports"
];

const normalizeDepartment = (dept?: string): string | undefined => {
  if (!dept || !dept.trim()) return undefined;

  const clean = dept.trim().toLowerCase();
  
  if (clean.includes("math")) return "Mathematics";
  if (clean.includes("science") && !clean.includes("social")) return "Science";
  if (clean.includes("social") || clean.includes("history") || clean.includes("humanities") || clean.includes("geography") || clean.includes("civics")) return "Humanities";
  if (clean.includes("lang") || clean.includes("english") || clean.includes("hindi") || clean.includes("french") || clean.includes("spanish") || clean.includes("malayalam") || clean.includes("sanskrit")) return "Languages";
  if (clean.includes("admin")) return "Administration";
  if (clean.includes("tech") || clean.includes("it") || clean.includes("computer") || clean.includes("information")) return "Technology";
  if (clean.includes("art") || clean.includes("music") || clean.includes("fine")) return "Arts";
  if (clean.includes("sport") || clean.includes("physical") || clean.includes("pe") || clean.includes("gym")) return "Sports";
  if (clean.includes("student") || clean.includes("affair")) return "Student Affairs";

  const match = ALLOWED_DEPARTMENTS.find(d => d.toLowerCase() === clean);
  if (match) return match;

  return dept.trim().split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
};

const normalizeGrade = (gradeVal?: string): string | undefined => {
  if (!gradeVal || !gradeVal.trim()) return undefined;
  const trimmed = gradeVal.trim();
  
  const matchGradeX = trimmed.match(/^grade\s+(\d+)$/i);
  if (matchGradeX) {
    return `Grade ${matchGradeX[1]}`;
  }
  
  const matchNum = trimmed.match(/^(\d+)$/);
  if (matchNum) {
    return `Grade ${matchNum[1]}`;
  }
  
  const matchOrdinal = trimmed.match(/^(\d+)(?:st|nd|rd|th)?(?:\s+grade)?$/i);
  if (matchOrdinal) {
    return `Grade ${matchOrdinal[1]}`;
  }
  
  return trimmed;
};

// Basic CSV Parser
const parseCSV = (text: string): string[][] => {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line) => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    })
    .filter((row) => row.length > 0 && row.some((cell) => cell !== ""));
};

const escapeCSV = (val: string) => {
  if (val === undefined || val === null) return "";
  const stringVal = String(val);
  if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
    return `"${stringVal.replace(/"/g, '""')}"`;
  }
  return stringVal;
};

interface ImportResult {
  rowNumber: number;
  identifier: string;
  status: "success" | "failed";
  error?: string;
  originalRow: Record<string, string>;
  tempPassword?: string;
}

export const DirectoryPage = () => {
  const navigate = useNavigate();
  const { tab } = useParams();
  const activeTab = (tab as "staff" | "students" | "drivers") || "staff";

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const handleCreateAction = () => {
    if (activeTab === "students") {
      navigate("/directory/students/add");
    } else if (activeTab === "staff") {
      navigate("/directory/staff/add");
    } else if (activeTab === "drivers") {
      navigate("/directory/drivers/add");
    }
  };

  const downloadTemplate = (type: "staff" | "students" | "drivers") => {
    console.log("[downloadTemplate] Triggered for type:", type);
    let content = "";
    let filename = "";
    if (type === "students") {
      content = STUDENT_CSV_TEMPLATE;
      filename = "student_import_template.csv";
    } else if (type === "staff") {
      content = STAFF_CSV_TEMPLATE;
      filename = "staff_import_template.csv";
    } else {
      content = DRIVER_CSV_TEMPLATE;
      filename = "driver_import_template.csv";
    }
    console.log("[downloadTemplate] Filename:", filename, "Content length:", content.length);

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setImportStatus(null);
    setSelectedFile(file);
    setImportResults([]);
    setCsvHeaders([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseCSV(text);
        if (rows.length < 2) {
          setErrorMsg("The CSV file must contain a header row and at least one data row.");
          return;
        }

        const rawHeaders = rows[0];
        setCsvHeaders(rawHeaders);

        const headers = rawHeaders.map((h) => h.toLowerCase().replace(/\s/g, ""));
        const dataRows = rows.slice(1);

        const records = dataRows.map((row) => {
          const record: Record<string, string> = {};
          headers.forEach((header, idx) => {
            record[header] = row[idx] || "";
          });
          return record;
        });

        // Validate headers & basic fields depending on activeTab
        if (activeTab === "students") {
          const invalid = records.some(r => !r.fullname || !r.admissionnumber || !r.enrollmentgrade || !r.enrollmentsection);
          if (invalid) {
            setErrorMsg("Missing required columns: FullName, AdmissionNumber, EnrollmentGrade, or EnrollmentSection in one or more rows.");
            return;
          }
        } else if (activeTab === "staff") {
          const invalid = records.some(r => !r.fullname || !r.email || !r.mobileno);
          if (invalid) {
            setErrorMsg("Missing required columns: FullName, Email, or MobileNo in one or more rows.");
            return;
          }
        } else if (activeTab === "drivers") {
          const invalid = records.some(r => !r.fullname || !r.mobileno);
          if (invalid) {
            setErrorMsg("Missing required columns: FullName or MobileNo in one or more rows.");
            return;
          }
        }

        setParsedRecords(records);
      } catch (err) {
        setErrorMsg("Failed to parse CSV file. Ensure it is a valid comma-separated text file.");
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRecords.length === 0) return;
    setImporting(true);
    setImportStatus("Importing records...");
    setImportResults([]);
    const schoolId = localStorage.getItem("school_id") || "";

    const bulkCreateUsersMutation = `
      mutation BulkCreateUsers($inputs: [CreateUserDto!]!) {
        bulkCreateUsers(inputs: $inputs) {
          totalCount
          succeededCount
          failedCount
          results {
            rowNumber
            identifier
            status
            error
            tempPassword
          }
        }
      }
    `;

    try {
      // Fetch subjects to map names to database UUIDs
      let dbSubjects: { id: string; name: string }[] = [];
      try {
        const subjectsQuery = `
          query GetSubjects($schoolId: String!) {
            subjects(schoolId: $schoolId) {
              id
              name
            }
          }
        `;
        const subjectsData = await graphqlRequest<{ subjects: { id: string; name: string }[] }>(
          subjectsQuery,
          { schoolId }
        );
        dbSubjects = subjectsData.subjects || [];
      } catch (err) {
        console.error("Failed to fetch subjects for staff import mapping:", err);
      }

      const inputs = parsedRecords.map((r) => {
        let payload: any = {};

        const gradeVal = normalizeGrade(r.enrollmentgrade || r.grade);
        const sectionVal = (r.enrollmentsection || r.section || "").trim().toUpperCase();

        if (activeTab === "students") {
          const guardians = [];
          if (r.fathername) {
            guardians.push({
              relationship: "Father",
              fullName: r.fathername,
              mobileNo: r.fathermobile || undefined,
              occupation: r.fatheroccupation || undefined,
            });
          }
          if (r.mothername) {
            guardians.push({
              relationship: "Mother",
              fullName: r.mothername,
              mobileNo: r.mothermobile || undefined,
              occupation: r.motheroccupation || undefined,
            });
          }
          if (r.guardianname) {
            guardians.push({
              relationship: r.guardianrelationship || "Guardian",
              fullName: r.guardianname,
              mobileNo: r.guardianmobile || undefined,
            });
          }

          payload = {
            role: "STUDENT",
            name: r.fullname,
            admissionNumber: r.admissionnumber,
            rollNumber: r.rollnumber || undefined,
            enrollmentGrade: gradeVal,
            enrollmentSection: sectionVal || undefined,
            gender: r.gender || "Male",
            bloodGroup: r.bloodgroup || undefined,
            address: r.address || undefined,
            mobileNo: r.mobileno || undefined,
            email: r.email || undefined,
            password: r.password || undefined,
            schoolId,
            studentStatus: "ACTIVE",
            guardians,
          };
        } else if (activeTab === "staff") {
          const qGrades = r.qualifiedgrades
            ? r.qualifiedgrades.split(";").map((g: string) => g.trim()).filter(Boolean)
            : [];
          const sSpecs = r.subjectspecializations
            ? r.subjectspecializations.split(";").map((s: string) => s.trim()).filter(Boolean)
            : [];
          const mappedSpecs = sSpecs.map((name: string) => {
            const match = dbSubjects.find((sub) => sub.name.toLowerCase() === name.toLowerCase());
            return match ? match.id : name;
          });

          payload = {
            role: r.role?.toUpperCase() === "ADMIN" ? "ADMIN" : "TEACHER",
            name: r.fullname,
            email: r.email,
            mobileNo: r.mobileno,
            password: r.password || undefined,
            schoolId,
            employeeId: r.employeeid || undefined,
            designation: r.designation || undefined,
            department: normalizeDepartment(r.department || r.dept),
            qualifications: r.qualifications || undefined,
            yearsExperience: r.yearsexperience || undefined,
            portalAccessRole: r.portalaccessrole || undefined,
            workShift: r.workshift || undefined,
            busRouteLabel: r.busroutelabel || undefined,
            address: r.address || undefined,
            qualifiedGrades: qGrades,
            subjectSpecializations: mappedSpecs,
            enrollmentGrade: gradeVal,
            enrollmentSection: sectionVal || undefined,
          };
        } else if (activeTab === "drivers") {
          payload = {
            role: "DRIVER",
            name: r.fullname,
            mobileNo: r.mobileno,
            password: r.password || undefined,
            schoolId,
            driverLicenseNo: r.licenseno || undefined,
            licenseClass: r.licenseclass || undefined,
            yearsExperience: r.yearsexperience || undefined,
            address: r.address || undefined,
            driverStatus: "ACTIVE",
          };
        }

        return payload;
      });

      const response = await graphqlRequest<{
        bulkCreateUsers: {
          totalCount: number;
          succeededCount: number;
          failedCount: number;
          results: Array<{
            rowNumber: number;
            identifier: string;
            status: "SUCCESS" | "FAILED";
            error?: string;
            tempPassword?: string;
          }>;
        };
      }>(bulkCreateUsersMutation, { inputs });

      const { succeededCount, failedCount, results: backendResults } = response.bulkCreateUsers;

      // Map back to ImportResult structure
      const results: ImportResult[] = backendResults.map((res, idx) => ({
        rowNumber: res.rowNumber || idx + 2, // Spreadsheet matching index
        identifier: res.identifier,
        status: res.status === "SUCCESS" ? ("success" as const) : ("failed" as const),
        error: res.error || undefined,
        originalRow: parsedRecords[idx],
        tempPassword: res.tempPassword || undefined,
      }));

      setImportResults(results);

      if (failedCount === 0) {
        setImportStatus(`Success! Successfully imported all ${succeededCount} records.`);
      } else {
        setImportStatus(`Import Aborted! 0 records imported. The entire transaction was rolled back due to validation failures on ${failedCount} row(s).`);
      }
    } catch (err: any) {
      console.error("Bulk import failed:", err);
      setImportStatus(`Error: ${err.message || "An unexpected error occurred."}`);
    } finally {
      setImporting(false);
    }
  };

  const downloadFailedCSV = () => {
    const failedResults = importResults.filter((res) => res.status === "failed");
    if (failedResults.length === 0) return;

    const headers = csvHeaders.map((h) => h.toLowerCase().replace(/\s/g, ""));
    const rawHeaders = [...csvHeaders, "ErrorReason"];

    const csvRows = [];
    csvRows.push(rawHeaders.map(escapeCSV).join(","));

    failedResults.forEach((res) => {
      const rowValues = csvHeaders.map((_, idx) => {
        const normalizedKey = headers[idx];
        return res.originalRow[normalizedKey] || "";
      });
      rowValues.push(res.error || "Unknown error");
      csvRows.push(rowValues.map(escapeCSV).join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `failed_${activeTab}_import.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCredentialsCSV = () => {
    const succeededResults = importResults.filter((res) => res.status === "success");
    if (succeededResults.length === 0) return;

    const csvRows = [["FullName", "Email", "Password"].join(",")];

    succeededResults.forEach((res) => {
      const fullName = res.originalRow.fullname || "";
      const email = res.originalRow.email || res.identifier;
      const password = res.tempPassword || res.originalRow.password || "Autogenerated by Backend";
      csvRows.push([escapeCSV(fullName), escapeCSV(email), escapeCSV(password)].join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `imported_${activeTab}_credentials.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB]">
      <div className="shrink-0">
        <TopBar
          title="Student & Staff"
          subtitle="Manage students, teachers and institutional profiles"
          actions={
            <div className="flex gap-3">
              <button
                onClick={() => setShowBulkModal(true)}
                className="btn-outline gap-2"
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Import List
              </button>
            </div>
          }
        />

        {/* Bulk Import Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 bg-secondary/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-8 space-y-6 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-foreground text-2xl font-bold">Import {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} List</h3>
                  <p className="text-sm text-[#B0AFA8] font-medium mt-1">Upload CSV files to enroll multiple {activeTab} at once.</p>
                </div>
                <button 
                  onClick={() => {
                    setShowBulkModal(false);
                    setSelectedFile(null);
                    setParsedRecords([]);
                    setErrorMsg(null);
                    setImportStatus(null);
                    setImportResults([]);
                    setCsvHeaders([]);
                  }} 
                  className="size-10 rounded-full hover:bg-[#F7F8F4] flex items-center justify-center text-[#B0AFA8] transition-all" 
                  aria-label="Close modal"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Upload Drag & Drop Box */}
              <label className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-[#F7F8F4] group hover:border-primary transition-all cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
                <div className="size-16 rounded-3xl bg-white shadow-sm flex items-center justify-center text-[#B0AFA8] mb-4 group-hover:bg-primary group-hover:text-foreground transition-all">
                  <span className="material-symbols-outlined text-3xl">cloud_upload</span>
                </div>
                <p className="text-[15px] font-bold text-foreground">
                  {selectedFile ? selectedFile.name : "Select CSV file"}
                </p>
                <p className="text-[12px] text-[#B0AFA8] font-medium mt-1">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Supports .csv files (Max 10MB)"}
                </p>
              </label>

              {errorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-[12px] font-bold rounded-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-rose-600">error</span>
                  <p className="text-left leading-tight">{errorMsg}</p>
                </div>
              )}

              {importStatus && (
                <div className="space-y-4">
                  <div className={cn(
                    "p-4 border text-[12px] font-bold rounded-2xl flex items-center justify-between gap-3",
                    importResults.some(r => r.status === "failed") || importStatus.toLowerCase().includes("error")
                      ? "bg-rose-50 border-rose-100 text-rose-800"
                      : "bg-emerald-50 border-emerald-100 text-emerald-800"
                  )}>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "material-symbols-outlined",
                        importResults.some(r => r.status === "failed") || importStatus.toLowerCase().includes("error") ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {importResults.some(r => r.status === "failed") || importStatus.toLowerCase().includes("error") ? "error" : "check_circle"}
                      </span>
                      <p className="text-left leading-tight">{importStatus}</p>
                    </div>
                    {importResults.some(r => r.status === "failed") && (
                      <button
                        onClick={downloadFailedCSV}
                        className="text-[11px] font-bold text-rose-700 hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        Download Failed CSV
                      </button>
                    )}
                    {importResults.some(r => r.status === "success") && (
                      <button
                        type="button"
                        onClick={downloadCredentialsCSV}
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[14px]">vpn_key</span>
                        Download Credentials
                      </button>
                    )}
                  </div>

                  {importResults.some(r => r.status === "failed") && (
                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                      <div className="px-4 py-2 border-b border-slate-100 bg-[#F7F8F4] flex justify-between items-center">
                        <p className="text-[11px] font-bold text-foreground">Detailed Failure Log</p>
                        <p className="text-[10px] text-[#B0AFA8] font-bold">{importResults.filter(r => r.status === "failed").length} issues found</p>
                      </div>
                      <div className="max-h-36 overflow-y-auto px-4 py-2 space-y-1.5 divide-y divide-slate-100">
                        {importResults
                          .filter((res) => res.status === "failed")
                          .map((res, idx) => (
                            <div key={idx} className="text-[11px] leading-relaxed flex items-start gap-2 py-1 text-slate-700">
                              <span className="font-bold text-rose-600 shrink-0">Row {res.rowNumber}:</span>
                              <span className="font-bold shrink-0">{res.identifier}</span>
                              <span className="text-[#B0AFA8]">—</span>
                              <span className="text-slate-600">{res.error}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {parsedRecords.length > 0 && !importStatus && !errorMsg && (
                <div className="p-4 bg-blue-50/50 border border-blue-100 text-blue-800 text-[12px] font-bold rounded-2xl flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-600">info</span>
                  <p className="text-left leading-tight">Ready to import {parsedRecords.length} records successfully validated!</p>
                </div>
              )}

              {/* Template Download Option */}
              <div className="bg-[#F7F8F4] rounded-2xl p-5 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">download</span>
                  <div className="text-left">
                    <p className="text-[12px] font-bold text-foreground">Download Template</p>
                    <p className="text-[10px] text-[#B0AFA8] font-medium">Pre-formatted sheet</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => downloadTemplate(activeTab)} 
                  className="text-[11px] font-bold text-primary hover:underline"
                >
                  Download CSV
                </button>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-50">
                {importResults.length > 0 ? (
                  <button 
                    onClick={() => {
                      setShowBulkModal(false);
                      globalThis.location.reload();
                    }}
                    className="btn-primary flex-1"
                  >
                    Close & Refresh Directory
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setShowBulkModal(false);
                        setSelectedFile(null);
                        setParsedRecords([]);
                        setErrorMsg(null);
                        setImportStatus(null);
                        setImportResults([]);
                        setCsvHeaders([]);
                      }} 
                      className="btn-outline flex-1"
                      disabled={importing}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleImport}
                      disabled={parsedRecords.length === 0 || importing || !!errorMsg} 
                      className={cn(
                        "btn-primary flex-1",
                        (parsedRecords.length === 0 || importing || !!errorMsg) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {importing ? "Importing..." : `Import ${parsedRecords.length || ""} Records`}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
            <div className="flex gap-8 overflow-x-auto no-scrollbar">
              {[
                { id: "staff", label: "Staff", icon: "badge" },
                { id: "students", label: "Students", icon: "group" },
                { id: "drivers", label: "Drivers", icon: "local_shipping" },
              ].map((tabItem) => {
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => navigate(`/directory/${tabItem.id}`)}
                    className={cn(
                      "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-semibold tracking-tight transition-all relative shrink-0",
                      isActive ? "text-foreground" : "text-[#B0AFA8] hover:text-foreground/70"
                    )}
                  >
                    <span className={cn(
                      "material-symbols-outlined text-[20px] transition-all",
                      isActive ? "text-primary" : ""
                    )} style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                      {tabItem.icon}
                    </span>
                    {tabItem.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {activeTab === "staff" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <StaffPage
                  isHubChild
                  onAddStaff={handleCreateAction}
                />
              </div>
            )}
            {activeTab === "students" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <StudentsPage
                  isHubChild
                  onAddStudent={handleCreateAction}
                />
              </div>
            )}
            {activeTab === "drivers" && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                <DriversPage
                  isHubChild
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
