import { useAppSettings } from '@/contexts/AppSettingsContext';
import { MAPBOX_TOKEN as DEFAULT_TOKEN } from '@/config/mapbox';

export const useMapboxToken = () => {
    const { mapboxToken, isLoading } = useAppSettings();

    return {
        token: mapboxToken || DEFAULT_TOKEN,
        isLoading
    };
};
