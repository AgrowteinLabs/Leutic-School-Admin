import { useState } from "react";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { motion } from "framer-motion";

export const SettingsPage = () => {
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
        { id: 'theme-small', label: 'Small', desc: 'Modern & Compact', preview: 'The quick brown fox jumps over the lazy dog.' },
        { id: 'theme-medium', label: 'Medium', desc: 'Standard Comfort', preview: 'The quick brown fox jumps over the lazy dog.' },
        { id: 'theme-large', label: 'Large', desc: 'High Visibility', preview: 'The quick brown fox jumps over the lazy dog.' },
        { id: 'theme-xl', label: 'Extra Large', desc: 'Maximum Clarity', preview: 'The quick brown fox jumps over the lazy dog.' },
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
                        {/* Section 1: Appearance */}
                        <div className="space-y-8">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[20px] font-bold text-foreground tracking-tight">Display & Accessibility</h2>
                                <p className="text-[13px] font-medium text-[#B0AFA8]">Adjust the interface font size for your visual comfort</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sizeOptions.map((opt) => (
                                    <button 
                                        key={opt.id}
                                        onClick={() => handleFontSizeChange(opt.id)}
                                        className={cn(
                                            "group relative flex flex-col text-left bg-white border rounded-[32px] overflow-hidden transition-all duration-500",
                                            fontSize === opt.id 
                                                ? "border-primary ring-4 ring-primary/5 shadow-xl shadow-primary/5" 
                                                : "border-slate-100 hover:border-slate-200"
                                        )}
                                    >
                                        <div className="p-8 pb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "size-10 rounded-xl flex items-center justify-center transition-colors",
                                                    fontSize === opt.id ? "bg-primary text-white" : "bg-slate-50 text-[#B0AFA8]"
                                                )}>
                                                    <span className="material-symbols-outlined text-[20px]">text_fields</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[15px] font-bold text-foreground">{opt.label}</span>
                                                    <span className="text-[11px] font-medium text-[#B0AFA8]">{opt.desc}</span>
                                                </div>
                                            </div>
                                            {fontSize === opt.id && (
                                                <div className="size-6 rounded-full bg-primary flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[14px] text-white font-bold">check</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="px-8 pb-8">
                                            <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-50">
                                                <p className={cn(
                                                    "font-medium leading-relaxed transition-all",
                                                    opt.id === 'theme-small' && "text-[12px]",
                                                    opt.id === 'theme-medium' && "text-[14px]",
                                                    opt.id === 'theme-large' && "text-[16px]",
                                                    opt.id === 'theme-xl' && "text-[18px]",
                                                    fontSize === opt.id ? "text-foreground" : "text-[#B0AFA8]"
                                                )}>
                                                    {opt.preview}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section 2: Other Settings */}
                        <div className="pt-12 border-t border-slate-100 space-y-6">
                            <div className="flex flex-col gap-1">
                                <h2 className="text-[20px] font-bold text-foreground tracking-tight">Institutional Profile</h2>
                                <p className="text-[13px] font-medium text-[#B0AFA8]">Update school details and academic sessions</p>
                            </div>

                            <div className="bg-white border border-slate-100 rounded-[32px] p-10 flex items-center justify-between group hover:border-primary/20 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="size-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/5 group-hover:text-primary transition-all">
                                        <span className="material-symbols-outlined text-[28px]">school</span>
                                    </div>
                                    <div>
                                        <p className="text-[15px] font-bold text-foreground">School Information</p>
                                        <p className="text-[13px] text-[#B0AFA8] font-medium">Manage logo, address and contact details</p>
                                    </div>
                                </div>
                                <button className="px-6 h-10 rounded-xl bg-slate-50 text-[12px] font-bold text-[#71716A] hover:bg-slate-100 transition-colors">Edit Profile</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
