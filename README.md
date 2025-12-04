# Project Management System

An interactive Philippines map application for managing and visualizing project locations with branch-specific color coding.

## Features

### 🗺️ Interactive Map
- Full Philippines map with zoom and pan controls
- Real-time project markers with branch color coding
- Click markers to view detailed project information

### 📍 Three Ways to Add Projects

1. **Enter Project (Current Location)**
   - Automatically detects your current location using GPS
   - High-accuracy geolocation with proper error handling
   - Instantly centers map on your position

2. **Pin on Map**
   - Click anywhere on the map to place a project
   - Confirm location before adding details
   - Visual feedback during pin mode

3. **Search Place**
   - Search for any location in the Philippines
   - Powered by OpenStreetMap Nominatim
   - Filters results to Philippines only

### 📝 Project Information

Each project includes:
- **Project ID** (required)
- **Description** (required)
- **Status** (Active by default)
- **Project Date** (defaults to current date, customizable)
- **Engineer Name** (required)
- **User Name** (required)
- **Contact Information** (optional)
  - Phone Number
  - Email
  - Social Media (Facebook, etc.)
- **Branch Selection** (required)
  - ADC (Green)
  - QGDC (Brown)
  - QMB (Red)
- **Project Image** (optional - supports all image formats)
- **Additional Details** (optional)

### 🎨 Branch Color Coding
- **ADC**: Green markers
- **QGDC**: Brown markers
- **QMB**: Red markers

### 📊 Project Details View
- Beautiful modal with all project information
- Display project images
- Team and contact information
- Timeline with project and submission dates
- Direct navigation links to Google Maps and Waze
- Geographic coordinates display

### 🔒 Database & Storage
- Projects stored in Supabase
- Public image storage for project photos
- Real-time data updates
- Row-level security enabled

