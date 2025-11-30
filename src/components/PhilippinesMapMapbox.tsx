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
import { MAPBOX_TOKEN } from '@/config/mapbox';
import { getCurrentLocation, requestLocationPermission } from '@/utils/permissions';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

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

interface PhilippinesMapMapboxProps {
  projects: any[];
  onProjectUpdate?: () => void;
  selectedProjectId?: string | null;
  onProjectSelect?: (project: any) => void;
}

const PhilippinesMapMapbox = ({ projects, onProjectUpdate, selectedProjectId, onProjectSelect }: PhilippinesMapMapboxProps) => {
  const { isUserAuthenticated } = useUserCredentials();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [tempMarker, setTempMarker] = useState<{ longitude: number; latitude: number } | null>(null);
  const [highlightMarker, setHighlightMarker] = useState<{ longitude: number; latitude: number; animate: boolean } | null>(null);

  const [viewState, setViewState] = useState(PHILIPPINES_CENTER);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const prevSelectedIdRef = useRef<string | null>(null);

  // Fly to selected project when selectedProjectId changes
  useEffect(() => {
    // Only fly if selectedProjectId actually changed (not just projects array update)
    if (selectedProjectId && selectedProjectId !== prevSelectedIdRef.current && mapRef.current) {
      const selectedProject = projects.find(p => p.id === selectedProjectId);
      if (selectedProject && selectedProject.latitude && selectedProject.longitude) {
        // Fly to the project location
        mapRef.current.flyTo({
          center: [selectedProject.longitude, selectedProject.latitude],
          zoom: 14,
          duration: 1500
        });

        // Highlight the marker
        setHighlightMarker({
          longitude: selectedProject.longitude,
          latitude: selectedProject.latitude,
          animate: true
        });

        // Remove highlight after animation
        setTimeout(() => {
          setHighlightMarker(prev => prev ? { ...prev, animate: false } : null);
        }, 2000);

        // Update the ref to track this selection
        prevSelectedIdRef.current = selectedProjectId;
      }
    }
  }, [selectedProjectId, projects]);

  // Geolocation helpers
  const isEmbeddedInIframe = () => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const isSecureContext = () => window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1';

  // More lenient bounds check - accounts for GPS inaccuracy and border areas
  const isInPhilippinesBounds = (lat: number, lng: number) => {
    // Philippines bounds with buffer for GPS inaccuracy
    const MIN_LAT = 4.0;   // ~4.5 with buffer
    const MAX_LAT = 22.0;  // ~21.5 with buffer
    const MIN_LNG = 116.0; // ~116.5 with buffer
    const MAX_LNG = 127.0; // ~126.5 with buffer

    return lat >= MIN_LAT && lat <= MAX_LAT && lng >= MIN_LNG && lng <= MAX_LNG;
  };

  const stopGeoWatch = async () => {
    if (geoWatchId.current !== null) {
      // Use Capacitor's clearWatch for native apps, navigator for web
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id: geoWatchId.current });
      } else {
        navigator.geolocation.clearWatch(geoWatchId.current);
      }
      geoWatchId.current = null;
    }
    if (geoTimeoutTimer.current !== null) {
      window.clearTimeout(geoTimeoutTimer.current);
      geoTimeoutTimer.current = null;
    }
  };

  const finalizeLocation = (latitude: number, longitude: number, skipBoundsCheck = false) => {
    // Only check bounds if not explicitly skipped (we already checked in calling code)
    if (!skipBoundsCheck && !isInPhilippinesBounds(latitude, longitude)) {
      toast({
        title: "⚠️ Location Outside Philippines",
        description: `Detected location (${latitude.toFixed(4)}, ${longitude.toFixed(4)}) is outside the Philippines.\n\nPlease:\n• Ensure your device location is accurate\n• Use "Pin on Map" to manually select a location\n• Use "Search Place" to find a specific location`,
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    console.log('✅ Finalizing location:', { latitude, longitude });

    // Show success message
    toast({
      title: "✅ Location Confirmed",
      description: `Ready to enter project details.\nLocation: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
      duration: 2000,
    });

    // Update map view to show the location
    setViewState({
      longitude,
      latitude,
      zoom: 15,
    });

    // Set marker and open project form
    setTempMarker({ longitude, latitude });
    setSelectedLocation({ lat: latitude, lng: longitude });
    setShowProjectForm(true);
  };

  // Handle Enter Project - robust user location flow with Capacitor support
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

    // Request location permission (works on both web and native)
    toast({
      title: "📍 Requesting Location Permission",
      description: Capacitor.isNativePlatform()
        ? "Please allow location access in the permission dialog..."
        : "Please click 'Allow' when your browser asks for location permission...",
      duration: 2000,
    });

    try {
      // Request permission first
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        toast({
          title: "🚫 Location Permission Denied",
          description: Capacitor.isNativePlatform()
            ? "You must enable location access in Settings > Apps > ACU Project Map > Permissions.\n\nAlternatively, use 'Pin on Map' or 'Search Place' to add a project without location access."
            : "You must enable location access to use this feature.\n\nSteps:\n1. Click the location icon (🔒) in your browser's address bar\n2. Allow location access for this site\n3. Reload the page and try again\n\nAlternatively, use 'Pin on Map' or 'Search Place'.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      toast({
        title: "✅ Permission Granted",
        description: "Getting your precise location...",
        duration: 2000,
      });

      geoBestFix.current = null;

      // Use Capacitor's watchPosition for both web and native
      const watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
        },
        (position, error) => {
          if (error) {
            stopGeoWatch();
            console.error('Geolocation error:', error);

            let errorMessage = "Please enable location access to use this feature";
            let errorTitle = "Location Access Error";

            if (error.message.includes('denied') || error.message.includes('permission')) {
              errorTitle = "🚫 Location Permission Denied";
              errorMessage = Capacitor.isNativePlatform()
                ? "Location access denied. Please enable it in Settings > Apps > ACU Project Map > Permissions.\n\nAlternatively, use 'Pin on Map' or 'Search Place'."
                : "You must enable location access. Click the location icon (🔒) in your browser's address bar and allow location access.\n\nAlternatively, use 'Pin on Map' or 'Search Place'.";
            } else if (error.message.includes('unavailable')) {
              errorTitle = "📍 Location Unavailable";
              errorMessage = "Your device could not determine your location.\n\nPlease:\n• Ensure GPS/location is enabled on your device\n• Move to an area with better GPS signal (outdoors)\n• Check device location settings\n\nOr use 'Pin on Map' or 'Search Place' instead.";
            } else if (error.message.includes('timeout')) {
              errorTitle = "⏱️ Location Request Timeout";
              errorMessage = "Location request took too long.\n\nPlease:\n• Ensure you have good GPS signal\n• Try again in a moment\n• Or use 'Pin on Map' or 'Search Place' instead";
            }

            toast({
              title: errorTitle,
              description: errorMessage,
              variant: "destructive",
              duration: 3000,
            });
            return;
          }

          if (position) {
            const { latitude, longitude, accuracy } = position.coords;

            console.log('📍 GPS Update:', {
              lat: latitude.toFixed(6),
              lng: longitude.toFixed(6),
              accuracy: accuracy ? Math.round(accuracy) + 'm' : 'unknown',
              inBounds: isInPhilippinesBounds(latitude, longitude)
            });

            // Always save the best fix, even if outside strict bounds initially
            // GPS can be inaccurate when first starting up
            if (!geoBestFix.current || (accuracy && accuracy < geoBestFix.current.accuracy)) {
              geoBestFix.current = { lat: latitude, lng: longitude, accuracy: accuracy || 999 };

              // Show progress toast
              if (isInPhilippinesBounds(latitude, longitude)) {
                console.log(`✓ Location improving: ±${Math.round(accuracy || 999)}m`);
              }
            }

            // Accept good accuracy quickly (50m or better)
            if (accuracy && accuracy <= 50 && isInPhilippinesBounds(latitude, longitude)) {
              stopGeoWatch();
              toast({
                title: "✅ Precise Location Found!",
                description: `Accuracy: ±${Math.round(accuracy)} meters (Excellent!)\nYou can now enter project details.`,
                duration: 2000,
              });
              finalizeLocation(latitude, longitude, true); // Skip bounds check - already verified
            }
            // Accept reasonable accuracy (200m or better) after a few seconds
            else if (accuracy && accuracy <= 200 && isInPhilippinesBounds(latitude, longitude)) {
              // Don't immediately accept, but mark as acceptable
              console.log('✓ Good location found, waiting for possible improvement...');
            }
          }
        }
      );

      geoWatchId.current = watchId;

      // Give GPS more time - 30 seconds for accurate fix (mobile GPS can be slow)
      geoTimeoutTimer.current = window.setTimeout(() => {
        if (geoBestFix.current) {
          const { lat, lng, accuracy } = geoBestFix.current;

          // Check if we got any reasonable location within bounds
          if (isInPhilippinesBounds(lat, lng)) {
            stopGeoWatch();

            if (accuracy <= 300) {
              // Acceptable accuracy
              toast({
                title: "✅ Location Acquired",
                description: `Accuracy: ±${Math.round(accuracy)} meters\n\nThis is sufficient for project entry. For better accuracy, try outdoors.`,
                duration: 2000,
              });
              finalizeLocation(lat, lng, true); // Skip bounds check - already verified
            } else {
              // Lower accuracy but still usable
              toast({
                title: "📍 Using Approximate Location",
                description: `Accuracy: ±${Math.round(accuracy)} meters\n\nLocation may not be precise. For better accuracy:\n• Move outdoors\n• Wait a moment and try again\n• Or use "Pin on Map" to select exact location`,
                duration: 3000,
              });
              finalizeLocation(lat, lng, true); // Skip bounds check - already verified
            }
          } else {
            // Location found but outside Philippines
            stopGeoWatch();
            toast({
              title: "⚠️ Location Outside Philippines",
              description: `Detected location: ${lat.toFixed(4)}, ${lng.toFixed(4)}\n\nThis appears to be outside the Philippines. If you are in the Philippines:\n• Wait for GPS to stabilize\n• Move outdoors for better signal\n• Or use "Pin on Map" to manually select location`,
              variant: "destructive",
              duration: 3000,
            });
          }
        } else {
          // No location at all
          stopGeoWatch();
          toast({
            title: "❌ Unable to Get Location",
            description: "GPS could not determine your location.\n\nPlease:\n• Ensure Location/GPS is enabled in device settings\n• Allow location permission for this app\n• Move to an area with clear sky view (outdoors)\n• Or use 'Pin on Map' or 'Search Place' instead",
            variant: "destructive",
            duration: 3000,
          });
        }
      }, 30000); // Increased from 10s to 30s - GPS needs time!
    } catch (error: any) {
      console.error('Error requesting location:', error);
      toast({
        title: "❌ Location Error",
        description: "Failed to request location permission. Please try 'Pin on Map' or 'Search Place' instead.",
        variant: "destructive",
        duration: 3000,
      });
    }
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
    if (onProjectUpdate) {
      onProjectUpdate();
    }
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

      // Clear URL parameters to prevent re-triggering
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('lat');
      newParams.delete('lng');
      newParams.delete('project');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, projects, setSearchParams]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-900 p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Mapbox Token Missing</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Please add your Mapbox token to: <code className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">src/config/mapbox.ts</code>
          </p>
          <pre className="bg-gray-200 dark:bg-gray-800 p-4 rounded text-left text-sm">
            export const MAPBOX_TOKEN = 'your_token_here';
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
        ref={mapRef}
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
              if (onProjectSelect) {
                onProjectSelect(project);
              }
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

