import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Layers, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MapStyleSelectorProps {
  currentStyle: string;
  onStyleChange: (style: string) => void;
}

const mapStyles = [
  {
    name: 'Streets',
    value: 'mapbox://styles/mapbox/streets-v12',
    icon: '🗺️',
    description: 'Default street map'
  },
  {
    name: 'Satellite',
    value: 'mapbox://styles/mapbox/satellite-v9',
    icon: '🛰️',
    description: 'Satellite imagery'
  },
  {
    name: 'Satellite Streets',
    value: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: '🌍',
    description: 'Satellite with labels'
  },
  {
    name: 'Outdoors',
    value: 'mapbox://styles/mapbox/outdoors-v12',
    icon: '🏔️',
    description: 'Terrain and trails'
  },
  {
    name: 'Light',
    value: 'mapbox://styles/mapbox/light-v11',
    icon: '☀️',
    description: 'Minimal light theme'
  },
  {
    name: 'Dark',
    value: 'mapbox://styles/mapbox/dark-v11',
    icon: '🌙',
    description: 'Dark theme'
  },
  {
    name: 'Navigation Day',
    value: 'mapbox://styles/mapbox/navigation-day-v1',
    icon: '🧭',
    description: 'Navigation optimized'
  },
  {
    name: 'Navigation Night',
    value: 'mapbox://styles/mapbox/navigation-night-v1',
    icon: '🌃',
    description: 'Navigation night mode'
  },
];

const MapStyleSelector = ({ currentStyle, onStyleChange }: MapStyleSelectorProps) => {
  const [open, setOpen] = useState(false);

  const currentStyleName = mapStyles.find(s => s.value === currentStyle)?.name || 'Streets';

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm shadow-lg border-2 gap-2 h-10 px-3 text-xs sm:text-sm"
          >
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">{currentStyleName}</span>
            <span className="sm:hidden">Map</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Map Style
          </div>
          {mapStyles.map((style) => (
            <DropdownMenuItem
              key={style.value}
              onClick={() => {
                onStyleChange(style.value);
                setOpen(false);
              }}
              className="flex items-center gap-3 cursor-pointer py-2.5"
            >
              <span className="text-lg">{style.icon}</span>
              <div className="flex-1">
                <div className="font-medium text-sm">{style.name}</div>
                <div className="text-xs text-muted-foreground">{style.description}</div>
              </div>
              {currentStyle === style.value && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default MapStyleSelector;

