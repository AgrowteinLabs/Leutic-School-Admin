import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { TopBar } from "../../../components/Header";
import { cn } from "../../../lib/utils";
import { PDSButton } from "../../../components/pds/PDSButton";
import { motion, AnimatePresence } from "framer-motion";
import { AppDatePicker } from "../../../components/AppDatePicker";
import { AppTimePicker } from "../../../components/AppTimePicker";

interface Post {
    id: number;
    type: "announcement" | "competition" | "qa";
    author: string;
    role: string;
    avatar: string;
    content: string;
    image?: string;
    time: string;
    reactions: number;
    comments: number;
    isAcknowledged?: boolean;
    isVerified?: boolean;
    metadata?: {
        venue?: string;
        date?: string;
        tags?: string[];
        upvotes?: number;
    };
}

export const AuraButton = ({ isAuraed, onAura, isBursting }: { isAuraed: boolean, onAura: () => void, isBursting: boolean }) => {
    return (
        <div className="relative">
            <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={onAura}
                className={cn(
                    "size-10 rounded-full flex items-center justify-center bg-transparent transition-all group/aura relative z-10 hover:bg-slate-50",
                    isAuraed ? "text-primary" : "text-muted-gray hover:text-primary"
                )}
            >
                <div className="relative size-5">
                    {/* Base Icon (Muted) */}
                    <motion.span
                        animate={isBursting ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                        className={cn(
                            "material-symbols-outlined absolute inset-0 text-[20px] leading-none transition-colors",
                            isAuraed ? "text-primary/20" : "text-muted-gray"
                        )}
                    >
                        bolt
                    </motion.span>

                    {/* Filled Reveal Icon */}
                    <motion.div
                        initial={{ height: 0 }}
                        animate={isAuraed && !isBursting ? { height: '100%' } : { height: 0 }}
                        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                        className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none"
                    >
                        <span
                            className="material-symbols-outlined absolute bottom-0 left-0 text-[20px] leading-none text-primary"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                            bolt
                        </span>
                    </motion.div>
                </div>
            </motion.button>
        </div>
    );
};

export const CommunityPost = ({ post }: { post: Post }) => {
    const [isAuraed, setIsAuraed] = useState(false);
    const [isBursting, setIsBursting] = useState(false);
    const [hasVoted, setHasVoted] = useState(post.metadata?.isVoted || false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    const onAura = () => {
        if (!isAuraed) setIsAuraed(true);
        setIsBursting(false);
        setTimeout(() => setIsBursting(true), 10);
        setTimeout(() => setIsBursting(false), 1200);
    };

    const onVote = (option: string) => {
        if (!hasVoted) {
            setSelectedOption(option);
            setHasVoted(true);
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            onDoubleClick={onAura}
            className="relative group max-w-xl cursor-default select-none"
        >
            {/* Clean Minimalist Author Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "size-10 rounded-[12px] flex items-center justify-center border border-slate-100/50 overflow-hidden bg-slate-50",
                        post.type === "announcement" && "bg-brand-navy text-primary"
                    )}>
                        {post.type === "announcement" ? (
                            <span className="material-symbols-outlined text-[20px]">school</span>
                        ) : (
                            <img src={post.avatar} className="size-full object-cover" />
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-brand-navy tracking-tight" style={{ fontSize: 'var(--font-size-body)' }}>{post.author}</span>
                            {post.isVerified && (
                                <span className="material-symbols-outlined filled text-blue-500 text-[14px]">verified</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="font-medium text-muted-gray" style={{ fontSize: 'var(--font-size-small)' }}>{post.role}</span>
                            {post.author !== "Silver Oak International" && (
                                <>
                                    <span className="size-0.5 rounded-full bg-slate-300" />
                                    <span className="font-medium text-muted-gray" style={{ fontSize: 'var(--font-size-small)' }}>Silver Oak International</span>
                                </>
                            )}
                            <span className="size-0.5 rounded-full bg-slate-300" />
                            <span className="font-medium text-muted-gray" style={{ fontSize: 'var(--font-size-small)' }}>{post.time}</span>
                        </div>
                    </div>
                </div>
                <button className="text-slate-300 hover:text-brand-navy transition-colors">
                    <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
            </div>

            {/* Content Area - Surgical Design */}
            <div className="space-y-6">
                <div className="space-y-4">
                    {(post.type === "competition" || post.type === "announcement") && (
                        <h2 className="font-bold text-brand-navy leading-tight tracking-tight" style={{ fontSize: 'var(--font-size-body)' }}>
                            {post.id === 1 ? "🚀 Annual Science Fair 2025" : post.content.split('\n')[0]}
                        </h2>
                    )}
                    <p className="font-medium text-brand-navy/90 leading-relaxed tracking-tight whitespace-pre-wrap" style={{ fontSize: 'var(--font-size-body)' }}>
                        {post.type === "competition" ? post.content.split('\n').slice(1).join('\n') : post.content}
                    </p>
                </div>

                {post.type === "announcement" && post.image && (
                    <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden group/img">
                        <img src={post.image} className="size-full object-cover group-hover/img:scale-105 transition-transform duration-1000" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                            <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white py-3.5 rounded-2xl font-bold hover:bg-white hover:text-brand-navy transition-all flex items-center justify-center gap-2 group/btn" style={{ fontSize: 'var(--font-size-small)' }}>
                                Register Now
                                <span className="material-symbols-outlined text-[16px] group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                )}

                {post.type === "competition" && (
                    <div className="group/box rounded-[24px] bg-tertiary border border-tertiary-border p-5 flex items-center gap-6">
                        <div className="flex flex-col size-16 rounded-2xl overflow-hidden border border-tertiary-border shrink-0">
                            <div className="bg-brand-navy py-1 flex items-center justify-center">
                                <span className="text-[7px] font-black text-primary/90 uppercase tracking-[0.25em]">2025</span>
                            </div>
                            <div className="flex-1 bg-tertiary-light flex flex-col items-center justify-center -space-y-1">
                                <span className="text-[24px] font-black text-brand-navy leading-none">12</span>
                                <span className="text-[9px] font-black text-brand-navy/50 uppercase tracking-[0.15em]">Oct</span>
                            </div>
                        </div>

                        <div className="flex-1 flex items-center justify-between gap-8">
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2 text-brand-navy">
                                    <span className="material-symbols-outlined text-[18px]">sports_basketball</span>
                                    <span className="font-bold tracking-tight" style={{ fontSize: 'var(--font-size-body)' }}>Regional Basketball Finals</span>
                                </div>
                                <div className="flex items-center gap-2.5 text-muted-gray">
                                    <span className="material-symbols-outlined text-[16px] opacity-50">location_on</span>
                                    <span className="font-medium" style={{ fontSize: 'var(--font-size-small)' }}>Main Sports Arena, Silver Oak Campus</span>
                                </div>
                                <div className="flex items-center gap-3 pt-2">
                                    <div className="flex -space-x-2">
                                        {[
                                            "/Avatar/Male Avatar Age30.png",
                                            "/Avatar/Female Avatar Age22.png",
                                            "/Avatar/Male Avatar Age40.png"
                                        ].map((url, i) => (
                                            <img key={i} src={url} className="size-6 rounded-full border-2 border-tertiary-light object-cover bg-white" alt="Student" />
                                        ))}
                                    </div>
                                    <span className="font-semibold text-muted-gray/80" style={{ fontSize: '10px' }}>42 Teams Registered</span>
                                </div>
                            </div>

                            <button className="h-10 px-6 rounded-xl bg-brand-navy text-primary font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0" style={{ fontSize: 'var(--font-size-small)' }}>
                                Join Now
                            </button>
                        </div>
                    </div>
                )}

                {post.type === "poll" && post.metadata?.pollOptions && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                            {post.metadata.pollOptions.map((opt: any) => {
                                const percentage = Math.round((opt.votes / (post.metadata?.totalVotes || 1)) * 100);
                                const isSelected = selectedOption === opt.label;
                                return (
                                    <button
                                        key={opt.label}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onVote(opt.label);
                                        }}
                                        onDoubleClick={(e) => e.stopPropagation()}
                                        className={cn(
                                            "relative w-full overflow-hidden rounded-xl transition-all py-3 px-4 text-left flex justify-between items-center",
                                            hasVoted
                                                ? "bg-slate-50/50 cursor-default"
                                                : "border border-slate-100 hover:border-slate-200 bg-white active:scale-[0.99] z-20"
                                        )}
                                    >
                                        {hasVoted && (
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                className={cn("absolute top-0 left-0 h-full z-0 transition-all duration-500", isSelected ? "bg-[#D9EA85]/30" : "bg-slate-200/50")}
                                            />
                                        )}
                                        <div className="flex items-center gap-2 relative z-10 w-full justify-between">
                                            <span className={cn(
                                                "transition-colors",
                                                hasVoted && isSelected ? "font-bold text-brand-navy" : "font-medium text-brand-navy/80"
                                            )} style={{ fontSize: '14px' }}>{opt.label}</span>

                                            {hasVoted && (
                                                <div className="flex items-center gap-2">
                                                    {isSelected && <span className="material-symbols-outlined text-[16px] text-brand-navy font-bold">check</span>}
                                                    <span className="font-bold text-brand-navy/40" style={{ fontSize: '13px' }}>{percentage}%</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-muted-gray font-semibold  px-1">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[14px]">how_to_vote</span>
                                <span>{post.metadata.totalVotes + (hasVoted && selectedOption ? 1 : 0)} institutional Votes</span>
                            </div>
                            <span>{hasVoted ? "Selection Locked" : "Ends in 48h"}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Interaction Bar */}
            <div className="mt-8 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AuraButton isAuraed={isAuraed} onAura={onAura} isBursting={isBursting} />
                    <button className="size-10 rounded-full hover:bg-slate-50 text-muted-gray hover:text-brand-navy flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[20px]">mode_comment</span>
                    </button>
                    <button className="size-10 rounded-full hover:bg-slate-50 text-muted-gray hover:text-brand-navy flex items-center justify-center transition-all">
                        <span className="material-symbols-outlined text-[20px]">share</span>
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                        {[
                            "/Avatar/Female Avatar Age22.png",
                            "/Avatar/Male Avatar Age24.png",
                            "/Avatar/Female Avatar Age25.png"
                        ].map((url, i) => (
                            <img key={i} src={url} className="size-6 rounded-full border-2 border-white bg-slate-100 ring-1 ring-slate-50 object-cover" alt="Avatar" />
                        ))}
                    </div>
                    <span className="font-bold text-muted-gray tracking-tight" style={{ fontSize: 'var(--font-size-small)' }}>+1.2k Auraed</span>
                </div>
            </div>

            {/* Central Aura Indicator - Moved to bottom for layer safety */}
            <AnimatePresence>
                {isBursting && (
                    <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none overflow-visible">
                        <motion.div
                            initial={{ scale: 0.2, opacity: 0, y: 0, rotate: -15 }}
                            animate={{
                                scale: [0.2, 1.4, 1.3, 1.1],
                                opacity: [0, 1, 1, 0],
                                y: [0, -40, -60],
                                rotate: [0, -3, 3, 0]
                            }}
                            transition={{
                                duration: 1.6,
                                times: [0, 0.2, 0.8, 1],
                                ease: "easeOut"
                            }}
                            className="flex flex-col items-center relative pointer-events-none"
                        >
                            {/* Cinematic Ripple Effect - Perfectly Centered */}
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: [0.5, 2.5], opacity: [0.5, 0] }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-0 rounded-full border-2 border-primary/30 pointer-events-none"
                            />
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: [0.5, 3.5], opacity: [0.3, 0] }}
                                transition={{ duration: 1.2, delay: 0.1, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-0 rounded-full border border-primary/20 pointer-events-none"
                            />

                            <span className="material-symbols-outlined filled text-primary text-[56px] relative z-10 pointer-events-none" style={{ filter: 'drop-shadow(0 0 30px rgba(217,234,133,0.9))', fontVariationSettings: "'FILL' 1" }}>bolt</span>
                            <span className="text-primary font-black text-[24px] uppercase tracking-tighter italic relative z-10 pointer-events-none" style={{ textShadow: '0 0 20px rgba(217,234,133,0.7)' }}>+1 Aura</span>
                        </motion.div>

                        {/* Mixed Organic Lightning Particles - Thin & Jagged */}
                        {[...Array(32)].map((_, i) => {
                            const isNavy = i % 2 === 0;
                            return (
                                <motion.div
                                    key={i}
                                    initial={{
                                        x: 0,
                                        y: 0,
                                        opacity: 1,
                                        rotate: Math.random() * 360,
                                        scale: 0
                                    }}
                                    animate={{
                                        x: (Math.random() - 0.5) * 600,
                                        y: (Math.random() - 0.5) * 600,
                                        opacity: [1, 1, 0],
                                        scale: [0, 1, 0.4]
                                    }}
                                    transition={{
                                        duration: Math.random() * 0.8 + 0.6,
                                        ease: "easeOut",
                                        delay: Math.random() * 0.12
                                    }}
                                    className={cn(
                                        "absolute z-0 pointer-events-none",
                                        isNavy ? "text-brand-navy" : "text-primary"
                                    )}
                                >
                                    <svg width="12" height="36" viewBox="0 0 12 36" fill="none" className="drop-shadow-sm pointer-events-none">
                                        <path
                                            d="M6 0 L12 14 L0 22 L6 36"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </motion.div>
                            );
                        })}

                        {/* Post-wide Bloom/Flash - Toned Down */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 0.1, 0] }}
                            transition={{ duration: 0.4 }}
                            className="absolute inset-0 bg-primary z-0 pointer-events-none rounded-[32px]"
                        />
                    </div>
                )}
            </AnimatePresence>
        </motion.article>
    );
};

export const CommunityPage = ({ isHubChild }: { isHubChild?: boolean }) => {
    const { tab } = useParams();
    const navigate = useNavigate();
    const activeTab = tab || "feed";
    const [activeCategory, setActiveCategory] = useState<"all" | "school" | "interschool" | "events">("all");
    const [expandedModerationId, setExpandedModerationId] = useState<number | null>(null);
    const [postContent, setPostContent] = useState("");
    const [postCategory, setPostCategory] = useState("Academic");
    const [isExpanded, setIsExpanded] = useState(false);
    const [isAudienceMenuOpen, setIsAudienceMenuOpen] = useState(false);
    const [audienceSearch, setAudienceSearch] = useState("");
    const [selectedAudiences, setSelectedAudiences] = useState<string[]>(["School-wide"]);
    const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
    const [attachments, setAttachments] = useState<{ id: string, type: 'image' | 'file' | 'location' | 'event' | 'poll', name: string, url?: string, detail?: string }[]>([]);
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    const [eventDetails, setEventDetails] = useState({ title: '', date: '', time: '', venue: '', rsvp: false, buttonText: '', buttonLink: '' });
    const [isAdvancedEventOpen, setIsAdvancedEventOpen] = useState(false);
    const [pollOptions, setPollOptions] = useState<string[]>(['', '']);

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'file') => {
        const file = e.target.files?.[0];
        if (file) {
            const newAttachment = {
                id: Math.random().toString(36).substr(2, 9),
                type,
                name: file.name,
                url: URL.createObjectURL(file)
            };
            setAttachments([...attachments, newAttachment]);
        }
        e.target.value = "";
    };

    const addSpecialAttachment = (type: 'location' | 'event' | 'poll') => {
        const newAtt = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            name: type === 'location' ? 'Main Campus, High School Wing' :
                type === 'event' ? 'New Institutional Event' : 'Community Poll',
            detail: type === 'location' ? 'Block A, Floor 2' :
                type === 'event' ? 'Configure Event Details Below' : 'Add Poll Options Below'
        };
        setAttachments([...attachments, newAtt]);
    };

    const removeAttachment = (id: string) => {
        setAttachments(attachments.filter(a => a.id !== id));
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-expanding textarea logic
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '0px';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = isExpanded ? `${Math.max(scrollHeight, 80)}px` : '32px';
        }
    }, [postContent, isExpanded]);

    // Reset expansion states and scroll position when switching tabs to prevent animation clashes and carryover
    useEffect(() => {
        setExpandedModerationId(null);
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }
    }, [activeTab]);

    const posts: Post[] = [
        {
            id: 1,
            type: "announcement",
            author: "Silver Oak International",
            role: "Admin (You)",
            avatar: "https://i.pravatar.cc/150?u=1",
            content: "The annual #ScienceFair registration is officially OPEN. We invite all innovators to showcase their projects. 🚀",
            image: "/banner4.jpg",
            time: "2h ago",
            reactions: 1200,
            comments: 45,
            isAcknowledged: true,
            isVerified: true,
        },
        {
            id: 2,
            type: "competition",
            author: "St. Mary's HSS",
            role: "Inter-School",
            avatar: "https://i.pravatar.cc/150?u=2",
            content: "Regional Basketball Finals 🏆\nJoin us this Friday for the championship match. Music & food trucks on-site.",
            time: "Just now",
            reactions: 230,
            comments: 12,
            isVerified: true,
            metadata: {
                venue: "Main Court, St. Mary's",
                date: "Friday, 12th Oct",
                tags: ["Basketball", "Regional"]
            }
        },
        {
            id: 3,
            type: "poll",
            author: "Jayalakshmi",
            role: "Grade 11 • Debate",
            avatar: "https://i.pravatar.cc/150?u=3",
            content: "Which state should host the next Inter-School Science Symposium? 🌍🔬",
            time: "14m ago",
            reactions: 48,
            comments: 5,
            metadata: {
                pollOptions: [
                    { label: "Odisha", votes: 42, color: "bg-primary" },
                    { label: "Maharashtra", votes: 28, color: "bg-brand-navy" },
                    { label: "Gujarat", votes: 15, color: "bg-slate-200" },
                    { label: "Karnataka", votes: 15, color: "bg-slate-200" }
                ],
                totalVotes: 100,
                isVoted: false
            }
        }
    ];

    interface QnAResponse {
        id: string;
        author: string;
        avatar: string;
        role: string;
        content: string;
        time: string;
        isBot?: boolean;
        isFaculty?: boolean;
        isPrincipal?: boolean;
        isVerified?: boolean;
        replyingToName?: string;
        depth?: number;
        children?: QnAResponse[];
    }

    interface QnAQuestion {
        id: string;
        votes: number;
        answers: number;
        views: number;
        title: string;
        excerpt: string;
        tags: string[];
        author: {
            name: string;
            avatar: string;
            reputation: string;
        };
        time: string;
        hasAcceptedAnswer?: boolean;
        responses?: QnAResponse[];
    }

    const mockQuestions: QnAQuestion[] = [
        {
            id: "q1",
            votes: 14,
            answers: 2,
            views: 204,
            title: "How do I register for the upcoming Regional Science Fair?",
            excerpt: "I've checked the portal but the science fair link seems to be directing me to last year's form. Has the registration opened yet?",
            tags: ["Events", "Science Fair", "Registration"],
            author: { name: "Rahul M.", avatar: "/Avatar/Male Avatar Age18.png", reputation: "1.2k" },
            time: "asked 2 hours ago",
            hasAcceptedAnswer: true,
            responses: [
                { id: "r1", author: "LetBot", avatar: "/logo_icon.png", role: "Institutional Assistant", content: "The 2024 Science Fair portal is currently undergoing a scheduled maintenance update. It will be officially live for registrations tomorrow at 9:00 AM.", time: "1h ago", isBot: true, depth: 0 },
                { id: "r2", author: "Dr. Sarah Jenkins", avatar: "/Avatar/Female Avatar Age42.png", role: "Science Head", content: "Just to add to LetBot's response, we've also extended the early-bird deadline by two days due to this maintenance. Looking forward to seeing your projects!", time: "45m ago", isFaculty: true, isVerified: true, depth: 1, replyingToName: "LetBot" },
                { id: "r2_1", author: "Rahul M.", avatar: "/Avatar/Male Avatar Age18.png", role: "Student", content: "Thanks for the update, Dr. Jenkins! Will the project categories remain the same as last year?", time: "30m ago", depth: 2, replyingToName: "Dr. Sarah Jenkins" }
            ]
        },
        {
            id: "q2",
            votes: 5,
            answers: 0,
            views: 42,
            title: "Is there a makeup date for the Grade 11 Chemistry practicals?",
            excerpt: "I missed the session on Tuesday due to a sports tournament. Who should I contact for the makeup schedule?",
            tags: ["Academics", "Grade 11", "Chemistry"],
            author: { name: "Sneha P.", avatar: "/Avatar/Female Avatar Age19.png", reputation: "450" },
            time: "asked 5 hours ago"
        },
        {
            id: "q3",
            votes: 32,
            answers: 2,
            views: 890,
            title: "What are the rules for the inter-house debate competition this year?",
            excerpt: "Last year we had a time limit of 3 minutes per speaker. I heard it was increased to 5 minutes. Can someone confirm?",
            tags: ["Debate", "Inter-House", "Rules"],
            author: { name: "Ananya S.", avatar: "/Avatar/Female Avatar Age20.png", reputation: "3.4k" },
            time: "asked yesterday",
            hasAcceptedAnswer: true,
            responses: [
                { id: "r3", author: "Vikram Seth", avatar: "/Avatar/Male Avatar Age25.png", role: "Debate Captain", content: "Yes, it's confirmed. Each speaker now gets 5 minutes. The first 1 minute and last 1 minute are protected (no POIs allowed).", time: "12h ago", isVerified: true, depth: 0 },
                { id: "r4", author: "Arjun T.", avatar: "/Avatar/Male Avatar Age22.png", role: "Student", content: "Thanks Vikram! Are the topics being released 24 hours in advance like last time?", time: "2h ago", depth: 1, replyingToName: "Vikram Seth" }
            ]
        }
    ];

    const ResponseNode = ({
        resp,
        questionId,
        replyingTo,
        setReplyingTo,
        replyText,
        setReplyText,
        handlePostResponse,
        handleVerify
    }: any) => {
        return (
            <div className="relative py-2 transition-all">
                <div className="flex gap-4">
                    <div className={cn("relative z-10 size-7 rounded-lg shrink-0 border border-slate-100 p-1 flex items-center justify-center", resp.isBot ? "bg-white" : "bg-slate-50")}>
                        <img src={resp.avatar} className="size-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[13px] font-semibold text-brand-navy">{resp.author}</span>
                            {resp.isBot && <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded-md">AI</span>}
                            {resp.isFaculty && <span className="px-1.5 py-0.5 bg-brand-navy text-white text-[9px] font-bold rounded-md">Faculty</span>}
                            {resp.isPrincipal && <span className="px-1.5 py-0.5 bg-brand-navy text-[#D9EA85] text-[9px] font-black rounded-md">Principal</span>}
                            {resp.isVerified && <div className="flex items-center gap-1 text-primary text-[9px] font-bold"><span className="material-symbols-outlined text-[14px] filled">verified</span> Verified</div>}
                            {resp.replyingToName && (
                                <span className="text-[11px] text-muted-gray/60 font-medium ml-1">
                                    replying to <span className="text-brand-navy/60">@{resp.replyingToName}</span>
                                </span>
                            )}
                            <span className="text-[11px] text-muted-gray ml-auto">{resp.time}</span>
                        </div>
                        <p className="text-[13px] text-brand-navy/70 leading-relaxed font-normal break-words whitespace-pre-wrap">{resp.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <button onClick={() => setReplyingTo(replyingTo === resp.id ? null : resp.id)} className="text-[11px] font-semibold text-muted-gray/40 hover:text-brand-navy transition-colors">Reply</button>
                            <button className="text-[11px] font-semibold text-muted-gray/40 hover:text-brand-navy transition-colors">Upvote</button>
                            {!resp.isVerified && (
                                <button
                                    onClick={() => handleVerify(questionId, resp.id)}
                                    className="flex items-center gap-1 text-[11px] font-semibold text-muted-gray/40 hover:text-primary transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[14px]">verified</span>
                                    Verify
                                </button>
                            )}
                        </div>
                        <AnimatePresence>
                            {replyingTo === resp.id && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 overflow-hidden">
                                    <textarea autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder={`Reply to ${resp.author}...`} className="w-full bg-slate-50/50 border border-slate-100 rounded-xl p-3 text-[13px] outline-none focus:outline-none focus-visible:outline-none focus:border-primary/30 transition-all min-h-[80px] resize-none" />
                                    <div className="flex justify-end gap-3 mt-2">
                                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-[11px] font-semibold text-muted-gray/60 hover:text-brand-navy transition-colors">Cancel</button>
                                        <button onClick={() => handlePostResponse(questionId, resp.author, resp.originalIndex)} className="bg-brand-navy text-white text-[11px] font-bold px-3 py-1 rounded-lg hover:bg-brand-navy/90 transition-all">Reply</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Vertical line dropping from this node's avatar to its children */}
                {resp.children && resp.children.length > 0 && (
                    <div className="absolute left-[14px] top-[36px] bottom-0 w-[1px] bg-slate-100 z-0" />
                )}

                {resp.children && resp.children.length > 0 && (
                    <div className="relative mt-2 pl-8 space-y-2">
                        {resp.children.map((child: any, i: number) => {
                            const isLast = i === resp.children.length - 1;
                            return (
                                <div key={child.id} className="relative">
                                    {/* Horizontal connector to the child avatar */}
                                    <div className="absolute left-[-18px] top-[22px] w-[18px] h-[1px] bg-slate-100 z-0" />

                                    {/* Tail hider for the last child to cut off the continuous line perfectly */}
                                    {isLast && (
                                        <div className="absolute left-[-20px] top-[23px] bottom-[-10px] w-[5px] bg-white z-10" />
                                    )}

                                    <ResponseNode
                                        resp={child}
                                        questionId={questionId}
                                        replyingTo={replyingTo}
                                        setReplyingTo={setReplyingTo}
                                        replyText={replyText}
                                        setReplyText={setReplyText}
                                        handlePostResponse={handlePostResponse}
                                        handleVerify={handleVerify}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const QnAHub = () => {
        const [filter, setFilter] = useState("newest");
        const [expandedId, setExpandedId] = useState<string | null>(null);
        const [replyingTo, setReplyingTo] = useState<string | null>(null);
        const [replyText, setReplyText] = useState("");
        const [questions, setQuestions] = useState<QnAQuestion[]>(mockQuestions);

        const handlePostResponse = (questionId: string, targetAuthor?: string, targetIndex?: number) => {
            if (!replyText.trim()) return;

            const newResponse: QnAResponse = {
                id: Math.random().toString(36).substr(2, 9),
                author: "Principal Admin",
                avatar: "/Avatar/Male Avatar Age42.png",
                role: "Principal",
                content: replyText,
                time: "just now",
                isPrincipal: true,
                replyingToName: targetAuthor
            };

            setQuestions(prev => prev.map(q => {
                if (q.id === questionId) {
                    const updatedResponses = [...(q.responses || [])];
                    if (targetIndex !== undefined) {
                        const parentDepth = updatedResponses[targetIndex].depth || 0;
                        newResponse.depth = parentDepth + 1; // Allow infinite nesting
                        updatedResponses.splice(targetIndex + 1, 0, newResponse);
                    } else {
                        newResponse.depth = 0;
                        updatedResponses.push(newResponse);
                    }
                    return { ...q, answers: q.answers + 1, responses: updatedResponses };
                }
                return q;
            }));

            setReplyText("");
            setReplyingTo(null);
            setExpandedId(questionId);
        };

        const handleVerify = (questionId: string, responseId: string) => {
            setQuestions(prev => prev.map(q => {
                if (q.id === questionId) {
                    return {
                        ...q,
                        hasAcceptedAnswer: true,
                        responses: q.responses?.map(r => ({
                            ...r,
                            isVerified: r.id === responseId
                        }))
                    };
                }
                return q;
            }));
        };

        return (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between pb-6 mb-2 border-b border-slate-50">
                    <div className="flex items-center gap-4">
                        <h2 className="text-[17px] font-semibold tracking-tight text-brand-navy">Global discussions</h2>
                        <span className="text-[12px] font-medium text-muted-gray/40">{questions.length} Questions</span>
                    </div>
                    <div className="flex items-center gap-3">
                        {["Newest", "Active", "Unanswered"].map(f => {
                            const isActive = filter === f.toLowerCase();
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f.toLowerCase())}
                                    className={cn(
                                        "text-[12px] font-bold px-5 py-1.5 rounded-xl border transition-all",
                                        isActive
                                            ? "bg-brand-navy text-white border-brand-navy shadow-sm"
                                            : "bg-white text-muted-gray/60 border-slate-100 hover:border-slate-200 hover:text-brand-navy"
                                    )}
                                >
                                    {f}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="space-y-2">
                    {questions.map((q) => {
                        const isExpanded = expandedId === q.id;
                        return (
                            <div key={q.id} className="relative group">
                                <div onClick={() => setExpandedId(isExpanded ? null : q.id)} className={cn("flex gap-6 py-6 transition-all cursor-pointer rounded-2xl px-4 -mx-4", isExpanded ? "bg-slate-50/30" : "hover:bg-slate-50/50")}>
                                    <div className="flex flex-col items-center shrink-0 w-12 pt-1">
                                        <div className="text-[14px] font-semibold text-brand-navy">{q.votes}</div>
                                        <div className="text-[10px] font-medium text-muted-gray/40">Votes</div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex items-center gap-2">
                                                <img src={q.author.avatar} className="size-5 rounded-full object-cover border border-slate-100" />
                                                <span className="text-[12px] font-semibold text-brand-navy">{q.author.name}</span>
                                            </div>
                                            <span className="text-[11px] text-muted-gray/40">{q.time}</span>
                                            {q.hasAcceptedAnswer && <span className="material-symbols-outlined text-primary text-[16px] filled">check_circle</span>}
                                        </div>
                                        <h3 className="text-[16px] font-semibold text-brand-navy leading-snug mb-2 group-hover:text-primary transition-colors">{q.title}</h3>
                                        <div className="flex items-center gap-4">
                                            <div className="flex gap-2">{q.tags.slice(0, 2).map(tag => <span key={tag} className="text-[11px] font-medium text-muted-gray/60">#{tag.toLowerCase()}</span>)}</div>
                                            <div className="flex items-center gap-4 ml-auto">
                                                <button onClick={(e) => { e.stopPropagation(); setReplyingTo(replyingTo === q.id ? null : q.id); }} className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-gray/40 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-[14px]">reply</span> Reply
                                                </button>
                                                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-gray/40"><span className="material-symbols-outlined text-[14px]">{isExpanded ? 'expand_less' : 'chat_bubble_outline'}</span>{q.answers} {isExpanded ? 'Hide' : 'Answers'}</div>
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {replyingTo === q.id && (
                                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mt-4 pt-4 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                                                    <textarea autoFocus value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your response..." className="w-full bg-white border border-slate-100 rounded-xl p-3 text-[13px] outline-none focus:outline-none focus-visible:outline-none focus:border-primary/30 transition-all min-h-[100px] resize-none" />
                                                    <div className="flex justify-end gap-3 mt-3">
                                                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="text-[11px] font-semibold text-muted-gray/60 hover:text-brand-navy transition-colors">Cancel</button>
                                                        <button onClick={() => handlePostResponse(q.id)} className="bg-brand-navy text-white text-[11px] font-bold px-4 py-1.5 rounded-lg hover:bg-brand-navy/90 transition-all">Post Response</button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {isExpanded && q.responses && q.responses.length > 0 && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                                            <div className="ml-10 pl-10 relative pb-6 mt-2 space-y-4">
                                                <div className="absolute left-4 top-0 bottom-6 w-[1px] bg-slate-100 rounded-full" />

                                                {(() => {
                                                    // Build tree structure
                                                    const root: any[] = [];
                                                    const map = new Map<number, any>();

                                                    (q.responses || []).forEach((r, idx) => {
                                                        const node = { ...r, children: [], originalIndex: idx };
                                                        const d = node.depth || 0;

                                                        if (d === 0) {
                                                            root.push(node);
                                                        } else {
                                                            const parent = map.get(d - 1);
                                                            if (parent) {
                                                                parent.children.push(node);
                                                            } else {
                                                                root.push(node);
                                                            }
                                                        }
                                                        map.set(d, node);
                                                        for (let i = d + 1; map.has(i); i++) {
                                                            map.delete(i);
                                                        }
                                                    });

                                                    return root.map((rootNode, idx) => (
                                                        <div key={rootNode.id} className="relative">
                                                            {/* Horizontal Connector to main thread line */}
                                                            <div className="absolute left-[-24px] top-[22px] w-[24px] h-[1px] bg-slate-100 z-0" />
                                                            <ResponseNode
                                                                resp={rootNode}
                                                                questionId={q.id}
                                                                replyingTo={replyingTo}
                                                                setReplyingTo={setReplyingTo}
                                                                replyText={replyText}
                                                                setReplyText={setReplyText}
                                                                handlePostResponse={handlePostResponse}
                                                                handleVerify={handleVerify}
                                                            />
                                                        </div>
                                                    ));
                                                })()}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
            {!isHubChild && (
                <>
                    <TopBar
                        title="Community"
                        subtitle="Institutional Hub & Interaction"
                        actions={
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF6E9]/40 rounded-full border border-[#EAE5D5]/20 mr-2">
                                    <span className="material-symbols-outlined filled text-brand-navy text-[14px]">bolt</span>
                                    <span className="text-brand-navy font-bold font-mono text-[11px]">850</span>
                                </div>
                                <PDSButton variant="primary" size="sm" icon="add">New Post</PDSButton>
                            </div>
                        }
                    />
                    {/* Primary Tabs Navigation */}
                    <div className="px-10 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-30 shrink-0">
                        <div className="flex gap-10 overflow-x-auto no-scrollbar">
                            {[
                                { id: "feed", label: "Timeline", icon: "dashboard" },
                                { id: "discussion", label: "Q&A Hub", icon: "forum" },
                                { id: "moderation", label: "Moderation", icon: "verified_user", badge: 3 },
                            ].map((t) => {
                                const isActive = activeTab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => navigate(`/community/${t.id}`)}
                                        className={cn(
                                            "flex items-center gap-2.5 pb-4 pt-6 text-[14px] font-bold tracking-tight transition-all relative shrink-0",
                                            isActive ? "text-brand-navy" : "text-muted-gray hover:text-brand-navy"
                                        )}
                                    >
                                        <span className={cn("material-symbols-outlined text-[20px] transition-all", isActive ? "fill-1" : "")}>
                                            {t.icon}
                                        </span>
                                        {t.label}
                                        {t.badge && (
                                            <span className="absolute top-5 -right-2 size-1.5 bg-red-500 rounded-full" />
                                        )}
                                        {isActive && (
                                            <motion.div
                                                layoutId="communityTab"
                                                className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(217,234,133,0.5)]"
                                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar py-8 px-6 lg:px-10">
                <div className="max-w-[1400px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Focused Feed Area */}
                        <div className="lg:col-span-8 space-y-12">
                            <AnimatePresence mode="wait">
                                {activeTab === 'feed' && (
                                    <motion.div
                                        key="feed-tab"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="space-y-12">
                                            {/* Intelligent Expanding Create Post */}
                                            <motion.div
                                                layout
                                                className={cn(
                                                    "bg-white border border-slate-100 rounded-[24px] transition-all relative z-[60]",
                                                    (!isAudienceMenuOpen && !isAttachmentMenuOpen) && "overflow-hidden"
                                                )}
                                            >
                                                <div className={cn("transition-all", isExpanded ? "p-8" : "p-5 px-6")}>
                                                    <div className="flex items-start gap-5">
                                                        <div className="size-10 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                                            <img src="/Avatar/Male Avatar Age45.png" className="size-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 space-y-4">
                                                            <textarea
                                                                ref={textareaRef}
                                                                onFocus={() => setIsExpanded(true)}
                                                                value={postContent}
                                                                onChange={(e) => setPostContent(e.target.value)}
                                                                placeholder="Share an update publicly..."
                                                                className="w-full bg-transparent border-none outline-none resize-none text-[14px] text-brand-navy placeholder:text-muted-gray/40 pt-1.5 leading-relaxed transition-all no-scrollbar overflow-hidden"
                                                            />

                                                            {/* Full-Width Attachment Previews */}
                                                            {attachments.length > 0 && (
                                                                <div className="space-y-4 py-2 relative z-50 overflow-visible">
                                                                    {attachments.map(att => (
                                                                        <motion.div
                                                                            initial={{ opacity: 0, y: 10 }}
                                                                            animate={{ opacity: 1, y: 0 }}
                                                                            key={att.id}
                                                                            className="relative group w-full"
                                                                        >
                                                                            {att.type === 'image' ? (
                                                                                <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-100 shadow-sm bg-slate-50">
                                                                                    <img src={att.url} className="size-full object-cover" />
                                                                                </div>
                                                                            ) : att.type === 'file' ? (
                                                                                <div className="w-full rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-primary/20 transition-all flex items-center gap-4 p-4">
                                                                                    <div className="size-12 rounded-xl bg-red-50 flex items-center justify-center border border-red-100 text-red-500 shadow-inner">
                                                                                        <span className="material-symbols-outlined text-[24px]">pdf_ux</span>
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <span className="text-[12px] font-bold text-brand-navy truncate block">{att.name}</span>
                                                                                        <span className="text-[10px] font-medium text-muted-gray/40 uppercase tracking-tight">Institutional Document</span>
                                                                                    </div>
                                                                                    <span className="material-symbols-outlined text-muted-gray/20">download</span>
                                                                                </div>
                                                                            ) : att.type === 'location' ? (
                                                                                <div className="w-full rounded-2xl border border-slate-100 shadow-sm bg-white flex items-center gap-4 p-4">
                                                                                    <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 text-blue-500 shadow-inner">
                                                                                        <span className="material-symbols-outlined text-[24px]">map</span>
                                                                                    </div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <span className="text-[12px] font-bold text-brand-navy truncate block">{att.name}</span>
                                                                                        <span className="text-[10px] font-medium text-muted-gray/40">{att.detail}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ) : att.type === 'event' ? (
                                                                                <div className="p-8 bg-slate-50/30 rounded-[28px] border border-slate-50/50 space-y-8 relative z-[70]">
                                                                                    {/* Header: Minimal & Institutional */}
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-navy/60">
                                                                                                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <h4 className="text-[13px] font-bold text-brand-navy">Event Configuration</h4>
                                                                                                <p className="text-[10px] text-muted-gray/60 font-medium">Define schedule and institutional details</p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <button 
                                                                                            onClick={() => setEventDetails({...eventDetails, rsvp: !eventDetails.rsvp})}
                                                                                            className={cn(
                                                                                                "flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold transition-all border",
                                                                                                eventDetails.rsvp 
                                                                                                    ? "bg-primary/5 border-primary/20 text-primary" 
                                                                                                    : "bg-white border-slate-100 text-muted-gray/60 hover:bg-slate-50"
                                                                                            )}
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                                                            {eventDetails.rsvp ? "RSVP Enabled" : "Enable RSVP"}
                                                                                        </button>
                                                                                    </div>

                                                                                    {/* Etched Grid: App Pickers & Ghost Inputs */}
                                                                                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                                                                        <div className="group relative space-y-2">
                                                                                            <div className="flex items-center justify-between px-1">
                                                                                                <label className="text-[10px] font-bold text-brand-navy/40">Event Title</label>
                                                                                                <span className="material-symbols-outlined text-[14px] text-muted-gray/20 group-focus-within:text-primary/40 transition-colors">edit_note</span>
                                                                                            </div>
                                                                                            <input 
                                                                                                type="text"
                                                                                                placeholder="e.g. Annual Sports Meet"
                                                                                                value={eventDetails.title}
                                                                                                onChange={e => setEventDetails({ ...eventDetails, title: e.target.value })}
                                                                                                className="w-full bg-transparent border-b border-slate-100 py-2.5 text-[12px] font-bold text-brand-navy outline-none placeholder:text-muted-gray/30 focus:border-primary/30 transition-all"
                                                                                            />
                                                                                        </div>

                                                                                        <div className="group relative space-y-2">
                                                                                            <div className="flex items-center justify-between px-1">
                                                                                                <label className="text-[10px] font-bold text-brand-navy/40">Venue / Location</label>
                                                                                                <span className="material-symbols-outlined text-[14px] text-muted-gray/20 group-focus-within:text-primary/40 transition-colors">location_on</span>
                                                                                            </div>
                                                                                            <input 
                                                                                                type="text"
                                                                                                placeholder="e.g. Main Auditorium"
                                                                                                value={eventDetails.venue}
                                                                                                onChange={e => setEventDetails({ ...eventDetails, venue: e.target.value })}
                                                                                                className="w-full bg-transparent border-b border-slate-100 py-2.5 text-[12px] font-bold text-brand-navy outline-none placeholder:text-muted-gray/30 focus:border-primary/30 transition-all"
                                                                                            />
                                                                                        </div>

                                                                                        <div className="group relative space-y-2">
                                                                                            <div className="flex items-center justify-between px-1">
                                                                                                <label className="text-[10px] font-bold text-brand-navy/40">Event Date</label>
                                                                                                <span className="material-symbols-outlined text-[14px] text-muted-gray/20 group-focus-within:text-primary/40 transition-colors">event</span>
                                                                                            </div>
                                                                                            <AppDatePicker 
                                                                                                height="h-10"
                                                                                                value={eventDetails.date ? new Date(eventDetails.date) : null}
                                                                                                onChange={(date) => setEventDetails({ ...eventDetails, date: date.toISOString().split('T')[0] })}
                                                                                            />
                                                                                        </div>

                                                                                        <div className="group relative space-y-2">
                                                                                            <div className="flex items-center justify-between px-1">
                                                                                                <label className="text-[10px] font-bold text-brand-navy/40">Start Time</label>
                                                                                                <span className="material-symbols-outlined text-[14px] text-muted-gray/20 group-focus-within:text-primary/40 transition-colors">schedule</span>
                                                                                            </div>
                                                                                            <AppTimePicker 
                                                                                                value={eventDetails.time || "09:00"}
                                                                                                onChange={(time) => setEventDetails({ ...eventDetails, time })}
                                                                                            />
                                                                                        </div>

                                                                                        {/* Advanced Options Toggle */}
                                                                                        <div className="col-span-2 pt-2">
                                                                                            <button 
                                                                                                onClick={() => setIsAdvancedEventOpen(!isAdvancedEventOpen)}
                                                                                                className="flex items-center gap-2 text-[10px] font-bold text-muted-gray/40 hover:text-brand-navy transition-all px-1"
                                                                                            >
                                                                                                <span className={cn(
                                                                                                    "material-symbols-outlined text-[16px] transition-transform",
                                                                                                    isAdvancedEventOpen && "rotate-90"
                                                                                                )}>chevron_right</span>
                                                                                                Advanced Options (CTA Button)
                                                                                            </button>

                                                                                            <AnimatePresence>
                                                                                                {isAdvancedEventOpen && (
                                                                                                    <motion.div 
                                                                                                        initial={{ height: 0, opacity: 0 }}
                                                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                                                        exit={{ height: 0, opacity: 0 }}
                                                                                                        className="overflow-hidden"
                                                                                                    >
                                                                                                        <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6 border-t border-slate-50 mt-4">
                                                                                                            <div className="group relative space-y-2">
                                                                                                                <div className="flex items-center justify-between px-1">
                                                                                                                    <label className="text-[10px] font-bold text-brand-navy/40">Button Text</label>
                                                                                                                    <span className="material-symbols-outlined text-[14px] text-muted-gray/20 group-focus-within:text-primary/40 transition-colors">smart_button</span>
                                                                                                                </div>
                                                                                                                <input 
                                                                                                                    type="text"
                                                                                                                    placeholder="e.g. Register Now"
                                                                                                                    value={eventDetails.buttonText}
                                                                                                                    onChange={e => setEventDetails({ ...eventDetails, buttonText: e.target.value })}
                                                                                                                    className="w-full bg-transparent border-b border-slate-100 py-2.5 text-[12px] font-bold text-brand-navy outline-none placeholder:text-muted-gray/30 focus:border-primary/30 transition-all"
                                                                                                                />
                                                                                                            </div>

                                                                                                            <div className="group relative space-y-2">
                                                                                                                <div className="flex items-center justify-between px-1">
                                                                                                                    <label className="text-[10px] font-bold text-brand-navy/40">Action Link (https)</label>
                                                                                                                    <span className="material-symbols-outlined text-[14px] text-muted-gray/20 group-focus-within:text-primary/40 transition-colors">link</span>
                                                                                                                </div>
                                                                                                                <input 
                                                                                                                    type="url"
                                                                                                                    placeholder="https://example.com"
                                                                                                                    value={eventDetails.buttonLink}
                                                                                                                    onChange={e => setEventDetails({ ...eventDetails, buttonLink: e.target.value })}
                                                                                                                    className="w-full bg-transparent border-b border-slate-100 py-2.5 text-[12px] font-bold text-brand-navy outline-none placeholder:text-muted-gray/30 focus:border-primary/30 transition-all"
                                                                                                                />
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </motion.div>
                                                                                                )}
                                                                                            </AnimatePresence>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : att.type === 'poll' ? (
                                                                                <div className="p-8 bg-amber-50/10 rounded-[28px] border border-amber-100/20 space-y-8 relative z-[70]">
                                                                                    {/* Header: Minimal & Insight-Focused */}
                                                                                    <div className="flex items-center justify-between">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="size-10 rounded-2xl bg-slate-50 flex items-center justify-center text-amber-600/60">
                                                                                                <span className="material-symbols-outlined text-[20px]">ballot</span>
                                                                                            </div>
                                                                                            <div>
                                                                                                <h4 className="text-[13px] font-bold text-brand-navy">Interactive Poll</h4>
                                                                                                <p className="text-[10px] text-muted-gray/60 font-medium">Gather community feedback and insights</p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="space-y-6">
                                                                                        {/* Poll Question Area */}
                                                                                        <div className="group relative space-y-2">
                                                                                            <div className="flex items-center justify-between px-1">
                                                                                                <label className="text-[10px] font-bold text-brand-navy/40">Poll Question</label>
                                                                                                <span className="material-symbols-outlined text-[14px] text-muted-gray/20 group-focus-within:text-amber-500/40 transition-colors">help_outline</span>
                                                                                            </div>
                                                                                            <input 
                                                                                                type="text"
                                                                                                placeholder="What would you like to ask the community?"
                                                                                                className="w-full bg-transparent border-b border-amber-100/50 py-3 text-[13px] font-bold text-brand-navy outline-none placeholder:text-muted-gray/30 focus:border-amber-500/30 transition-all"
                                                                                            />
                                                                                        </div>

                                                                                        {/* Etched Options List */}
                                                                                        <div className="space-y-4">
                                                                                            <label className="text-[10px] font-bold text-brand-navy/40 px-1">Poll Options</label>
                                                                                            <div className="grid grid-cols-1 gap-3">
                                                                                                {pollOptions.map((opt, idx) => (
                                                                                                    <div key={idx} className="group flex items-center gap-4 relative">
                                                                                                        <div className="size-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[11px] font-bold text-amber-600/40 group-focus-within:bg-amber-50 group-focus-within:border-amber-100 transition-all">{idx + 1}</div>
                                                                                                        <input
                                                                                                            type="text"
                                                                                                            placeholder={`Option ${idx + 1}...`}
                                                                                                            className="flex-1 bg-transparent border-b border-slate-100 py-2 text-[12px] font-bold text-brand-navy outline-none placeholder:text-muted-gray/20 focus:border-amber-500/20 transition-all"
                                                                                                            value={opt}
                                                                                                            onChange={e => {
                                                                                                                const newOpts = [...pollOptions];
                                                                                                                newOpts[idx] = e.target.value;
                                                                                                                setPollOptions(newOpts);
                                                                                                            }}
                                                                                                        />
                                                                                                        {idx > 1 && (
                                                                                                            <button onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))} className="size-8 rounded-full flex items-center justify-center text-muted-gray/20 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                                                                                                                <span className="material-symbols-outlined text-[18px]">close</span>
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                            <button
                                                                                                onClick={() => setPollOptions([...pollOptions, ''])}
                                                                                                className="mt-4 px-4 py-2 border border-dashed border-amber-200/60 rounded-xl text-[10px] font-bold text-amber-600/60 hover:bg-amber-50 hover:border-amber-500/40 transition-all flex items-center gap-2"
                                                                                            >
                                                                                                <span className="material-symbols-outlined text-[16px]">add</span>
                                                                                                Add Another Option
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            ) : null}
                                                                            <button
                                                                                onClick={() => removeAttachment(att.id)}
                                                                                className="absolute -top-2 -right-2 size-8 bg-white border border-slate-100 rounded-full flex items-center justify-center text-muted-gray hover:text-red-500 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-10"
                                                                            >
                                                                                <span className="material-symbols-outlined text-[16px]">close</span>
                                                                            </button>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className={cn(
                                                                    "relative z-10",
                                                                    (!isAudienceMenuOpen && !isAttachmentMenuOpen) && "overflow-hidden"
                                                                )}
                                                            >
                                                                <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                                                                    {/* Row 1: Attachments & Targeting */}
                                                                    <div className="flex items-center justify-between">
                                                                        {/* Surgical Expanding Smart-Add Menu */}
                                                                        <div className="flex items-center gap-1.5">
                                                                            <button
                                                                                onClick={() => setIsAttachmentMenuOpen(!isAttachmentMenuOpen)}
                                                                                className={cn(
                                                                                    "size-9 rounded-full flex items-center justify-center transition-all",
                                                                                    isAttachmentMenuOpen
                                                                                        ? "bg-primary text-white rotate-45 shadow-lg shadow-primary/20"
                                                                                        : "bg-transparent text-brand-navy/50 hover:text-brand-navy hover:bg-slate-50"
                                                                                )}
                                                                            >
                                                                                <span className="material-symbols-outlined text-[20px]">add</span>
                                                                            </button>

                                                                            <AnimatePresence>
                                                                                {isAttachmentMenuOpen && (
                                                                                    <motion.div
                                                                                        initial={{ width: 0, opacity: 0 }}
                                                                                        animate={{ width: 'auto', opacity: 1 }}
                                                                                        exit={{ width: 0, opacity: 0 }}
                                                                                        className="flex items-center gap-1.5 overflow-hidden"
                                                                                    >
                                                                                        <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
                                                                                        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'file')} />

                                                                                        <button
                                                                                            onClick={() => imageInputRef.current?.click()}
                                                                                            className="size-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-muted-gray/60 transition-all border border-transparent hover:border-slate-100"
                                                                                            title="Add Image"
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-[20px]">image</span>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => fileInputRef.current?.click()}
                                                                                            className="size-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-muted-gray/60 transition-all border border-transparent hover:border-slate-100"
                                                                                            title="Attach PDF/File"
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-[20px]">description</span>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => addSpecialAttachment('location')}
                                                                                            className="size-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-muted-gray/60 transition-all border border-transparent hover:border-slate-100"
                                                                                            title="Add Location"
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-[20px]">location_on</span>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => addSpecialAttachment('event')}
                                                                                            className="size-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-muted-gray/60 transition-all border border-transparent hover:border-slate-100"
                                                                                            title="Schedule Event"
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => addSpecialAttachment('poll')}
                                                                                            className="size-9 rounded-full hover:bg-slate-50 flex items-center justify-center text-muted-gray/60 transition-all border border-transparent hover:border-slate-100"
                                                                                            title="Create Poll"
                                                                                        >
                                                                                            <span className="material-symbols-outlined text-[20px]">ballot</span>
                                                                                        </button>
                                                                                    </motion.div>
                                                                                )}
                                                                            </AnimatePresence>

                                                                            <div className="w-px h-6 bg-slate-100 mx-1" />

                                                                            <div className="relative">
                                                                                <button
                                                                                    onClick={() => setIsAudienceMenuOpen(!isAudienceMenuOpen)}
                                                                                    className={cn(
                                                                                        "flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all",
                                                                                        (selectedAudiences.length > 0 || selectedClasses.length > 0)
                                                                                            ? "bg-brand-navy/5 text-brand-navy"
                                                                                            : "bg-slate-50 text-muted-gray hover:bg-slate-100"
                                                                                    )}
                                                                                >
                                                                                    <span className="material-symbols-outlined text-[16px]">
                                                                                        {selectedAudiences.includes('Global') ? 'public' : 'groups'}
                                                                                    </span>
                                                                                    {selectedAudiences.length === 1 && selectedClasses.length === 0
                                                                                        ? `Post to ${selectedAudiences[0]}`
                                                                                        : `Post to ${selectedAudiences.length + selectedClasses.length} Groups`}
                                                                                    <span className={cn(
                                                                                        "material-symbols-outlined text-[16px] transition-transform duration-300",
                                                                                        isAudienceMenuOpen && "rotate-180"
                                                                                    )}>
                                                                                        expand_more
                                                                                    </span>
                                                                                </button>

                                                                                {/* Refined Searchable Audience Menu */}
                                                                                <AnimatePresence>
                                                                                    {isAudienceMenuOpen && (
                                                                                        <motion.div
                                                                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                                            className="absolute top-full left-0 mt-3 w-[320px] bg-white rounded-3xl shadow-2xl shadow-brand-navy/20 border border-slate-100 flex flex-col z-[100] overflow-hidden"
                                                                                            style={{ maxHeight: '400px' }}
                                                                                        >
                                                                                            {/* Search Header */}
                                                                                            <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                                                                                                <div className="relative">
                                                                                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-muted-gray/40">search</span>
                                                                                                    <input
                                                                                                        autoFocus
                                                                                                        type="text"
                                                                                                        placeholder="Search groups or classes..."
                                                                                                        value={audienceSearch}
                                                                                                        onChange={(e) => setAudienceSearch(e.target.value)}
                                                                                                        className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-[12px] outline-none focus:border-brand-navy/20 transition-all"
                                                                                                    />
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                                                                                                {/* Broad Groups Section */}
                                                                                                <div className="space-y-2">
                                                                                                    <span className="text-[10px] font-bold text-brand-navy/30 uppercase tracking-widest px-1">Institutional Groups</span>
                                                                                                    <div className="space-y-1">
                                                                                                        {[
                                                                                                            { id: 'Global', label: 'Global (All Schools)' },
                                                                                                            { id: 'School-wide', label: 'Our School (All People)' },
                                                                                                            { id: 'Faculty', label: 'Faculty & Teachers' },
                                                                                                            { id: 'Parents', label: 'Parents' },
                                                                                                            { id: 'Students', label: 'Students' }
                                                                                                        ].filter(opt => opt.label.toLowerCase().includes(audienceSearch.toLowerCase())).map(opt => {
                                                                                                            const isActive = selectedAudiences.includes(opt.id);
                                                                                                            return (
                                                                                                                <button
                                                                                                                    key={opt.id}
                                                                                                                    onClick={() => {
                                                                                                                        if (selectedAudiences.includes(opt.id)) {
                                                                                                                            setSelectedAudiences(selectedAudiences.filter(a => a !== opt.id));
                                                                                                                        } else {
                                                                                                                            setSelectedAudiences([...selectedAudiences, opt.id]);
                                                                                                                        }
                                                                                                                    }}
                                                                                                                    className={cn(
                                                                                                                        "w-full flex items-center justify-between p-2.5 rounded-xl transition-all group",
                                                                                                                        isActive ? "bg-brand-navy/5" : "hover:bg-slate-50"
                                                                                                                    )}
                                                                                                                >
                                                                                                                    <div className="flex items-center gap-3">
                                                                                                                        <div className={cn("size-4 rounded-md border flex items-center justify-center transition-all", isActive ? "bg-brand-navy border-brand-navy" : "border-slate-200 group-hover:border-slate-300")}>
                                                                                                                            {isActive && <span className="material-symbols-outlined text-[12px] text-[#D9EA85]">check</span>}
                                                                                                                        </div>
                                                                                                                        <span className={cn("text-[11px] font-bold", isActive ? "text-brand-navy" : "text-muted-gray")}>{opt.label}</span>
                                                                                                                    </div>
                                                                                                                </button>
                                                                                                            );
                                                                                                        })}
                                                                                                    </div>
                                                                                                </div>

                                                                                                {/* Custom Class Section */}
                                                                                                <div className="space-y-2">
                                                                                                    <div className="flex items-center justify-between px-1">
                                                                                                        <span className="text-[10px] font-bold text-brand-navy/30 uppercase tracking-widest">Custom Class Selection</span>
                                                                                                        <button
                                                                                                            onClick={() => {
                                                                                                                const allCls = ["10A", "10B", "9A", "9C", "8B", "7A"];
                                                                                                                if (selectedClasses.length === allCls.length) {
                                                                                                                    setSelectedClasses([]);
                                                                                                                } else {
                                                                                                                    setSelectedClasses(allCls);
                                                                                                                }
                                                                                                            }}
                                                                                                            className="text-[9px] font-bold text-primary hover:underline"
                                                                                                        >
                                                                                                            {selectedClasses.length === 6 ? "Unselect All" : "Select All"}
                                                                                                        </button>
                                                                                                    </div>
                                                                                                    <div className="space-y-1">
                                                                                                        {["10A", "10B", "9A", "9C", "8B", "7A"].filter(cls => cls.toLowerCase().includes(audienceSearch.toLowerCase())).map(cls => {
                                                                                                            const isActive = selectedClasses.includes(cls);
                                                                                                            return (
                                                                                                                <button
                                                                                                                    key={cls}
                                                                                                                    onClick={() => {
                                                                                                                        if (selectedClasses.includes(cls)) {
                                                                                                                            setSelectedClasses(selectedClasses.filter(c => c !== cls));
                                                                                                                        } else {
                                                                                                                            setSelectedClasses([...selectedClasses, cls]);
                                                                                                                        }
                                                                                                                    }}
                                                                                                                    className={cn(
                                                                                                                        "w-full flex items-center justify-between p-2.5 rounded-xl transition-all group",
                                                                                                                        isActive ? "bg-primary/5" : "hover:bg-slate-50"
                                                                                                                    )}
                                                                                                                >
                                                                                                                    <div className="flex items-center gap-3">
                                                                                                                        <div className={cn("size-4 rounded-md border flex items-center justify-center transition-all", isActive ? "bg-primary border-primary" : "border-slate-200 group-hover:border-slate-300")}>
                                                                                                                            {isActive && <span className="material-symbols-outlined text-[12px] text-white">check</span>}
                                                                                                                        </div>
                                                                                                                        <span className={cn("text-[11px] font-bold", isActive ? "text-primary" : "text-muted-gray")}>Grade {cls}</span>
                                                                                                                    </div>
                                                                                                                </button>
                                                                                                            );
                                                                                                        })}
                                                                                                    </div>
                                                                                                </div>
                                                                                            </div>

                                                                                            <div className="p-4 border-t border-slate-50">
                                                                                                <button
                                                                                                    onClick={() => setIsAudienceMenuOpen(false)}
                                                                                                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-[11px] font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/10"
                                                                                                >
                                                                                                    Apply Selection
                                                                                                </button>
                                                                                            </div>
                                                                                        </motion.div>
                                                                                    )}
                                                                                </AnimatePresence>
                                                                            </div>

                                                                            <select
                                                                                value={postCategory}
                                                                                onChange={(e) => setPostCategory(e.target.value)}
                                                                                className="bg-slate-50 border-none rounded-xl px-3 py-1.5 text-[11px] font-bold text-muted-gray outline-none cursor-pointer hover:bg-slate-100 transition-all"
                                                                            >
                                                                                <option>Academic</option>
                                                                                <option>Events</option>
                                                                                <option>Campus</option>
                                                                            </select>
                                                                        </div>

                                                                    </div>
                                                                </div>

                                                                {/* Row 2: Final Actions */}
                                                                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50/50">
                                                                    <button
                                                                        onClick={() => {
                                                                            setIsExpanded(false);
                                                                            setPostContent("");
                                                                            setAttachments([]);
                                                                            setEventDetails({ title: '', date: '', time: '', venue: '', rsvp: false });
                                                                            setPollOptions(['', '']);
                                                                        }}
                                                                        className="px-5 py-2 rounded-xl text-[12px] font-bold text-muted-gray hover:bg-slate-50 transition-all"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                    <PDSButton
                                                                        variant="primary"
                                                                        size="sm"
                                                                        disabled={(!postContent.trim() && attachments.length === 0) || (selectedAudiences.length === 0 && selectedClasses.length === 0)}
                                                                        onClick={() => {
                                                                            console.log("Posting:", { postContent, postCategory, selectedAudiences, selectedClasses, attachments, eventDetails, pollOptions });
                                                                            setPostContent("");
                                                                            setIsExpanded(false);
                                                                            setSelectedAudiences(["School-wide"]);
                                                                            setSelectedClasses([]);
                                                                            setAttachments([]);
                                                                            setEventDetails({ title: '', date: '', time: '', venue: '', rsvp: false });
                                                                            setPollOptions(['', '']);
                                                                            setIsAudienceMenuOpen(false);
                                                                        }}
                                                                        className="px-8 rounded-xl h-10 shadow-lg shadow-primary/10"
                                                                    >
                                                                        Publish Post
                                                                    </PDSButton>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>

                                            {/* Category Filters */}
                                            <div className="flex items-center gap-3 border-b border-slate-50 pb-8 mb-8 overflow-x-auto no-scrollbar">
                                                {["all", "institutional", "faculty", "student", "parent", "class"].map((cat) => {
                                                    const isActive = activeCategory === cat;
                                                    return (
                                                        <button
                                                            key={cat}
                                                            onClick={() => setActiveCategory(cat as any)}
                                                            className={cn(
                                                                "text-[12px] font-bold px-5 py-1.5 rounded-xl transition-all capitalize whitespace-nowrap",
                                                                isActive
                                                                    ? "bg-[#152328] text-[#D9EA85] shadow-sm"
                                                                    : "bg-slate-50 text-muted-gray/60 hover:bg-slate-100 hover:text-brand-navy"
                                                            )}
                                                        >
                                                            {cat}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            <div className="space-y-16">
                                                {posts.map(post => (
                                                    <CommunityPost key={post.id} post={post} />
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'discussion' && (
                                    <motion.div
                                        key="discussion-tab"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <QnAHub />
                                    </motion.div>
                                )}

                                {activeTab === 'moderation' && (
                                    <motion.div
                                        key="moderation-tab"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="space-y-12">
                                            <div className="flex items-center justify-between mb-8">
                                                <h2 className="text-[17px] font-semibold tracking-tight text-brand-navy">Pending Items</h2>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[11px] font-bold text-muted-gray">Filter:</span>
                                                    <select className="bg-white border border-slate-100 rounded-xl px-4 py-2 text-[11px] font-bold text-brand-navy outline-none cursor-pointer hover:border-slate-200 transition-all">
                                                        <option>All pending</option>
                                                        <option>Reported only</option>
                                                        <option>Verification</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {[
                                                    { id: 1, author: "Teacher Anita", avatar: "/Avatar/Female Avatar Age35.png", category: "Academic", content: "Congratulations to our Class Level Toppers of the Chandra Dina Quiz! 🌕✨ Your knowledge about the lunar cycles and India's space missions is truly stellar. Proud of our Grade 8 stars!", time: "5 mins ago", status: "Pending", severity: "medium", image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=600" },
                                                    { id: 2, author: "Priya K.", avatar: "/Avatar/Female Avatar Age25.png", category: "Events", content: "This is a great initiative! Can we also include the secondary section in this fair? The students are very excited and have prepared some amazing stalls.", time: "25 mins ago", status: "Pending", severity: "medium" },
                                                    { id: 3, author: "Ananya M.", avatar: "/Avatar/Female Avatar Age20.png", category: "Campus", content: "Found a lost water bottle near the basketball court. Left it at the reception. Please claim if yours by showing the identification tag.", time: "1 hour ago", status: "Pending", severity: "low", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" },
                                                    { id: 4, author: "Suresh P.", avatar: "/Avatar/Male Avatar Age45.png", category: "Academic", content: "When is the next parent-teacher meeting scheduled for Grade 8? Need to plan accordingly as some of us have travel plans.", time: "2 hours ago", status: "Pending", severity: "low" }
                                                ].map((item) => {
                                                    const isExpanded = expandedModerationId === item.id;
                                                    return (
                                                        <div
                                                            key={item.id}
                                                            onClick={() => setExpandedModerationId(isExpanded ? null : item.id)}
                                                            className={cn(
                                                                "group bg-white hover:bg-slate-50/50 border border-slate-100/60 rounded-[24px] transition-all cursor-pointer overflow-hidden p-6",
                                                                isExpanded && "shadow-lg shadow-slate-200/20"
                                                            )}
                                                        >
                                                            <div className="flex items-start gap-6">
                                                                {/* Left: Avatar/Status */}
                                                                <div className="relative flex-shrink-0">
                                                                    <div className="size-14 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-brand-navy font-bold text-[16px]">
                                                                        {item.avatar ? (
                                                                            <img src={item.avatar} className="size-full object-cover" />
                                                                        ) : (
                                                                            item.author[0]
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Center: Info */}
                                                                <div className="flex-1 min-w-0 pt-0.5">
                                                                    <div className="flex items-center gap-3 mb-1">
                                                                        <span className="text-[14px] font-bold text-brand-navy tracking-tight">{item.author}</span>
                                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-muted-gray uppercase tracking-widest">{item.category}</span>
                                                                        <span className="text-[11px] font-medium text-muted-gray/40">{item.time}</span>
                                                                        <span className={cn(
                                                                            "material-symbols-outlined text-[18px] text-muted-gray/30 ml-auto transition-transform",
                                                                            isExpanded && "rotate-180"
                                                                        )}>
                                                                            expand_more
                                                                        </span>
                                                                    </div>
                                                                    <p className={cn(
                                                                        "text-[13px] text-brand-navy/70 leading-relaxed",
                                                                        !isExpanded && "truncate pr-12"
                                                                    )}>
                                                                        {item.content}
                                                                    </p>

                                                                    {/* Expanded Media */}
                                                                    {isExpanded && item.image && (
                                                                        <div className="mt-6 w-full max-w-xl aspect-video rounded-2xl overflow-hidden border border-slate-100 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                                                            <img src={item.image} className="size-full object-cover" />
                                                                        </div>
                                                                    )}

                                                                    {/* Actions (Always visible but refined) */}
                                                                    <div className={cn(
                                                                        "flex items-center gap-3 transition-all",
                                                                        isExpanded ? "mt-8" : "mt-3 opacity-0 group-hover:opacity-100"
                                                                    )}>
                                                                        <PDSButton
                                                                            variant="primary"
                                                                            size="sm"
                                                                            icon="check_circle"
                                                                            onClick={(e) => { e.stopPropagation(); }}
                                                                        >
                                                                            Approve
                                                                        </PDSButton>
                                                                        <PDSButton
                                                                            variant="tertiary"
                                                                            size="sm"
                                                                            icon="cancel"
                                                                            onClick={(e) => { e.stopPropagation(); }}
                                                                            className="hover:text-red-500 hover:bg-red-50/50"
                                                                        >
                                                                            Reject
                                                                        </PDSButton>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-8 flex justify-center">
                                                <button className="text-[12px] font-bold text-muted-gray hover:text-brand-navy transition-all">View all pending items (12)</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Right Side: Sidebar */}
                        <div className="lg:col-span-4 space-y-12">
                            <AnimatePresence mode="wait">
                                {activeTab === 'feed' && (
                                    <motion.div
                                        key="feed-sidebar"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="space-y-12">
                                            {/* Contributors Module */}
                                            <div className="space-y-6 pt-10 border-t border-slate-50">
                                                <h3 className="font-black text-muted-gray uppercase tracking-[0.2em] mb-6" style={{ fontSize: 'var(--font-size-small)' }}>Contributors</h3>
                                                <div className="space-y-6">
                                                    {[
                                                        { name: "Meera V.", points: 2450, img: "/Avatar/Female Avatar Age22.png" },
                                                        { name: "Arjun T.", points: 2120, img: "/Avatar/Male Avatar Age22.png" },
                                                    ].map((u) => (
                                                        <div key={u.name} className="flex items-center gap-4 group cursor-pointer">
                                                            <div className="size-10 rounded-full overflow-hidden border border-slate-100 group-hover:border-brand-lime transition-all">
                                                                <img src={u.img} className="size-full object-cover" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-brand-navy group-hover:text-brand-lime transition-colors tracking-tight" style={{ fontSize: 'var(--font-size-small)' }}>{u.name}</span>
                                                                <span className="font-bold text-muted-gray uppercase tracking-widest mt-0.5" style={{ fontSize: 'var(--font-size-small)' }}>{u.points} PTS</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Discussions Module */}
                                            <div className="space-y-8 pt-10 border-t border-slate-50">
                                                <h3 className="font-black text-muted-gray uppercase tracking-[0.2em] mb-6" style={{ fontSize: 'var(--font-size-small)' }}>Hot Discussions</h3>
                                                <div className="space-y-8">
                                                    {[
                                                        { q: "Registration for Science Fair?", answers: 4 },
                                                        { q: "Basketball finals tickets?", answers: 12 },
                                                    ].map(q => (
                                                        <div key={q.q} className="group cursor-pointer">
                                                            <p className="font-bold text-brand-navy leading-snug hover:text-brand-lime transition-colors mb-2 tracking-tight" style={{ fontSize: 'var(--font-size-small)' }}>{q.q}</p>
                                                            <span className="font-bold text-muted-gray uppercase tracking-widest" style={{ fontSize: 'var(--font-size-small)' }}>{q.answers} Answers</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'discussion' && (
                                    <motion.div
                                        key="discussion-sidebar"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="space-y-10 sticky top-24">
                                            <div className="p-8 rounded-[32px] bg-tertiary-light">
                                                <h3 className="font-bold text-brand-navy/40 uppercase tracking-widest mb-8 text-[10px]">Discussion Pulse</h3>
                                                <div className="grid grid-cols-2 gap-y-10 gap-x-6">
                                                    {[
                                                        { label: "Active discussions", value: "24", trend: "+12%" },
                                                        { label: "Response speed", value: "14m", trend: "-2m" },
                                                        { label: "Verified answers", value: "85%", trend: "Optimal" },
                                                        { label: "Global reach", value: "1.2k", trend: "+5%" }
                                                    ].map((stat) => (
                                                        <div key={stat.label} className="flex flex-col">
                                                            <span className="text-[12px] font-medium text-muted-gray/60 mb-1.5 tracking-tight">{stat.label}</span>
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-[22px] font-bold text-brand-navy tracking-tight">{stat.value}</span>
                                                                <span className="text-[10px] font-bold text-brand-lime/80">{stat.trend}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'moderation' && (
                                    <motion.div
                                        key="moderation-sidebar"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                    >
                                        <div className="space-y-10 sticky top-16">
                                            <div className="p-8 rounded-[32px] bg-tertiary-light">
                                                <h3 className="font-bold text-brand-navy/40 uppercase tracking-widest mb-8 text-[10px]">Moderation Insights</h3>

                                                <div className="space-y-8">
                                                    <div className="group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[13px] font-bold text-brand-navy">Queue health</span>
                                                            <span className="text-[10px] font-bold text-brand-lime bg-brand-navy px-2 py-0.5 rounded-md">Optimal</span>
                                                        </div>
                                                        <p className="text-[12px] text-muted-gray/60 leading-relaxed">12 items pending. Average resolution time is currently <span className="text-brand-navy font-bold">4.2 minutes</span>.</p>
                                                    </div>

                                                    <div className="group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[13px] font-bold text-brand-navy">Reporting velocity</span>
                                                            <span className="flex items-center text-red-500 font-bold text-[12px]">
                                                                <span className="material-symbols-outlined text-[16px] mr-1">trending_down</span>
                                                                14.2%
                                                            </span>
                                                        </div>
                                                        <p className="text-[12px] text-muted-gray/60 leading-relaxed">Lower reporting frequency compared to last week. Community sentiment is <span className="text-brand-navy font-bold">positive</span>.</p>
                                                    </div>

                                                    <div className="group">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[13px] font-bold text-brand-navy">Critical area</span>
                                                            <span className="text-[11px] font-bold text-muted-gray/40">Campus Interaction</span>
                                                        </div>
                                                        <p className="text-[12px] text-muted-gray/60 leading-relaxed">Most reported items originate from the <span className="text-brand-navy font-bold">Campus Life</span> category.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
