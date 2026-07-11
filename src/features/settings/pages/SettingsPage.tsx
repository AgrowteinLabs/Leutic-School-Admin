import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { useApp } from "../../../lib/AppContext";
import { graphqlRequest } from "../../../lib/graphqlClient";
import { PDSFormGroup } from "../../../components/pds/PDSFormGroup";
import { PDSButton } from "../../../components/pds/PDSButton";
import { AnimatePresence, motion } from "framer-motion";

const UPDATE_SCHOOL = `
  mutation UpdateSchool($id: ID!, $input: UpdateSchoolDto!) {
    updateSchool(id: $id, updateSchoolInput: $input) {
      id
      name
      schoolCode
      address
      contact
      email
      website
    }
  }
`;

export const SettingsPage = () => {
    const navigate = useNavigate();
    const { schoolProfile, refetchSchoolProfile } = useApp();
    const [fontSize, setFontSize] = useState(localStorage.getItem('pds-font-size') || 'theme-small');
    const [darkMode, setDarkMode] = useState(localStorage.getItem('pds-dark-mode') === 'true');
    const [highContrast, setHighContrast] = useState(localStorage.getItem('pds-high-contrast') === 'true');
    const [reducedMotion, setReducedMotion] = useState(localStorage.getItem('pds-reduced-motion') === 'true');

    // Edit School Profile States
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [schoolName, setSchoolName] = useState("");
    const [schoolCode, setSchoolCode] = useState("");
    const [contact, setContact] = useState("");
    const [email, setEmail] = useState("");
    const [website, setWebsite] = useState("");
    const [address, setAddress] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const openEditModal = () => {
        if (schoolProfile) {
            setSchoolName(schoolProfile.name || "");
            setSchoolCode(schoolProfile.schoolCode || "");
            setContact(schoolProfile.contact || "");
            setEmail(schoolProfile.email || "");
            setWebsite(schoolProfile.website || "");
            setAddress(schoolProfile.address || "");
        }
        setSaveError(null);
        setIsEditOpen(true);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const schoolId = localStorage.getItem("school_id");
        if (!schoolId) return;

        setIsSaving(true);
        setSaveError(null);
        try {
            await graphqlRequest(UPDATE_SCHOOL, {
                id: schoolId,
                input: {
                    name: schoolName,
                    schoolCode,
                    contact,
                    email,
                    website,
                    address
                }
            });
            await refetchSchoolProfile();
            setIsEditOpen(false);
        } catch (err) {
            console.error("Failed to update school profile:", err);
            setSaveError(err instanceof Error ? err.message : "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    // Apply accessibility preferences to the document
    const applyAccessibilityPrefs = (prefs: { dark?: boolean; contrast?: boolean; motion?: boolean }) => {
        if (prefs.dark !== undefined) {
            document.documentElement.classList.toggle('dark', prefs.dark);
        }
        if (prefs.contrast !== undefined) {
            document.documentElement.classList.toggle('high-contrast', prefs.contrast);
        }
        if (prefs.motion !== undefined) {
            document.documentElement.classList.toggle('reduce-motion', prefs.motion);
        }
    };

    // Initialize all accessibility preferences on mount
    useEffect(() => {
        applyAccessibilityPrefs({
            dark: darkMode,
            contrast: highContrast,
            motion: reducedMotion
        });
    }, []);

    const handleFontSizeChange = (size: string) => {
        setFontSize(size);
        localStorage.setItem('pds-font-size', size);
        
        // Remove all theme classes first
        const themes = ['theme-small', 'theme-medium', 'theme-large', 'theme-xl'];
        themes.forEach(t => document.documentElement.classList.remove(t));
        
        // Add selected theme
        document.documentElement.classList.add(size);
    };

    const handleDarkModeToggle = () => {
        const newVal = !darkMode;
        setDarkMode(newVal);
        localStorage.setItem('pds-dark-mode', String(newVal));
        document.documentElement.classList.toggle('dark', newVal);
    };

    const handleHighContrastToggle = () => {
        const newVal = !highContrast;
        setHighContrast(newVal);
        localStorage.setItem('pds-high-contrast', String(newVal));
        document.documentElement.classList.toggle('high-contrast', newVal);
    };

    const handleReducedMotionToggle = () => {
        const newVal = !reducedMotion;
        setReducedMotion(newVal);
        localStorage.setItem('pds-reduced-motion', String(newVal));
        document.documentElement.classList.toggle('reduce-motion', newVal);
    };

    const sizeOptions = [
        { id: 'theme-small', label: 'Small', desc: 'Compact view' },
        { id: 'theme-medium', label: 'Medium', desc: 'Default comfort' },
        { id: 'theme-large', label: 'Large', desc: 'High visibility' },
        { id: 'theme-xl', label: 'Extra Large', desc: 'Maximum clarity' },
    ];

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#FDFCFB] font-sans">
            <TopBar 
                title="System Settings" 
                subtitle="Manage institutional preferences and display configurations"
            />

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-12">
                    
                    <div className="space-y-12">
                        {/* Section 1: Institutional Profile */}
                        <div className="space-y-6">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[20px] font-bold text-foreground tracking-tight">Institutional Profile</h2>
                                <p className="text-[13px] font-medium text-[#B0AFA8]">Update basic school details and academic structures</p>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-w-3xl">
                                {/* School Info Row */}
                                <div className="p-6 flex items-center justify-between group hover:bg-[#F7F8F4]/30 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="size-11 rounded-xl bg-slate-50 flex items-center justify-center text-[#B0AFA8] group-hover:bg-[#152328]/5 group-hover:text-[#152328] transition-all duration-300">
                                            <span className="material-symbols-outlined text-[22px]">school</span>
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-foreground">School Information</p>
                                            <p className="text-[12px] text-[#B0AFA8] font-medium mt-0.5">
                                                {schoolProfile ? `${schoolProfile.name} • ${schoolProfile.schoolCode}` : "Manage logo, address and contact details"}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={openEditModal}
                                        className="px-4 h-9 rounded-xl border border-slate-200 text-[11.5px] font-bold text-foreground hover:bg-slate-50 transition-colors shrink-0"
                                    >
                                        Edit Profile
                                    </button>
                                </div>

                                {/* Grade Setup Row */}
                                <div className="p-6 flex items-center justify-between group hover:bg-[#F7F8F4]/30 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="size-11 rounded-xl bg-slate-50 flex items-center justify-center text-[#B0AFA8] group-hover:bg-[#152328]/5 group-hover:text-[#152328] transition-all duration-300">
                                            <span className="material-symbols-outlined text-[22px]">tune</span>
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-foreground">Grade & Grading Setup</p>
                                            <p className="text-[12px] text-[#B0AFA8] font-medium mt-0.5">Configure active class levels and scoring boundaries</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate("/settings/grades")} 
                                        className="px-4 h-9 rounded-xl border border-slate-200 text-[11.5px] font-bold text-foreground hover:bg-slate-50 transition-colors shrink-0"
                                    >
                                        Configure Setup
                                    </button>
                                </div>

                                {/* Academic Year / Rollover Setup Row */}
                                <div className="p-6 flex items-center justify-between group hover:bg-[#F7F8F4]/30 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="size-11 rounded-xl bg-slate-50 flex items-center justify-center text-[#B0AFA8] group-hover:bg-[#152328]/5 group-hover:text-[#152328] transition-all duration-300">
                                            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-bold text-foreground">Academic Cycle & Rollover</p>
                                            <p className="text-[12px] text-[#B0AFA8] font-medium mt-0.5">Manage academic years, terms, and execute rollover cycles</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => navigate("/settings/academic-years")} 
                                        className="px-4 h-9 rounded-xl bg-[#152328] text-[11.5px] font-bold text-[#D9EA85] hover:bg-[#1E353D] transition-colors shrink-0"
                                    >
                                        Manage Cycles
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Display & Accessibility */}
                        <div className="pt-12 border-t border-slate-100 space-y-8">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[20px] font-bold text-foreground tracking-tight">Display & Accessibility</h2>
                                <p className="text-[13px] font-medium text-[#B0AFA8]">Customise the interface to match your visual comfort and accessibility needs</p>
                            </div>

                            {/* Font Size Selector */}
                            <div className="space-y-4 max-w-4xl">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">text_fields</span>
                                    <span className="text-[12px] font-bold text-[#B0AFA8] uppercase tracking-wider">Font Size</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {sizeOptions.map((opt) => (
                                        <button 
                                            key={opt.id}
                                            onClick={() => handleFontSizeChange(opt.id)}
                                            className={cn(
                                                "group relative flex flex-col items-start p-4 bg-white border rounded-[18px] transition-all duration-300 hover:shadow-md hover:border-slate-200",
                                                fontSize === opt.id 
                                                    ? "border-[#152328] bg-[#F7F8F4] ring-4 ring-[#152328]/5 shadow-sm" 
                                                    : "border-slate-100"
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full mb-2">
                                                <div className="flex items-center gap-2.5">
                                                    <div className={cn(
                                                        "size-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                                        fontSize === opt.id ? "border-[#152328] bg-[#152328]" : "border-slate-300 bg-white"
                                                    )}>
                                                        {fontSize === opt.id && (
                                                            <div className="size-1.5 rounded-full bg-white" />
                                                        )}
                                                    </div>
                                                    <span className="text-[13px] font-bold text-foreground">{opt.label}</span>
                                                </div>
                                                <span className={cn(
                                                    "font-extrabold text-slate-400 group-hover:text-primary transition-colors select-none",
                                                    opt.id === 'theme-small' && "text-[11px]",
                                                    opt.id === 'theme-medium' && "text-[13px]",
                                                    opt.id === 'theme-large' && "text-[15px]",
                                                    opt.id === 'theme-xl' && "text-[17px]",
                                                )}>
                                                    Aa
                                                </span>
                                            </div>
                                            
                                            <p className="text-[10px] font-medium text-[#B0AFA8] text-left">{opt.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accessibility Toggles */}
                            <div className="space-y-4 max-w-4xl">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-[18px] text-[#B0AFA8]">accessibility_new</span>
                                    <span className="text-[12px] font-bold text-[#B0AFA8] uppercase tracking-wider">Accessibility Preferences</span>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                                    {/* Dark Mode */}
                                    <div className="p-5 flex items-center justify-between group hover:bg-[#F7F8F4]/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                darkMode 
                                                    ? "bg-[#152328] text-[#D9EA85]" 
                                                    : "bg-slate-50 text-[#B0AFA8] group-hover:bg-[#152328]/5 group-hover:text-[#152328]"
                                            )}>
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {darkMode ? "dark_mode" : "light_mode"}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-foreground">Dark Mode</p>
                                                <p className="text-[11px] text-[#B0AFA8] font-medium mt-0.5">
                                                    {darkMode ? "Reduced glare in low-light environments" : "Switch to a darker colour palette"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleDarkModeToggle}
                                            className={cn(
                                                "relative inline-flex h-7 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary/20",
                                                darkMode ? "bg-[#152328]" : "bg-slate-200"
                                            )}
                                            role="switch"
                                            aria-checked={darkMode}
                                            type="button"
                                        >
                                            <span
                                                className={cn(
                                                    "pointer-events-none inline-block size-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 ease-in-out",
                                                    darkMode ? "translate-x-4" : "translate-x-0"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {/* High Contrast */}
                                    <div className="p-5 flex items-center justify-between group hover:bg-[#F7F8F4]/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                highContrast 
                                                    ? "bg-[#152328] text-[#D9EA85]" 
                                                    : "bg-slate-50 text-[#B0AFA8] group-hover:bg-[#152328]/5 group-hover:text-[#152328]"
                                            )}>
                                                <span className="material-symbols-outlined text-[20px]">contrast</span>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-foreground">High Contrast</p>
                                                <p className="text-[11px] text-[#B0AFA8] font-medium mt-0.5">
                                                    {highContrast ? "Enhanced text and element visibility" : "Increase colour contrast for better readability"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleHighContrastToggle}
                                            className={cn(
                                                "relative inline-flex h-7 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary/20",
                                                highContrast ? "bg-[#152328]" : "bg-slate-200"
                                            )}
                                            role="switch"
                                            aria-checked={highContrast}
                                            type="button"
                                        >
                                            <span
                                                className={cn(
                                                    "pointer-events-none inline-block size-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 ease-in-out",
                                                    highContrast ? "translate-x-4" : "translate-x-0"
                                                )}
                                            />
                                        </button>
                                    </div>

                                    {/* Reduced Motion */}
                                    <div className="p-5 flex items-center justify-between group hover:bg-[#F7F8F4]/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "size-10 rounded-xl flex items-center justify-center transition-all duration-300",
                                                reducedMotion 
                                                    ? "bg-[#152328] text-[#D9EA85]" 
                                                    : "bg-slate-50 text-[#B0AFA8] group-hover:bg-[#152328]/5 group-hover:text-[#152328]"
                                            )}>
                                                <span className="material-symbols-outlined text-[20px]">animation</span>
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-bold text-foreground">Reduced Motion</p>
                                                <p className="text-[11px] text-[#B0AFA8] font-medium mt-0.5">
                                                    {reducedMotion ? "Animations and transitions are minimised" : "Minimise interface animations and transitions"}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleReducedMotionToggle}
                                            className={cn(
                                                "relative inline-flex h-7 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-primary/20",
                                                reducedMotion ? "bg-[#152328]" : "bg-slate-200"
                                            )}
                                            role="switch"
                                            aria-checked={reducedMotion}
                                            type="button"
                                        >
                                            <span
                                                className={cn(
                                                    "pointer-events-none inline-block size-6 rounded-full bg-white shadow-sm ring-0 transition-transform duration-300 ease-in-out",
                                                    reducedMotion ? "translate-x-4" : "translate-x-0"
                                                )}
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* School Profile Edit Drawer / Modal */}
            <AnimatePresence>
                {isEditOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end bg-secondary/40 backdrop-grayscale animate-in fade-in duration-300">
                        {/* Backdrop Click */}
                        <div className="absolute inset-0 cursor-pointer" onClick={() => setIsEditOpen(false)} />
                        
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 260 }}
                            className="relative w-full max-w-lg h-full bg-white shadow-2xl flex flex-col z-10"
                        >
                            {/* Header */}
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-[#FDFCFB]">
                                <div>
                                    <h3 className="text-[18px] font-bold text-foreground tracking-tight">Edit School Information</h3>
                                    <p className="text-[11px] text-[#B0AFA8] font-medium mt-0.5">Modify central institutional contact and structural details.</p>
                                </div>
                                <button onClick={() => setIsEditOpen(false)} className="p-2 hover:bg-[#F7F8F4] rounded-xl text-slate-400 hover:text-slate-600 transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">close</span>
                                </button>
                            </div>

                            {/* Form Body */}
                            <form className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-6" onSubmit={handleSaveProfile}>
                                {saveError && (
                                    <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold">
                                        {saveError}
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <PDSFormGroup 
                                        label="School Name" 
                                        placeholder="e.g. Luetic Public School" 
                                        value={schoolName} 
                                        onChange={setSchoolName} 
                                    />
                                    <PDSFormGroup 
                                        label="School Code" 
                                        placeholder="e.g. LPS-029" 
                                        value={schoolCode} 
                                        onChange={setSchoolCode} 
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <PDSFormGroup 
                                            label="Contact Number" 
                                            placeholder="e.g. +91 9876543210" 
                                            value={contact} 
                                            onChange={setContact} 
                                        />
                                        <PDSFormGroup 
                                            label="Email Address" 
                                            placeholder="e.g. admin@luetic.edu" 
                                            value={email} 
                                            onChange={setEmail} 
                                        />
                                    </div>
                                    <PDSFormGroup 
                                        label="Website URL" 
                                        placeholder="e.g. www.luetic.edu" 
                                        value={website} 
                                        onChange={setWebsite} 
                                    />
                                    <PDSFormGroup 
                                        label="Physical Address" 
                                        placeholder="Full address of the campus..." 
                                        value={address} 
                                        onChange={setAddress} 
                                    />
                                </div>

                                {/* Actions Footer inside Drawer */}
                                <div className="pt-6 border-t border-slate-100 flex gap-3 justify-end">
                                    <PDSButton variant="text" type="button" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                                        Cancel
                                    </PDSButton>
                                    <PDSButton variant="primary" type="submit" loading={isSaving}>
                                        Save Changes
                                    </PDSButton>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
