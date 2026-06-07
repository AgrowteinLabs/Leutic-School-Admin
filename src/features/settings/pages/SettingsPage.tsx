import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";

export const SettingsPage = () => {
    const navigate = useNavigate();
    const [fontSize, setFontSize] = useState(localStorage.getItem('pds-font-size') || 'theme-small');

    const handleFontSizeChange = (size: string) => {
        setFontSize(size);
        localStorage.setItem('pds-font-size', size);
        
        // Remove all theme classes first
        const themes = ['theme-small', 'theme-medium', 'theme-large', 'theme-xl'];
        themes.forEach(t => document.documentElement.classList.remove(t));
        
        // Add selected theme
        document.documentElement.classList.add(size);
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
                                            <p className="text-[12px] text-[#B0AFA8] font-medium mt-0.5">Manage logo, address and contact details</p>
                                        </div>
                                    </div>
                                    <button className="px-4 h-9 rounded-xl border border-slate-200 text-[11.5px] font-bold text-foreground hover:bg-slate-50 transition-colors shrink-0">
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
                                        className="px-4 h-9 rounded-xl bg-[#152328] text-[11.5px] font-bold text-[#D9EA85] hover:bg-[#1E353D] transition-colors shrink-0"
                                    >
                                        Configure Setup
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Display & Accessibility */}
                        <div className="pt-12 border-t border-slate-100 space-y-6">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[20px] font-bold text-foreground tracking-tight">Display & Accessibility</h2>
                                <p className="text-[13px] font-medium text-[#B0AFA8]">Adjust the interface font size for your visual comfort</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl">
                                {sizeOptions.map((opt) => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => handleFontSizeChange(opt.id)}
                                        className={cn(
                                            "group relative flex flex-col items-start p-5 bg-white border rounded-[22px] transition-all duration-300 hover:shadow-md",
                                            fontSize === opt.id 
                                                ? "border-[#152328] bg-[#F7F8F4] ring-4 ring-[#152328]/5 shadow-sm" 
                                                : "border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="flex items-center justify-between w-full mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "size-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                                                    fontSize === opt.id ? "border-[#152328] bg-[#152328] text-white" : "border-slate-300 bg-white"
                                                )}>
                                                    {fontSize === opt.id && (
                                                        <div className="size-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span className="text-[14px] font-bold text-foreground">{opt.label}</span>
                                            </div>
                                            <span className={cn(
                                                "font-black text-slate-400 group-hover:text-primary transition-colors select-none",
                                                opt.id === 'theme-small' && "text-[12px]",
                                                opt.id === 'theme-medium' && "text-[14px]",
                                                opt.id === 'theme-large' && "text-[16px]",
                                                opt.id === 'theme-xl' && "text-[18px]",
                                            )}>
                                                Aa
                                            </span>
                                        </div>
                                        
                                        <p className="text-[11px] font-medium text-[#B0AFA8] text-left mb-4">{opt.desc}</p>
                                        
                                        <div className="mt-auto pt-3 border-t border-slate-100 w-full text-left">
                                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#B0AFA8] block mb-1">Preview</span>
                                            <p className={cn(
                                                "font-semibold text-foreground leading-snug",
                                                opt.id === 'theme-small' && "text-[12px]",
                                                opt.id === 'theme-medium' && "text-[14px]",
                                                opt.id === 'theme-large' && "text-[16px]",
                                                opt.id === 'theme-xl' && "text-[18px]",
                                            )}>
                                                This is sample text.
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
