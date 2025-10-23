import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SearchPlaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number, placeName: string) => void;
}

const SearchPlaceModal = ({ open, onOpenChange, onLocationSelect }: SearchPlaceModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Enter a location",
        description: "Please enter a place name to search",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    try {
      // Use Nominatim (OpenStreetMap) geocoding API - free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery + ", Philippines"
        )}&format=json&limit=1&countrycodes=ph`
      );

      const data = await response.json();

      if (data && data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        onLocationSelect(lat, lng, result.display_name);
        setSearchQuery("");
        onOpenChange(false);
      } else {
        toast({
          title: "Location not found",
          description: "Could not find this location in the Philippines. Try a different search term.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search Place in Philippines</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter city, province, or landmark..."
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={isSearching} size="icon">
              <Search className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Search for cities, provinces, landmarks, or addresses in the Philippines
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SearchPlaceModal;
