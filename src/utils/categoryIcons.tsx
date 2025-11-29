import {
    Building2,
    Waves,
    Droplets,
    Droplet,
    Construction
} from "lucide-react";

// Custom Icon Components for uploaded images
const BridgeIcon = ({ className }: { className?: string }) => (
    <img src="/icons/bridge.png" alt="Bridge" className={className} style={{ objectFit: 'contain' }} />
);

const RoadIcon = ({ className }: { className?: string }) => (
    <img src="/icons/road.png" alt="Road" className={className} style={{ objectFit: 'contain' }} />
);

export const getCategoryIcon = (category: string) => {
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
