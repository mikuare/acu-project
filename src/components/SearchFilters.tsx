import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter, Map as MapIcon, LayoutList, MapPin, Calendar } from "lucide-react";
import { PROJECT_CATEGORIES, REGIONS, PROVINCES_BY_REGION, Region } from '@/utils/philippineData';
import { getCategoryIcon } from '@/utils/categoryIcons';

export interface FilterState {
    search: string;
    category: string;
    region: string;
    province: string;
    year: string;
    status: string;
}

interface SearchFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    availableYears: number[];
    viewMode: 'map' | 'table';
    onViewModeChange: (mode: 'map' | 'table') => void;
    className?: string;
    currentStatus: string;
}

const SearchFilters = ({ onFilterChange, availableYears, viewMode, onViewModeChange, className = "", currentStatus }: SearchFiltersProps) => {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [region, setRegion] = useState("all");
    const [province, setProvince] = useState("all");
    const [year, setYear] = useState("all");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onFilterChange({
                search,
                category,
                region,
                province,
                year,
                status: currentStatus
            });
        }, 300);

        return () => clearTimeout(timer);
    }, [search, category, region, province, year, currentStatus, onFilterChange]);

    const handleRegionChange = (value: string) => {
        setRegion(value);
        setProvince("all"); // Reset province when region changes
    };

    const clearFilters = () => {
        setSearch("");
        setCategory("all");
        setRegion("all");
        setProvince("all");
        setYear("all");
    };

    return (
        <div className={`space-y-4 bg-card rounded-lg p-4 shadow-sm border border-border/50 ${className}`}>
            {/* Top Row: Search Input */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    placeholder="Search by name, location, project ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 w-full bg-background"
                />
                {search && (
                    <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>

            {/* Bottom Row: Filters and View Toggle */}
            <div className="flex flex-col lg:flex-row gap-3 items-center">
                {/* Filters Group - Hidden on mobile (< 768px) */}
                <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-2 flex-1 w-full">
                    {/* Category Filter */}
                    <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2 text-left w-full overflow-hidden">
                                <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="flex flex-col leading-none min-w-0">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Category</span>
                                    <span className="font-semibold text-sm truncate">
                                        {category === 'all' ? 'All' : category}
                                    </span>
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">
                                <div className="flex items-center gap-2 font-medium">
                                    <div className="w-4 h-4 flex items-center justify-center">
                                        <span className="text-lg leading-none">∞</span>
                                    </div>
                                    <span>All</span>
                                </div>
                            </SelectItem>
                            {PROJECT_CATEGORIES.map((cat) => {
                                const Icon = getCategoryIcon(cat);
                                return (
                                    <SelectItem key={cat} value={cat}>
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-muted-foreground" />
                                            <span>{cat}</span>
                                        </div>
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>

                    {/* Region Filter */}
                    <Select value={region} onValueChange={handleRegionChange}>
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2 text-left w-full overflow-hidden">
                                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="flex flex-col leading-none min-w-0">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Region</span>
                                    <span className="font-semibold text-sm truncate">
                                        {region === 'all' ? 'All' : region}
                                    </span>
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Regions</SelectItem>
                            {REGIONS.map((reg) => (
                                <SelectItem key={reg} value={reg}>{reg}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Province Filter */}
                    <Select
                        value={province}
                        onValueChange={setProvince}
                        disabled={region === "all"}
                    >
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2 text-left w-full overflow-hidden">
                                <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="flex flex-col leading-none min-w-0">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Province</span>
                                    <span className="font-semibold text-sm truncate">
                                        {province === 'all' ? 'All' : province}
                                    </span>
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Provinces</SelectItem>
                            {region !== "all" && PROVINCES_BY_REGION[region as Region]?.map((prov) => (
                                <SelectItem key={prov} value={prov}>{prov}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Year Filter */}
                    <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="h-10">
                            <div className="flex items-center gap-2 text-left w-full overflow-hidden">
                                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                                <div className="flex flex-col leading-none min-w-0">
                                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Year</span>
                                    <span className="font-semibold text-sm truncate">
                                        {year === 'all' ? 'All' : year}
                                    </span>
                                </div>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {availableYears.map((y) => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* View Toggle */}
                <div className="flex bg-muted p-1 rounded-lg shrink-0">
                    <button
                        onClick={() => onViewModeChange('table')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'table'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        title="Table View"
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange('map')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'map'
                            ? 'bg-[#FF5722] text-white shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                        title="Map View"
                    >
                        <MapIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SearchFilters;
