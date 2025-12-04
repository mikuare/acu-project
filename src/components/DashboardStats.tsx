import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Gavel, CheckCircle2, Building2 } from "lucide-react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { getIslandGroupForRegion, Region } from '@/utils/philippineData';
import { CountUp } from "@/components/ui/CountUp";

interface Project {
    status: string;
    region?: string;
    branch?: string;
    contract_cost?: number | null;
}

interface DashboardStatsProps {
    projects: Project[];
    className?: string;
    currentStatus: string;
    onStatusChange: (status: string) => void;
}

interface Breakdown {
    Luzon: number;
    Visayas: number;
    Mindanao: number;
}

const StatCard = ({
    title,
    subtitle,
    count,
    percentage,
    color,
    icon: Icon,
    breakdown,
    isActive,
    isDimmed,
    onClick,
    bubbleColor,
}: {
    title: string;
    subtitle: string;
    count: number;
    percentage: string;
    color: {
        bg: string;
        text: string;
        iconBg: string;
    };
    icon: any;
    breakdown: Breakdown;
    isActive: boolean;
    isDimmed: boolean;
    onClick: () => void;
    bubbleColor: string;
}) => {
    const getRegionPercent = (val: number) => {
        if (count === 0) return "0.0%";
        return `${((val / count) * 100).toFixed(1)}%`;
    };

    return (
        <HoverCard openDelay={0} closeDelay={0}>
            <HoverCardTrigger asChild>
                <Card
                    onClick={onClick}
                    className={`bg-white border-none shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden h-full relative group ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''
                        } ${isDimmed ? 'opacity-40 grayscale' : ''
                        }`}
                >
                    {/* Decorative Circle */}
                    <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${bubbleColor} opacity-20 group-hover:scale-110 transition-transform duration-500`} />

                    <CardContent className="p-6 flex flex-col items-start h-full relative z-10">
                        {/* Icon Box */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${color.iconBg} shadow-sm`}>
                            <Icon className={`w-6 h-6 ${color.text}`} />
                        </div>

                        {/* Count */}
                        <div className="mb-1">
                            <h3 className={`text-4xl font-bold ${color.text} tracking-tight`}>
                                <CountUp end={count} />
                            </h3>
                        </div>

                        {/* Percentage */}
                        <p className="text-xs text-muted-foreground font-medium mb-6">
                            ({percentage}%)
                        </p>

                        {/* Title & Subtitle Container */}
                        <div className="mt-auto">
                            <h4 className="text-sm font-bold uppercase tracking-tight text-slate-700 mb-1">
                                {title}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium">
                                {subtitle}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </HoverCardTrigger>
            <HoverCardContent className="w-64 p-0 border-none shadow-xl bg-[#0B2545] text-white overflow-hidden">
                <div className="p-4 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white/80 border-b border-white/20 pb-2">
                        Regional Breakdown
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-white/90">Luzon</span>
                            <span className="font-bold">{breakdown.Luzon} <span className="text-white/60 text-xs font-normal ml-1">({getRegionPercent(breakdown.Luzon)})</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-white/90">Visayas</span>
                            <span className="font-bold">{breakdown.Visayas} <span className="text-white/60 text-xs font-normal ml-1">({getRegionPercent(breakdown.Visayas)})</span></span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="font-medium text-white/90">Mindanao</span>
                            <span className="font-bold">{breakdown.Mindanao} <span className="text-white/60 text-xs font-normal ml-1">({getRegionPercent(breakdown.Mindanao)})</span></span>
                        </div>
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

const DashboardStats = ({ projects, className, currentStatus, onStatusChange }: DashboardStatsProps) => {
    // Calculate Stats
    const stats = useMemo(() => {
        const counts = {
            total: projects.length,
            ongoing: 0,
            implemented: 0,
            totalCost: 0,
            breakdowns: {
                total: { Luzon: 0, Visayas: 0, Mindanao: 0 },
                ongoing: { Luzon: 0, Visayas: 0, Mindanao: 0 },
                implemented: { Luzon: 0, Visayas: 0, Mindanao: 0 },
            }
        };

        projects.forEach(p => {
            const islandGroup = p.region ? getIslandGroupForRegion(p.region as Region) : null;

            // Helper to increment breakdown
            const incrementBreakdown = (category: keyof typeof counts.breakdowns) => {
                if (islandGroup) {
                    counts.breakdowns[category][islandGroup]++;
                }
            };

            // Total
            incrementBreakdown('total');

            if (p.status === 'ongoing' || p.status === 'active') {
                counts.ongoing++;
                incrementBreakdown('ongoing');
            }
            else if (p.status === 'implemented' || p.status === 'completed') {
                counts.implemented++;
                incrementBreakdown('implemented');
            }

            // Sum up contract cost
            if (p.contract_cost) {
                counts.totalCost += p.contract_cost;
            }
        });

        return counts;
    }, [projects]);

    const getPercentage = (count: number) => {
        return stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : "0";
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            {/* 1. Header Section */}
            <div className="bg-white rounded-t-lg p-4 flex flex-col md:flex-row items-center justify-between border-b-4 border-[#FF5722]">
                {/* Left: Logo */}
                <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-20 h-20 flex items-center justify-center">
                        <img src="/qmaz-logo-new.png" alt="QMAZ Logo" className="w-full h-full object-contain" />
                    </div>
                </div>

                {/* Center: Title */}
                <div className="text-center">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#1a237e] tracking-tight uppercase">
                        QMAZ HOLDINGS INC. PROJECTS MAP
                    </h1>
                    <p className="text-[#FF5722] font-bold text-sm md:text-base tracking-wide uppercase">
                        Track and Manage Project System Implementation
                    </p>
                </div>

                {/* Right: Illustration */}
                <div className="hidden md:flex items-center">
                    <div className="relative">
                        <img src="/header-illustration-new.png" alt="Construction Illustration" className="h-24 w-auto object-contain" />
                    </div>
                </div>
            </div>

            {/* 2. Hero Section */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-lg shadow-lg bg-[#1a237e]">
                {/* Background Image */}
                <img
                    src="/dashboard-hero-new.png"
                    alt="Dashboard Hero"
                    className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Overlay Content - Stats Only */}
                <div className="absolute inset-0 flex flex-col items-center justify-end text-white z-10 p-6 pb-12 text-center">
                    <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center">
                        <div className="text-center">
                            <p className="text-sm md:text-base font-bold uppercase tracking-widest opacity-90 mb-1">Total Projects</p>
                            <p className="text-3xl md:text-4xl font-bold">
                                <CountUp end={stats.total} />
                            </p>
                        </div>
                        <div className="h-12 w-px bg-white/30 hidden md:block"></div>
                        <div className="text-center">
                            <p className="text-sm md:text-base font-bold uppercase tracking-widest opacity-90 mb-1">All Projects Total Cost</p>
                            <p className="text-3xl md:text-4xl font-bold">
                                <CountUp end={stats.totalCost} prefix="₱" />
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Stats Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard
                    title="Total Projects"
                    subtitle="Committed"
                    count={stats.total}
                    percentage="100.0"
                    color={{ bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-100" }}
                    icon={Gavel}
                    breakdown={stats.breakdowns.total}
                    isActive={currentStatus === 'all'}
                    isDimmed={currentStatus !== 'all'}
                    onClick={() => onStatusChange('all')}
                    bubbleColor="bg-purple-600"
                />

                <StatCard
                    title="Ongoing Projects"
                    subtitle="In Progress"
                    count={stats.ongoing}
                    percentage={getPercentage(stats.ongoing)}
                    color={{ bg: "bg-orange-50", text: "text-orange-600", iconBg: "bg-orange-100" }}
                    icon={Building2}
                    breakdown={stats.breakdowns.ongoing}
                    isActive={currentStatus === 'ongoing'}
                    isDimmed={currentStatus !== 'all' && currentStatus !== 'ongoing'}
                    onClick={() => onStatusChange('ongoing')}
                    bubbleColor="bg-orange-600"
                />
                <StatCard
                    title="Implemented Projects"
                    subtitle="Build as specified"
                    count={stats.implemented}
                    percentage={getPercentage(stats.implemented)}
                    color={{ bg: "bg-green-50", text: "text-green-600", iconBg: "bg-green-100" }}
                    icon={CheckCircle2}
                    breakdown={stats.breakdowns.implemented}
                    isActive={currentStatus === 'implemented'}
                    isDimmed={currentStatus !== 'all' && currentStatus !== 'implemented'}
                    onClick={() => onStatusChange('implemented')}
                    bubbleColor="bg-green-600"
                />

            </div>
        </div>
    );
};

export default DashboardStats;
