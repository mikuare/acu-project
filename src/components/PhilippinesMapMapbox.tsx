import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Map, { Marker, NavigationControl, FullscreenControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import MapControlPanel from './MapControlPanel';
import MapStyleSelector from './MapStyleSelector';
import ProjectFormModal from './ProjectFormModal';
import SearchPlaceModal from './SearchPlaceModal';
import LocationConfirmModal from './LocationConfirmModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useUserCredentials } from '@/contexts/UserCredentialsContext';

// Mapbox API Token - Add this to your .env file as VITE_MAPBOX_TOKEN
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

// Philippines center coordinates
const PHILIPPINES_CENTER = {
  longitude: 121.7740,
  latitude: 12.8797,
  zoom: 6,
};

// Branch-specific marker colors
const branchColors = {
  ADC: '#006D5B',    // Green
  QGDC: '#000000',   // Black
  QMB: '#DC2626',    // Bright Red
};

// Custom pin marker component
const CustomMarker = ({ color, size = 40 }: { color: string; size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 36"
    style={{
      cursor: 'pointer',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
    }}
  >
    {/* Pin shape */}
    <path
      d="M12 0C7.03 0 3 4.03 3 9c0 6.5 9 18 9 18s9-11.5 9-18c0-4.97-4.03-9-9-9z"
      fill={color}
      stroke="white"
      strokeWidth="1.5"
    />
    {/* Inner circle/dot */}
    <circle
      cx="12"
      cy="9"
      r="4"
      fill="white"
      opacity="0.9"
    />
  </svg>
);

const PhilippinesMapMapbox = () => {
  const { isUserAuthenticated } = useUserCredentials();
  const [searchParams] = useSearchParams();
  const mapRef = useRef<any>(null);
  const tempMarkerRef = useRef<{ longitude: number; latitude: number } | null>(null);
  const geoWatchId = useRef<number | null>(null);
  const geoBestFix = useRef<{ lat: number; lng: number; accuracy: number } | null>(null);
  const geoTimeoutTimer = useRef<number | null>(null);
  
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [isPinMode, setIsPinMode] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [tempMarker, setTempMarker] = useState<{ longitude: number; latitude: number } | null>(null);
  const [highlightMarker, setHighlightMarker] = useState<{ longitude: number; latitude: number; animate: boolean } | null>(null);

  const [viewState, setViewState] = useState(PHILIPPINES_CENTER);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');

  // Load projects from database
  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*');

    if (error) {
      console.error('Error loading projects:', error);
      return;
    }

    setProjects(data || []);
  };

  // Set up real-time subscription for project changes
  useEffect(() => {
    loadProjects();

    const channel = supabase
      .channel('map-projects-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Map real-time update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newProject = payload.new as any;
            setProjects((current) => {
              if (current.some(p => p.id === newProject.id)) {
                return current;
              }
              return [...current, newProject];
            });
            toast({
              title: "🆕 New Project",
              description: `Project ${newProject.project_id} added to map`,
              duration: 2000,
            });
          } else if (payload.eventType === 'UPDATE') {
            const updatedProject = payload.new as any;
            setProjects((current) => 
              current.map((p) => p.id === updatedProject.id ? updatedProject : p)
            );
            toast({
              title: "✏️ Project Updated",
              description: `Project ${updatedProject.project_id} has been updated`,
              duration: 2000,
            });
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            setProjects((current) => current.filter((p) => p.id !== deletedId));
            toast({
              title: "🗑️ Project Deleted",
              description: "Project removed from map",
              duration: 2000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Geolocation helpers
  const isEmbeddedInIframe = () => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const isSecureContext = () => window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  const isInPhilippinesBounds = (lat: number, lng: number) => lat >= 4.5 && lat <= 21.5 && lng >= 116.5 && lng <= 126.5;

  const stopGeoWatch = () => {
    if (geoWatchId.current !== null) {
      navigator.geolocation.clearWatch(geoWatchId.current);
      geoWatchId.current = null;
    }
    if (geoTimeoutTimer.current !== null) {
      window.clearTimeout(geoTimeoutTimer.current);
      geoTimeoutTimer.current = null;
    }
  };

  const finalizeLocation = (latitude: number, longitude: number) => {
    if (!isInPhilippinesBounds(latitude, longitude)) {
      toast({
        title: "⚠️ Location Outside Philippines",
        description: `Detected location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) is outside the Philippines.\n\nPlease:\n• Ensure your device location is accurate\n• Use "Pin on Map" to manually select a location\n• Use "Search Place" to find a specific location`,
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    toast({
      title: "✅ Location Confirmed",
      description: `You can now fill in the project details.\nLocation: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      duration: 2000,
    });

    setViewState({
      longitude,
      latitude,
      zoom: 15,
    });

    setTempMarker({ longitude, latitude });
    setSelectedLocation({ lat: latitude, lng: longitude });
    setShowProjectForm(true);
  };

  // Handle Enter Project - robust user location flow
  const handleEnterProject = async () => {
    // Check if user is authenticated
    if (!isUserAuthenticated) {
      toast({
        title: "🔒 Authentication Required",
        description: "Please login with your user credentials to enter a project. Click the 'User Login' button in the header.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: "❌ Geolocation Not Supported",
        description: "Your browser doesn't support location services. Please use a modern browser like Chrome, Firefox, or Safari.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    if (!isSecureContext()) {
      toast({
        title: "❌ Insecure Connection",
        description: "Location services require HTTPS or localhost. Please access this app through a secure connection.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    try {
      if ('permissions' in navigator && (navigator as any).permissions?.query) {
        const status = await (navigator as any).permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'denied') {
          const iframeNote = isEmbeddedInIframe() 
            ? "\n\nNote: This app is embedded in an iframe. The parent page must include allow=\"geolocation *\" attribute." 
            : "";
          toast({
            title: "🚫 Location Access Blocked",
            description: `You must enable location access to use this feature.\n\nSteps:\n1. Click the location icon (🔒) in your browser's address bar\n2. Allow location access for this site\n3. Reload the page and try again${iframeNote}`,
            variant: "destructive",
            duration: 2000,
          });
          return;
        }
      }
    } catch {
      // Ignore Permissions API issues
    }

    toast({
      title: "📍 Requesting Your Location",
      description: "Please click 'Allow' when your browser asks for location permission. Waiting for an accurate GPS fix...",
      duration: 2000,
    });

    geoBestFix.current = null;

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0,
    };

    geoWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        if (isInPhilippinesBounds(latitude, longitude)) {
          if (!geoBestFix.current || accuracy < geoBestFix.current.accuracy) {
            geoBestFix.current = { lat: latitude, lng: longitude, accuracy };
          }
        }

        if (accuracy <= 150 && isInPhilippinesBounds(latitude, longitude)) {
          stopGeoWatch();
          toast({
            title: "✅ Precise Location Found!",
            description: `Accuracy: ±${Math.round(accuracy)} meters\nYou can now enter project details.`,
            duration: 2000,
          });
          finalizeLocation(latitude, longitude);
        }
      },
      (error) => {
        stopGeoWatch();
        console.error('Geolocation error:', error);

        let errorMessage = "Please enable location access to use this feature";
        let errorTitle = "Location Access Error";

        switch (error.code) {
          case error.PERMISSION_DENIED: {
            errorTitle = "🚫 Location Permission Denied";
            const iframeNote = isEmbeddedInIframe() 
              ? "\n\nNote: If this app is embedded, ensure the iframe includes allow=\"geolocation *\"." 
              : "";
            errorMessage = `You must enable location access to use the Enter Project feature.\n\nSteps to enable:\n1. Click the location/lock icon (🔒) in your browser's address bar\n2. Set location permission to "Allow"\n3. Reload the page and try again\n\nAlternatively, use "Pin on Map" or "Search Place" to add a project without location access.${iframeNote}`;
            break;
          }
          case error.POSITION_UNAVAILABLE:
            errorTitle = "📍 Location Unavailable";
            errorMessage = "Your device could not determine your location.\n\nPlease:\n• Ensure GPS/location is enabled on your device\n• Move to an area with better GPS signal (outdoors)\n• Check device location settings\n\nOr use 'Pin on Map' or 'Search Place' instead.";
            break;
          case error.TIMEOUT:
            errorTitle = "⏱️ Location Request Timeout";
            errorMessage = "Location request took too long.\n\nPlease:\n• Ensure you have good GPS signal\n• Try again in a moment\n• Or use 'Pin on Map' or 'Search Place' instead";
            break;
          default:
            errorTitle = "❌ Location Error";
            errorMessage = "An unknown error occurred while getting your location.\n\nPlease try 'Pin on Map' or 'Search Place' instead.";
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
          duration: 2000,
        });
      },
      options
    );

    geoTimeoutTimer.current = window.setTimeout(() => {
      if (geoBestFix.current) {
        const { lat, lng, accuracy } = geoBestFix.current;
        stopGeoWatch();
        toast({
          title: "📍 Using Approximate Location",
          description: `Accuracy: ±${Math.round(accuracy)} meters\n\nFor better accuracy, try again outdoors or use "Pin on Map" to select exact location.`,
          duration: 2000,
        });
        finalizeLocation(lat, lng);
      } else {
        stopGeoWatch();
        toast({
          title: "❌ Unable to Get Location",
          description: "No valid location detected within the Philippines.\n\nPlease:\n• Enable location access in your browser\n• Ensure GPS is enabled on your device\n• Or use 'Pin on Map' or 'Search Place' instead",
          variant: "destructive",
          duration: 2000,
        });
      }
    }, 10000);
  };

  // Handle Pin on Map mode
  const handlePinOnMap = () => {
    // Check if user is authenticated
    if (!isUserAuthenticated) {
      toast({
        title: "🔒 Authentication Required",
        description: "Please login with your user credentials to pin on the map. Click the 'User Login' button in the header.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsPinMode(true);
    toast({
      title: "Pin Mode Active",
      description: "Click anywhere on the map to place a pin",
      duration: 2000,
    });
  };

  // Handle Search Place
  const handleSearchPlace = () => {
    setShowSearchModal(true);
  };

  // Handle location selection from search
  const handleLocationSelect = (lat: number, lng: number, placeName: string) => {
    setViewState({
      longitude: lng,
      latitude: lat,
      zoom: 13,
    });
    
    setTempMarker({ longitude: lng, latitude: lat });
    setSelectedLocation({ lat, lng, name: placeName });
    setShowLocationConfirm(true);
  };

  // Handle location confirmation
  const handleConfirmLocation = () => {
    setShowLocationConfirm(false);
    setShowProjectForm(true);
  };

  const handleCancelLocation = () => {
    setShowLocationConfirm(false);
    setTempMarker(null);
    setSelectedLocation(null);
  };

  // Handle project form success
  const handleProjectSuccess = () => {
    setTempMarker(null);
    setSelectedLocation(null);
    setShowProjectForm(false);
    loadProjects();
  };

  // Handle map click for pin mode
  const onMapClick = useCallback((event: any) => {
    if (!isPinMode) return;

    const { lng, lat } = event.lngLat;
    
    setTempMarker({ longitude: lng, latitude: lat });
    setSelectedLocation({ lat, lng });
    setShowLocationConfirm(true);
    setIsPinMode(false);
  }, [isPinMode]);

  // Cleanup geolocation watchers on unmount
  useEffect(() => {
    return () => {
      stopGeoWatch();
    };
  }, []);

  // Handle navigation from URL parameters
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const projectId = searchParams.get('project');

    if (lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      setViewState({
        longitude,
        latitude,
        zoom: 15,
      });

      setHighlightMarker({ longitude, latitude, animate: true });

      if (projectId) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          setShowProjectDetails(true);
        }
      }

      setTimeout(() => {
        setHighlightMarker(null);
      }, 10000);

      toast({
        title: "📍 Project Location",
        description: "Map centered on selected project location",
        duration: 2000,
      });
    }
  }, [searchParams, projects]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Mapbox Token Missing</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Please add your Mapbox token to the <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">.env</code> file:
          </p>
          <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded text-left text-sm">
            VITE_MAPBOX_TOKEN=your_token_here
          </pre>
          <p className="text-gray-600 dark:text-gray-400 mt-4 text-sm">
            Get your FREE token from: <a href="https://account.mapbox.com/auth/signup/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">mapbox.com</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden shadow-xl ${isPinMode ? 'map-pin-mode' : ''}`}>
      <Map
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={onMapClick}
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        maxBounds={[[116.5, 4.5], [126.5, 21.5]]}
        minZoom={5}
        maxZoom={19}
      >
        {/* Navigation Controls */}
        <NavigationControl position="top-left" />
        <FullscreenControl position="top-left" />

        {/* Project Markers */}
        {projects.map((project) => (
          <Marker
            key={project.id}
            longitude={project.longitude}
            latitude={project.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedProject(project);
              setShowProjectDetails(true);
            }}
          >
            <CustomMarker color={branchColors[project.branch as keyof typeof branchColors]} />
          </Marker>
        ))}

        {/* Temporary Marker (for pin mode and search) */}
        {tempMarker && (
          <Marker
            longitude={tempMarker.longitude}
            latitude={tempMarker.latitude}
            anchor="bottom"
          >
            <CustomMarker color="#3b82f6" size={45} />
          </Marker>
        )}

        {/* Highlight Marker (for URL navigation) */}
        {highlightMarker && (
          <Marker
            longitude={highlightMarker.longitude}
            latitude={highlightMarker.latitude}
            anchor="bottom"
          >
            <div className={highlightMarker.animate ? 'animate-bounce' : ''}>
              <CustomMarker color="#fbbf24" size={50} />
            </div>
          </Marker>
        )}
      </Map>

      {/* Control Panel */}
      <MapControlPanel
        onEnterProject={handleEnterProject}
        onPinOnMap={handlePinOnMap}
        onSearchPlace={handleSearchPlace}
      />

      {/* Map Style Selector */}
      <MapStyleSelector
        currentStyle={mapStyle}
        onStyleChange={setMapStyle}
      />

      {/* Modals */}
      <ProjectFormModal
        open={showProjectForm}
        onOpenChange={setShowProjectForm}
        latitude={selectedLocation?.lat || 0}
        longitude={selectedLocation?.lng || 0}
        onSuccess={handleProjectSuccess}
      />

      <SearchPlaceModal
        open={showSearchModal}
        onOpenChange={setShowSearchModal}
        onLocationSelect={handleLocationSelect}
      />

      <LocationConfirmModal
        open={showLocationConfirm}
        onOpenChange={setShowLocationConfirm}
        latitude={selectedLocation?.lat || 0}
        longitude={selectedLocation?.lng || 0}
        placeName={selectedLocation?.name}
        onConfirm={handleConfirmLocation}
        onCancel={handleCancelLocation}
      />

      <ProjectDetailsModal
        open={showProjectDetails}
        onOpenChange={setShowProjectDetails}
        project={selectedProject}
      />
    </div>
  );
};

export default PhilippinesMapMapbox;

