import {
    Building2,
    Waves,
    Droplets,
    Droplet,
    Construction,
    Hammer,
    Boxes,
    Box,
    Package,
    Warehouse,
    Factory,
    HardHat,
    Truck,
    Forklift,
    Container,
    Shovel,
    Pickaxe,
    Wrench,
    BrickWall,
    House,
    Landmark,
    CheckCircle,
    Clock,
    XCircle,
    PauseCircle,
    Circle,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface ProjectCategoryConfig {
    label: string;
    icon: string;
}

export interface ProjectStatusConfig {
    value: string;
    label: string;
}

// Custom Icon Components for uploaded images
const BridgeIcon = ({ className }: { className?: string }) => (
    <img src="/icons/bridge.png" alt="Bridge" className={className} style={{ objectFit: 'contain' }} />
);

const RoadIcon = ({ className }: { className?: string }) => (
    <img src="/icons/road.png" alt="Road" className={className} style={{ objectFit: 'contain' }} />
);

type IconComponent = LucideIcon | ((props: { className?: string }) => JSX.Element);

export const CATEGORY_ICON_OPTIONS: Array<{ value: string; label: string; icon: IconComponent }> = [
    { value: "bridge", label: "Bridge", icon: BridgeIcon },
    { value: "building", label: "Building", icon: Building2 },
    { value: "waves", label: "Flood/Drainage", icon: Waves },
    { value: "road", label: "Road", icon: RoadIcon },
    { value: "droplets", label: "Sewerage/Plants", icon: Droplets },
    { value: "droplet", label: "Water", icon: Droplet },
    { value: "construction", label: "Construction", icon: Construction },
    { value: "hammer", label: "Works", icon: Hammer },
    { value: "boxes", label: "Materials / Boxes", icon: Boxes },
    { value: "box", label: "Box", icon: Box },
    { value: "package", label: "Package", icon: Package },
    { value: "warehouse", label: "Warehouse", icon: Warehouse },
    { value: "factory", label: "Factory / Plant", icon: Factory },
    { value: "hard_hat", label: "Safety / Hard Hat", icon: HardHat },
    { value: "truck", label: "Truck / Delivery", icon: Truck },
    { value: "forklift", label: "Forklift", icon: Forklift },
    { value: "container", label: "Container", icon: Container },
    { value: "shovel", label: "Excavation / Shovel", icon: Shovel },
    { value: "pickaxe", label: "Ground Works", icon: Pickaxe },
    { value: "wrench", label: "Utilities / Repair", icon: Wrench },
    { value: "brick_wall", label: "Masonry / Wall", icon: BrickWall },
    { value: "house", label: "Housing / Facility", icon: House },
    { value: "landmark", label: "Public Building", icon: Landmark },
];

export const DEFAULT_PROJECT_CATEGORIES: ProjectCategoryConfig[] = [
    { label: "Bridges", icon: "bridge" },
    { label: "Buildings and Facilities", icon: "building" },
    { label: "Flood Control and Drainage", icon: "waves" },
    { label: "Roads", icon: "road" },
    { label: "Septage and Sewerage Plants", icon: "droplets" },
    { label: "Water Provision and Storage", icon: "droplet" },
];

export const DEFAULT_PROJECT_STATUSES: ProjectStatusConfig[] = [
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
];

export const STATUS_ICON_OPTIONS: Array<{ value: string; label: string; icon: LucideIcon }> = [
    { value: "ongoing", label: "Ongoing", icon: Clock },
    { value: "completed", label: "Completed", icon: CheckCircle },
    { value: "implemented", label: "Implemented", icon: CheckCircle },
    { value: "not_started", label: "Not Started", icon: Circle },
    { value: "paused", label: "Paused", icon: PauseCircle },
    { value: "cancelled", label: "Cancelled", icon: XCircle },
];

export const normalizeStatusValue = (label: string) =>
    label
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");

export const normalizeProjectCategories = (value: unknown): ProjectCategoryConfig[] => {
    if (!Array.isArray(value)) {
        return DEFAULT_PROJECT_CATEGORIES;
    }

    const categories = value
        .map((item) => {
            if (typeof item === "string") {
                return { label: item.trim(), icon: "construction" };
            }

            if (!item || typeof item !== "object") {
                return null;
            }

            const record = item as Partial<ProjectCategoryConfig>;
            const label = record.label?.trim();
            if (!label) {
                return null;
            }

            return {
                label,
                icon: record.icon || "construction",
            };
        })
        .filter((item): item is ProjectCategoryConfig => Boolean(item));

    return categories.length > 0 ? categories : DEFAULT_PROJECT_CATEGORIES;
};

export const normalizeProjectStatuses = (value: unknown): ProjectStatusConfig[] => {
    if (!Array.isArray(value)) {
        return DEFAULT_PROJECT_STATUSES;
    }

    const statuses = value
        .map((item) => {
            if (typeof item === "string") {
                const label = item.trim();
                return label ? { value: normalizeStatusValue(label), label } : null;
            }

            if (!item || typeof item !== "object") {
                return null;
            }

            const record = item as Partial<ProjectStatusConfig>;
            const label = record.label?.trim();
            const value = (record.value || normalizeStatusValue(label || "")).trim();

            if (!label || !value) {
                return null;
            }

            return { value, label };
        })
        .filter((item): item is ProjectStatusConfig => Boolean(item));

    return statuses.length > 0 ? statuses : DEFAULT_PROJECT_STATUSES;
};

const getIconByName = (iconName: string) =>
    CATEGORY_ICON_OPTIONS.find((option) => option.value === iconName)?.icon || Construction;

export const getCategoryIcon = (category: string, configuredCategories?: ProjectCategoryConfig[]) => {
    const configuredIcon = configuredCategories?.find((item) => item.label === category)?.icon;

    if (configuredIcon) {
        return getIconByName(configuredIcon);
    }

    switch (category) {
        case "Bridges":
            return BridgeIcon;
        case "Buildings and Facilities":
            return Building2;
        case "Flood Control and Drainage":
            return Waves;
        case "Roads":
            return RoadIcon;
        case "Septage and Sewerage Plants":
            return Droplets;
        case "Water Provision and Storage":
            return Droplet;
        default:
            return Construction;
    }
};
