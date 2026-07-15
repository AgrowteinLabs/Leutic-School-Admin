import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { ClassCard } from "../../dashboard/components/ClassCard";
import { AppDropdown } from "../../../components/AppDropdown";
import { useState, useEffect, useMemo } from "react";
import { TablePagination } from "../../../components/TablePagination";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { useApp } from "../../../lib/AppContext";
import { cn } from "../../../lib/utils";

interface ClassData {
  id: string;
  grade: string;
  section: string;
  room: string;
  status: string;
  statusType: "normal" | "attention" | "risk";
  teacher: string;
  students: number;
  participation: number;
}

interface GraphQLClass {
  id: string;
  schoolId: string;
  grade: string;
  section?: string;
  displayLabel?: string;
  classTeacherId?: string;
  roomNumber?: string;
  shift?: string;
  capacity?: number;
  studentCount?: number;
}

interface GraphQLUser {
  id: string;
  name: string;
}

interface ImportResult {
  rowNumber: number;
  identifier: string;
  status: "success" | "failed";
  error?: string;
  originalRow: Record<string, string>;
}

// CSV Template
const CLASS_CSV_TEMPLATE = `Grade,Section,RoomNumber,Capacity,Shift,ClassTeacher
Grade 9,A,Room 101,40,Morning,Dr. Alan Turing
Grade 9,B,Room 102,40,Morning,Ada Lovelace
Grade 10,A,Room 201,35,Morning,`;

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

const mapShiftToEnum = (s?: string) => {
  if (!s) return "MORNING";
  const clean = s.trim().toUpperCase();
  if (clean.includes("NOON")) return "NOON";
  return "MORNING";
};

export const ClassesPage = () => {
  const navigate = useNavigate();
  const { activeAcademicYear } = useApp();
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [teachers, setTeachers] = useState<GraphQLUser[]>([]);    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

  // Bulk Import State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRecords, setParsedRecords] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    const schoolId = localStorage.getItem("school_id") || "";
    
    const classesQuery = `
      query GetClasses($schoolId: String, $academicYearId: String) {
        classes(filter: { schoolId: $schoolId, academicYearId: $academicYearId }, page: 1, pageSize: 100) {
          items {
            id
            schoolId
            grade
            section
            displayLabel
            classTeacherId
            roomNumber
            shift
            capacity
            studentCount
          }
        }
      }
    `;
    
    const teachersQuery = `
      query GetTeachers($schoolId: ID) {
        users(filter: { role: "TEACHER", schoolId: $schoolId, page: 1, pageSize: 200 }) {
          items {
            id
            name
          }
        }
      }
    `;
    
    try {
      const results = await Promise.allSettled([
        graphqlRequest<{ classes: { items: GraphQLClass[] } }>(classesQuery, { 
          schoolId: schoolId || undefined,
          academicYearId: activeAcademicYear?.id || undefined
        }),
        graphqlRequest<{ users: { items: GraphQLUser[] } }>(teachersQuery, { schoolId: schoolId || undefined })
      ]);
      
      let loadedClasses: GraphQLClass[] = [];
      let loadedTeachers: GraphQLUser[] = [];
      
      if (results[0].status === "fulfilled") {
        loadedClasses = results[0].value.classes?.items || [];
      } else {
        console.error("Classes load failed:", results[0].reason);
      }
      
      if (results[1].status === "fulfilled") {
        loadedTeachers = results[1].value.users?.items || [];
        setTeachers(loadedTeachers);
      } else {
        console.error("Teachers load failed:", results[1].reason);
      }
      
      const teacherMap = new Map(loadedTeachers.map(t => [t.id, t.name]));
      
      // Fetch real attendance data for each class in parallel
      const today = new Date().toISOString().split("T")[0];
      const attendanceSummaryQuery = `
        query ClassAttendanceSummary($classId: ID!, $date: String!) {
          classAttendanceSummary(classId: $classId, date: $date) {
            averageAttendancePercentage
          }
        }
      `;
      
      const attendanceResults = await Promise.allSettled(
        loadedClasses.map(c =>
          graphqlRequest<{ classAttendanceSummary: { averageAttendancePercentage: number } }>(
            attendanceSummaryQuery,
            { classId: c.id, date: today }
          )
        )
      );
      
      const attMap = new Map<string, number>();
      attendanceResults.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value?.classAttendanceSummary) {
          attMap.set(loadedClasses[index].id, result.value.classAttendanceSummary.averageAttendancePercentage);
        }
      });

      const mappedClasses = loadedClasses.map((c: GraphQLClass) => {
        const room = c.roomNumber || "Room TBD";
        const teacherName = c.classTeacherId ? (teacherMap.get(c.classTeacherId) || "No Teacher Assigned") : "No Teacher Assigned";
        const studentCount = c.studentCount || 0;
        
        // Use real attendance data from backend, -1 means no data available yet
        const participation = attMap.get(c.id) ?? -1;
        
        // Dynamically assign status level based on attendance percentage
        const statusType = participation === -1 ? "normal" as const : participation < 70 ? "risk" as const : participation < 85 ? "attention" as const : "normal" as const;
        const status = participation === -1 ? "No Data" : statusType === "risk" ? "At Risk" : statusType === "attention" ? "Need Attention" : "Normal";
        
        return {
          id: c.id,
          grade: c.grade,
          section: c.section || "A",
          room: room,
          status,
          statusType,
          teacher: teacherName,
          students: studentCount,
          participation,
        };
      });
      
      setClasses(mappedClasses);
    } catch (err: unknown) {
      console.error("Error fetching class data:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to fetch class data";
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchesSearch =
        cls.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.room.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGrade =
        selectedGrade === "" || cls.grade.toLowerCase().includes(selectedGrade.toLowerCase());
      
      const matchesSection =
        selectedSection === "" || cls.section.toLowerCase() === selectedSection.toLowerCase();
        
      return matchesSearch && matchesGrade && matchesSection;
    });
  }, [classes, searchTerm, selectedGrade, selectedSection]);

  const paginatedClasses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredClasses.slice(start, start + itemsPerPage);
  }, [filteredClasses, currentPage, itemsPerPage]);

  const downloadTemplate = () => {
    const blob = new Blob([CLASS_CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "class_import_template.csv");
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

        // Validate basic headers
        const invalid = records.some(r => !r.grade || !r.section);
        if (invalid) {
          setErrorMsg("Missing required columns: Grade or Section in one or more rows.");
          return;
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
    setImportStatus("Importing classes...");
    setImportResults([]);
    const schoolId = localStorage.getItem("school_id") || "";

    const bulkCreateClassesMutation = `
      mutation BulkCreateClasses($inputs: [CreateClassDto!]!) {
        bulkCreateClasses(inputs: $inputs) {
          totalCount
          succeededCount
          failedCount
          results {
            rowNumber
            identifier
            status
            error
          }
        }
      }
    `;

    const batchAssignedTeachers = new Set<string>();
    const clientValidationErrors: Array<{ rowNumber: number; identifier: string; error: string }> = [];

    parsedRecords.forEach((r, idx) => {
      const rowNumber = idx + 2;
      const identifier = `${r.grade || "Unknown Grade"} - ${r.section || "Unknown Section"}`;

      if (!r.grade || !r.section) {
        clientValidationErrors.push({
          rowNumber,
          identifier,
          error: "Missing required columns: Grade or Section in this row.",
        });
        return;
      }

      const teacherName = (r.classteacher || r.teacher || "").trim();
      if (teacherName) {
        const teacherNameLower = teacherName.toLowerCase();

        // 1. Existence check
        const matchedTeacher = teachers.find(
          (t) => t.name.trim().toLowerCase() === teacherNameLower
        );
        if (!matchedTeacher) {
          clientValidationErrors.push({
            rowNumber,
            identifier,
            error: `Teacher '${teacherName}' not found in this school. Please check spelling.`,
          });
          return;
        }

        // 2. Duplicate check within CSV batch
        if (batchAssignedTeachers.has(teacherNameLower)) {
          clientValidationErrors.push({
            rowNumber,
            identifier,
            error: `Teacher '${teacherName}' is assigned to multiple classes in this import batch.`,
          });
          return;
        }
        batchAssignedTeachers.add(teacherNameLower);

        // 3. Duplicate check against existing classes in school
        const existingClass = classes.find(
          (c) => c.teacher && c.teacher.trim().toLowerCase() === teacherNameLower && c.teacher.trim().toLowerCase() !== "no teacher assigned"
        );
        if (existingClass) {
          clientValidationErrors.push({
            rowNumber,
            identifier,
            error: `Teacher '${teacherName}' is already assigned to existing class '${existingClass.grade} - ${existingClass.section}'.`,
          });
          return;
        }
      }
    });

    if (clientValidationErrors.length > 0) {
      // Create results mapping simulating transaction abort for all rows
      const results: ImportResult[] = parsedRecords.map((r, idx) => {
        const rowNumber = idx + 2;
        const identifier = `${r.grade || "Unknown Grade"} - ${r.section || "Unknown Section"}`;
        const selfError = clientValidationErrors.find((e) => e.rowNumber === rowNumber);

        return {
          rowNumber,
          identifier,
          status: "failed" as const,
          error: selfError ? selfError.error : "Transaction aborted due to validation failure on other rows.",
          originalRow: r,
        };
      });

      setImportResults(results);
      setImportStatus(`Import Aborted! 0 classes imported. The entire transaction was rolled back due to ${clientValidationErrors.length} validation error(s).`);
      setImporting(false);
      return;
    }

    try {
      const inputs = parsedRecords.map((r) => {
        const teacherName = (r.classteacher || r.teacher || "").trim();
        const matchedTeacher = teacherName
          ? teachers.find((t) => t.name.trim().toLowerCase() === teacherName.toLowerCase())
          : undefined;

        return {
          schoolId,
          grade: r.grade,
          section: r.section,
          academicYearId: activeAcademicYear?.id || "",
          capacity: r.capacity ? Number.parseInt(r.capacity, 10) : undefined,
          shift: mapShiftToEnum(r.shift),
          roomNumber: r.roomnumber || r.room || undefined,
          classTeacherId: matchedTeacher ? matchedTeacher.id : undefined,
        };
      });

      const response = await graphqlRequest<{
        bulkCreateClasses: {
          totalCount: number;
          succeededCount: number;
          failedCount: number;
          results: Array<{
            rowNumber: number;
            identifier: string;
            status: "SUCCESS" | "FAILED";
            error?: string;
          }>;
        };
      }>(bulkCreateClassesMutation, { inputs });

      const { succeededCount, failedCount, results: backendResults } = response.bulkCreateClasses;

      // Map back to ImportResult structure
      const results: ImportResult[] = backendResults.map((res, idx) => ({
        rowNumber: res.rowNumber || idx + 2, // Spreadsheet matching index
        identifier: res.identifier,
        status: res.status === "SUCCESS" ? ("success" as const) : ("failed" as const),
        error: res.error || undefined,
        originalRow: parsedRecords[idx],
      }));

      setImportResults(results);

      if (failedCount === 0) {
        setImportStatus(`Success! Successfully imported all ${succeededCount} classes.`);
        setTimeout(() => {
          setShowBulkModal(false);
          setSelectedFile(null);
          setParsedRecords([]);
          setImportResults([]);
          setImportStatus(null);
          loadData();
        }, 1500);
      } else {
        setImportStatus(`Import Aborted! 0 classes imported. The entire transaction was rolled back due to validation failures on ${failedCount} row(s).`);
      }
    } catch (err: any) {
      console.error("Bulk class import failed:", err);
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

    const escapeCSV = (val: string) => {
      if (val === undefined || val === null) return "";
      const stringVal = String(val);
      if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    };

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
    link.setAttribute("download", "failed_classes_import.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  let gridContent;
  if (isLoading) {
    gridContent = (
      <div className="flex flex-col items-center justify-center py-20 text-[#B0AFA8]">
        <span className="material-symbols-outlined text-5xl animate-spin">sync</span>
        <p className="mt-4 text-[14px] font-bold">Loading classes...</p>
      </div>
    );
  } else if (error) {
    gridContent = (
      <div className="flex flex-col items-center justify-center py-20 text-red-500">
        <span className="material-symbols-outlined text-5xl">error</span>
        <p className="mt-4 text-[14px] font-bold">{error}</p>
      </div>
    );
  } else if (filteredClasses.length === 0) {
    gridContent = (
      <div className="flex flex-col items-center justify-center py-20 text-[#B0AFA8]">
        <span className="material-symbols-outlined text-5xl">domain_disabled</span>
        <p className="mt-4 text-[14px] font-bold">No classes found</p>
      </div>
    );
  } else {
    gridContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedClasses.map((cls) => (
          <ClassCard
            key={cls.id}
            {...cls}
            onClick={() => navigate(`/classes/${cls.id}`)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB]">
      <TopBar
        title="Classes"
        subtitle="Overview of all active grade levels and sections."
        actions={
          <div className="flex gap-3">
            <button 
              onClick={() => setShowBulkModal(true)} 
              className="btn-outline h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all"
            >
              <span className="material-symbols-outlined text-lg">upload_file</span>
              Import Classes
            </button>
            <button className="btn-outline h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all">
              <span className="material-symbols-outlined text-lg">file_download</span>
              Export List
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
                <h3 className="text-foreground text-2xl font-bold">Import Classes List</h3>
                <p className="text-sm text-[#B0AFA8] font-medium mt-1">Upload CSV files to create multiple classes at once.</p>
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
                <p className="text-left leading-tight">Ready to import {parsedRecords.length} classes successfully validated!</p>
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
                onClick={downloadTemplate} 
                className="text-[11px] font-bold text-primary hover:underline"
              >
                Download CSV
              </button>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-50">
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
                {importing ? "Importing..." : `Import ${parsedRecords.length || ""} Classes`}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10 py-8 space-y-8">
          {/* Flat Architectural Search and Filters */}
          <div className="flex flex-wrap gap-3 items-center py-2">
            <div className="flex-1 min-w-[350px]">
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#B0AFA8] group-focus-within:text-primary transition-colors text-lg">search</span>
                <input
                  className="w-full bg-[#F7F8F4] border border-slate-100 rounded-[10px] pl-11 pr-4 h-10 text-[14px] font-medium text-foreground placeholder-[#B0AFA8] placeholder:font-medium focus:border-primary/40 focus:ring-4 focus:ring-primary/5 focus:bg-white focus:shadow-none outline-none transition-all"
                  placeholder="Search classes, teachers, or schedules..."
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <AppDropdown
                options={["Grade 9", "Grade 10", "Grade 11", "Grade 12"]}
                value={selectedGrade}
                onChange={setSelectedGrade}
                width="w-44"
                placeholder="Grade Level"
              />

              <AppDropdown
                options={["A", "B", "C", "D"]}
                value={selectedSection}
                onChange={setSelectedSection}
                width="w-32"
                placeholder="Section"
              />

              <button className="h-10 w-10 bg-[#F7F8F4] border border-slate-100 rounded-[10px] flex items-center justify-center text-[#B0AFA8] hover:text-primary hover:bg-white hover:border-primary/30 transition-all outline-none shadow-none focus:shadow-none">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>

              <button
                onClick={() => navigate("/classes/create")}
                className="btn-primary h-10 px-6 rounded-[10px] text-[13px] font-bold flex items-center gap-2 transition-all shadow-sm shadow-slate-100/30 ml-auto"
              >
                <span className="material-symbols-outlined text-[20px]">add_circle</span>
                New Class
              </button>
            </div>
          </div>

          {/* Classes Grid */}
          {gridContent}

          <TablePagination
            totalItems={filteredClasses.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(count) => {
              setItemsPerPage(count);
              setCurrentPage(1);
            }}
            itemName="classes"
          />
        </div>
      </div>
    </div>
  );
};
