import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
  placeName?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const LocationConfirmModal = ({
  open,
  latitude,
  longitude,
  placeName,
  onConfirm,
  onCancel,
}: LocationConfirmModalProps) => {
  if (!open) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md">
      <Card className="shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Confirm Location</CardTitle>
          </div>
          <CardDescription className="text-sm">
            {placeName ? (
              <span className="font-medium">{placeName}</span>
            ) : (
              <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
            )}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground">
            Would you like to add a project at this location?
          </p>
        </CardContent>

        <CardFooter className="flex gap-2 pt-0">
          <Button variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            Confirm Location
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LocationConfirmModal;
