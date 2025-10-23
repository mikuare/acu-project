# Google Maps Migration Guide

## ✅ Migration Complete!

The project has been successfully migrated from Leaflet to Google Maps API.

## What Changed

### Files Modified:
- ✅ `package.json` - Added `@react-google-maps/api`, removed Leaflet dependencies
- ✅ `src/components/PhilippinesMapGoogle.tsx` - New Google Maps implementation
- ✅ `src/pages/Index.tsx` - Updated to use Google Maps component
- ✅ `src/index.css` - Updated CSS selectors from Leaflet to Google Maps

### Features Maintained:
- ✅ Real-time project updates via Supabase
- ✅ Branch-specific colored markers (ADC, QGDC, QMB)
- ✅ Pin on Map mode
- ✅ Search Place functionality
- ✅ Geolocation support
- ✅ Project details modal
- ✅ All control panel features
- ✅ Mobile-responsive design
- ✅ URL parameter navigation
- ✅ Philippines bounds restriction

## Setup Instructions

### 1. Install Dependencies

Run one of the following commands:

```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

This will install:
- `@react-google-maps/api@^2.19.3` - Google Maps React library
- `@types/google.maps@^3.55.0` - TypeScript definitions

### 2. Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API** (for search functionality)
   - **Geocoding API** (optional, for address lookups)
4. Go to **Credentials** and create an API key
5. (Recommended) Restrict your API key:
   - Set application restrictions (HTTP referrers for web apps)
   - Set API restrictions (only enable the APIs you need)

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
# .env
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

**Important:** 
- Replace `your_actual_api_key_here` with your real Google Maps API key
- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file

### 4. Run the Application

```bash
npm run dev
```

The application will start, and the Google Maps component will load with your API key.

## Troubleshooting

### "Google Maps API Key Missing" Error

If you see this error, ensure:
1. Your `.env` file is in the project root
2. The variable is named exactly `VITE_GOOGLE_MAPS_API_KEY`
3. You've restarted the development server after creating `.env`
4. Your API key is valid and has the necessary APIs enabled

### Map Not Loading

1. Check browser console for API errors
2. Verify your API key in Google Cloud Console
3. Ensure **Maps JavaScript API** is enabled
4. Check if there are any billing issues with your Google Cloud account

### Markers Not Showing

1. Verify projects exist in your Supabase database
2. Check that projects have valid `latitude` and `longitude` values
3. Open browser console to check for JavaScript errors

### Search Not Working

1. Ensure **Places API** is enabled in Google Cloud Console
2. Verify your API key has permissions for Places API
3. Check browser console for API quota errors

## API Usage and Billing

Google Maps Platform offers a **$200 monthly credit** that covers most small to medium applications. 

### Cost Estimates:
- **Maps JavaScript API**: $7 per 1,000 loads
- **Places API**: $17 per 1,000 requests
- **Geocoding API**: $5 per 1,000 requests

With the $200 credit, you can have approximately:
- ~28,000 map loads per month
- OR ~11,000 place searches per month
- OR ~40,000 geocoding requests per month

### Cost Management Tips:
1. Restrict your API key to your domain
2. Set up billing alerts in Google Cloud Console
3. Enable only the APIs you need
4. Consider caching geocoding results

## Legacy Leaflet Component

The original Leaflet implementation has been preserved as:
- `src/components/PhilippinesMap.tsx` (old file)

To revert to Leaflet:
1. Change import in `src/pages/Index.tsx`:
   ```typescript
   import PhilippinesMap from "@/components/PhilippinesMap";
   ```
2. Reinstall Leaflet dependencies:
   ```bash
   npm install leaflet @types/leaflet leaflet.locatecontrol
   ```

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api Documentation](https://react-google-maps-api-docs.netlify.app/)
- [Google Maps Platform Pricing](https://mapsplatform.google.com/pricing/)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

## Support

If you encounter any issues with the Google Maps integration, please check:
1. Google Cloud Console for API status
2. Browser developer console for errors
3. Network tab for failed API requests
4. This project's README.md for general setup instructions

---

**Migration Date:** October 23, 2025
**Google Maps API Version:** 3.x
**React Google Maps Library:** @react-google-maps/api v2.19.3

