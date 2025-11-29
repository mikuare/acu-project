import { MapPin, Search, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapControlPanelProps {
  onEnterProject: () => void;
  onPinOnMap: () => void;
  onSearchPlace: () => void;
}

const MapControlPanel = ({ onEnterProject, onPinOnMap, onSearchPlace }: MapControlPanelProps) => {
  return (
    <div className="absolute bottom-3 sm:bottom-6 left-2 sm:left-6 z-[1000] bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-lg shadow-2xl border-2 border-slate-200 dark:border-slate-700 p-2 sm:p-4">
      <div className="flex flex-col gap-1.5 sm:gap-2.5 min-w-[140px] sm:min-w-[180px]">
        <Button
          onClick={onEnterProject}
          className="flex items-center gap-1.5 sm:gap-2 w-full justify-start text-xs sm:text-sm font-medium h-9 sm:h-11 px-2 sm:px-4"
          variant="default"
          title="Use your current device location to add a project. Location access required - please allow when prompted."
        >
          <Locate className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">Enter Project (Use My Location)</span>
        </Button>
        <Button
          onClick={onPinOnMap}
          className="flex items-center gap-1.5 sm:gap-2 w-full justify-start text-xs sm:text-sm font-medium h-9 sm:h-11 px-2 sm:px-4"
          variant="outline"
        >
          <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">Pin on Map</span>
        </Button>
        <Button
          onClick={onSearchPlace}
          className="flex items-center gap-1.5 sm:gap-2 w-full justify-start text-xs sm:text-sm font-medium h-9 sm:h-11 px-2 sm:px-4"
          variant="outline"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="truncate">Search Place</span>
        </Button>
      </div>
    </div>
  );
};

export default MapControlPanel;
