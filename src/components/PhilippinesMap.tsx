import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MapControlPanel from './MapControlPanel';
import ProjectFormModal from './ProjectFormModal';
import SearchPlaceModal from './SearchPlaceModal';
import LocationConfirmModal from './LocationConfirmModal';
import ProjectDetailsModal from './ProjectDetailsModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Branch-specific marker icons
const createBranchIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const branchIcons = {
  ADC: createBranchIcon('#006D5B'),
  QGDC: createBranchIcon('#b45309'),
  QMB: createBranchIcon('#ef4444'),
};

const PhilippinesMap = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);
  const tempMarker = useRef<L.Marker | null>(null);
  const geoWatchId = useRef<number | null>(null);
  const geoBestFix = useRef<{ lat: number; lng: number; accuracy: number } | null>(null);
  const geoTimeoutTimer = useRef<number | null>(null);
  const highlightMarker = useRef<L.Marker | null>(null);

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showLocationConfirm, setShowLocationConfirm] = useState(false);
  const [showProjectDetails, setShowProjectDetails] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const [isPinMode, setIsPinMode] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

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

    // Subscribe to real-time updates
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

  // Helpers for geolocation validation and UX
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

    if (map.current) {
      map.current.setView([latitude, longitude], 15);

      if (tempMarker.current) {
        tempMarker.current.remove();
      }
      tempMarker.current = L.marker([latitude, longitude], {
        icon: L.icon({
          iconUrl: iconRetina,
          shadowUrl: iconShadow,
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      }).addTo(map.current);
    }

    setSelectedLocation({ lat: latitude, lng: longitude });
    setShowProjectForm(true);
  };

  // Handle Enter Project - robust user location flow
  const handleEnterProject = async () => {
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

    // Permissions preflight
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

    // Start a watch to get improving accuracy
    geoWatchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Keep best in-bounds fix only
        if (isInPhilippinesBounds(latitude, longitude)) {
          if (!geoBestFix.current || accuracy < geoBestFix.current.accuracy) {
            geoBestFix.current = { lat: latitude, lng: longitude, accuracy };
          }
        }

        // Accept immediately if sufficiently precise
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

    // Fallback timeout: accept best in-bounds fix after 10s if no precise fix
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
    if (map.current) {
      map.current.setView([lat, lng], 13);
      
      // Add temporary marker
      if (tempMarker.current) {
        tempMarker.current.remove();
      }
      tempMarker.current = L.marker([lat, lng]).addTo(map.current);
    }

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
    if (tempMarker.current) {
      tempMarker.current.remove();
      tempMarker.current = null;
    }
    setSelectedLocation(null);
  };

  // Handle project form success
  const handleProjectSuccess = () => {
    if (tempMarker.current) {
      tempMarker.current.remove();
      tempMarker.current = null;
    }
    setSelectedLocation(null);
    loadProjects();
  };

  // Display projects on map
  useEffect(() => {
    if (!map.current || !markersLayer.current) return;

    // Clear existing markers
    markersLayer.current.clearLayers();

    // Add project markers
    projects.forEach((project) => {
      const marker = L.marker([project.latitude, project.longitude], {
        icon: branchIcons[project.branch as keyof typeof branchIcons],
      });

      marker.on('click', () => {
        setSelectedProject(project);
        setShowProjectDetails(true);
      });

      marker.addTo(markersLayer.current!);
    });
  }, [projects]);

  // Handle pin mode click behavior
  useEffect(() => {
    if (!map.current) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (!isPinMode) return;

      const { lat, lng } = e.latlng;

      // Add temporary marker
      if (tempMarker.current) {
        tempMarker.current.remove();
      }
      tempMarker.current = L.marker([lat, lng]).addTo(map.current!);

      setSelectedLocation({ lat, lng });
      setShowLocationConfirm(true);
      setIsPinMode(false);
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick);
      }
    };
  }, [isPinMode]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Philippines
    // Disable default zoomControl to avoid duplicate zoom buttons; we'll add one explicitly at top-left
    map.current = L.map(mapContainer.current, { zoomControl: false }).setView([12.8797, 121.7740], 6);
    markersLayer.current = L.layerGroup().addTo(map.current);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Add zoom control
    L.control.zoom({ position: 'topleft' }).addTo(map.current);

    // Restrict map bounds to Philippines region
    const southWest = L.latLng(4.5, 116.5);
    const northEast = L.latLng(21.5, 126.5);
    map.current.setMaxBounds(L.latLngBounds(southWest, northEast));
    map.current.setMinZoom(5);

    // Note: Projects are loaded via real-time subscription useEffect

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Cleanup any active geolocation watchers on unmount
  useEffect(() => {
    return () => {
      stopGeoWatch();
    };
  }, []);

  // Handle navigation from URL parameters (from admin view modal)
  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const projectId = searchParams.get('project');

    if (lat && lng && map.current) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      // Navigate to location
      map.current.setView([latitude, longitude], 16);

      // Add highlight marker
      if (highlightMarker.current) {
        highlightMarker.current.remove();
      }

      // Create pulsing highlight marker
      const pulsingIcon = L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <div style="
              position: absolute;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: rgba(59, 130, 246, 0.4);
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              top: 10px;
              left: 10px;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background-color: #3b82f6;
              border: 3px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% {
                transform: scale(0.8);
                opacity: 1;
              }
              50% {
                transform: scale(1.2);
                opacity: 0.5;
              }
              100% {
                transform: scale(0.8);
                opacity: 1;
              }
            }
          </style>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      highlightMarker.current = L.marker([latitude, longitude], {
        icon: pulsingIcon,
        zIndexOffset: 1000,
      }).addTo(map.current);

      // Show project details if projectId is provided
      if (projectId && projects.length > 0) {
        const project = projects.find((p) => p.id === projectId);
        if (project) {
          setTimeout(() => {
            setSelectedProject(project);
            setShowProjectDetails(true);
          }, 500);
        }
      }

      // Clear URL parameters after navigation
      setTimeout(() => {
        setSearchParams({});
        if (highlightMarker.current) {
          highlightMarker.current.remove();
          highlightMarker.current = null;
        }
      }, 10000); // Remove highlight after 10 seconds

      toast({
        title: "📍 Project Location",
        description: "Map centered on selected project location",
        duration: 2000,
      });
    }
  }, [searchParams, projects, map.current]);

  return (
    <div className={`relative w-full h-full rounded-lg overflow-hidden shadow-xl ${isPinMode ? 'map-pin-mode' : ''}`}>
      <div 
        ref={mapContainer} 
        className="w-full h-full" 
      />
      
      <MapControlPanel
        onEnterProject={handleEnterProject}
        onPinOnMap={handlePinOnMap}
        onSearchPlace={handleSearchPlace}
      />

      {selectedLocation && (
        <ProjectFormModal
          open={showProjectForm}
          onOpenChange={setShowProjectForm}
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
          onSuccess={handleProjectSuccess}
        />
      )}

      <SearchPlaceModal
        open={showSearchModal}
        onOpenChange={setShowSearchModal}
        onLocationSelect={handleLocationSelect}
      />

      {selectedLocation && (
        <LocationConfirmModal
          open={showLocationConfirm}
          onOpenChange={setShowLocationConfirm}
          latitude={selectedLocation.lat}
          longitude={selectedLocation.lng}
          placeName={selectedLocation.name}
          onConfirm={handleConfirmLocation}
          onCancel={handleCancelLocation}
        />
      )}

      <ProjectDetailsModal
        open={showProjectDetails}
        onOpenChange={setShowProjectDetails}
        project={selectedProject}
      />
    </div>
  );
};

export default PhilippinesMap;
