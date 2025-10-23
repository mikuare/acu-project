# 🗺️ Quick Setup: Google Maps Integration

## Step 1: Install Dependencies

```bash
npm install
```

This installs `@react-google-maps/api` and other required packages.

## Step 2: Create .env File

Create a file named `.env` in your project root directory:

```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace the `AIzaSy...` with your actual Google Maps API key.

## Step 3: Get Your API Key

1. Visit: https://console.cloud.google.com/google/maps-apis
2. Create or select a project
3. Enable these APIs:
   - ✅ Maps JavaScript API
   - ✅ Places API
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key

## Step 4: Run the Application

```bash
npm run dev
```

Your app will now use Google Maps instead of Leaflet!

## ⚠️ Important Security Notes

- ✅ Add `.env` to your `.gitignore` file
- ✅ Never commit your API key to Git
- ✅ Restrict your API key in Google Cloud Console:
  - Set HTTP referrer restrictions
  - Limit to specific APIs

## 💰 Billing Information

Google Maps offers **$200 free credit monthly**, which covers:
- ~28,000 map loads per month
- ~11,000 place searches per month

Perfect for small to medium projects!

## 🔧 Troubleshooting

**Map shows "API Key Missing" error?**
- Ensure your `.env` file is in the project root
- Restart your dev server after creating `.env`
- Variable name must be exactly: `VITE_GOOGLE_MAPS_API_KEY`

**Map not loading?**
- Check browser console for errors
- Verify API key is valid
- Ensure Maps JavaScript API is enabled
- Check Google Cloud billing is active

## 📚 Need More Help?

See full documentation in: `GOOGLE_MAPS_MIGRATION.md`

