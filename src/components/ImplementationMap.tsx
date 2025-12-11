import { date } from "zod";
import { useRef, useEffect } from 'react';
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '@/config/mapbox';

// Philippines center coordinates
const PHILIPPINES_CENTER = {
    longitude: 121.7740,
    latitude: 12.8797,
    zoom: 6,
};

// Branch-specific marker colors  
const branchColors = {
    ADC: '#006D5B',    // Teal Green
    QGDC: '#000000',   // Black
    QMB: '#DC2626',    // Bright Red
};

// Status colors
const statusColors = {
    ongoing: '#f97316',      // Orange
    implemented: '#10b981',  // Green
};

// Custom pin marker component with optional checkmark for implemented projects
const CustomMarker = ({
    color,
    size = 40,
    isImplemented = false,
    isSelected = false
}: {
    color: string;
    size?: number;
    isImplemented?: boolean;
    isSelected?: boolean;
}) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 36"
        style={{
            cursor: 'pointer',
            filter: isSelected ? 'drop-shadow(0 4px 8px rgba(255,87,34,0.6))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            transform: isSelected ? 'scale(1.2)' : 'scale(1)',
            transition: 'all 0.3s ease',
        }}
        className={isSelected ? 'animate-pulse' : ''}
    >
        <style>
            {`
                @keyframes drawCheck {
                    from { stroke-dashoffset: 20; opacity: 0; }
                    to { stroke-dashoffset: 0; opacity: 1; }
                }
            `}
        </style>
        {/* Pin shape */}
        <path
            d="M12 0C7.03 0 3 4.03 3 9c0 6.5 9 18 9 18s9-11.5 9-18c0-4.97-4.03-9-9-9z"
            fill={isImplemented ? statusColors.implemented : (isSelected ? '#FF5722' : color)}
            stroke="white"
            strokeWidth="1.5"
        />
        {/* Inner content */}
        {isImplemented ? (
            <path
                d="M 8 9 L 11 12 L 16 7"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                style={{
                    strokeDasharray: 20,
                    strokeDashoffset: 20,
                    animation: 'drawCheck 0.6s ease-out forwards 0.2s'
                }}
            />
        ) : (
            <circle
                cx="12"
                cy="9"
                r="3"
                fill="white"
                opacity="0.8"
            />
        )}
    </svg>
);

interface Project {
    id: string;
    project_id: string;
    description: string;
    status: string;
    branch: "ADC" | "QGDC" | "QMB";
    latitude: number;
    longitude: number;
}

interface ImplementationMapProps {
    projects: Project[];
    selectedProjectId: string | null;
    onProjectSelect: (projectId: string) => void;
    route?: any;
    userLocation?: { latitude: number; longitude: number } | null;
}

const ImplementationMap = ({ projects, selectedProjectId, onProjectSelect, route, userLocation }: ImplementationMapProps) => {
    const mapRef = useRef<any>(null);

    // Fly to selected project
    useEffect(() => {
        if (selectedProjectId && mapRef.current) {
            const selectedProject = projects.find(p => p.id === selectedProjectId);
            if (selectedProject) {
                mapRef.current.flyTo({
                    center: [selectedProject.longitude, selectedProject.latitude],
                    zoom: 14,
                    duration: 1500
                });
            }
        }
    }, [selectedProjectId, projects]);

    if (!MAPBOX_TOKEN) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 p-8">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Mapbox Token Missing</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        Please add your Mapbox token to configure the map.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <Map
                ref={mapRef}
                initialViewState={PHILIPPINES_CENTER}
                mapboxAccessToken={MAPBOX_TOKEN}
                style={{ width: '100%', height: '100%' }}
                mapStyle="mapbox://styles/mapbox/streets-v12"
                maxBounds={[[116.5, 4.5], [126.5, 21.5]]}
                minZoom={5}
                maxZoom={19}
            >
                {/* Navigation Controls */}
                <NavigationControl position="top-right" />

                {/* User Location Marker */}
                {userLocation && (
                    <Marker longitude={userLocation.longitude} latitude={userLocation.latitude}>
                        <div className="relative flex items-center justify-center w-6 h-6">
                            <div className="absolute w-full h-full bg-blue-500 rounded-full opacity-30 animate-ping" />
                            <div className="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-md" />
                        </div>
                    </Marker>
                )}

                {/* Route Line */}
                {route && (
                    <Source id="route" type="geojson" data={route}>
                        <Layer
                            id="route-layer"
                            type="line"
                            layout={{
                                "line-join": "round",
                                "line-cap": "round"
                            }}
                            paint={{
                                "line-color": "#3b82f6",
                                "line-width": 5,
                                "line-opacity": 0.8
                            }}
                        />
                    </Source>
                )}

                {/* Project Markers */}
                {projects.map((project) => (
                    <Marker
                        key={project.id}
                        longitude={project.longitude}
                        latitude={project.latitude}
                        anchor="bottom"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            onProjectSelect(project.id);
                        }}
                    >
                        <CustomMarker
                            color={branchColors[project.branch]}
                            isImplemented={project.status === 'implemented'}
                            isSelected={project.id === selectedProjectId}
                        />
                    </Marker>
                ))}
            </Map>
        </div>
    );
};

export default ImplementationMap;
