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

## Project info

**URL**: https://lovable.dev/projects/36ac1e49-41a4-412c-ba02-091a430fffb4

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/36ac1e49-41a4-412c-ba02-091a430fffb4) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/36ac1e49-41a4-412c-ba02-091a430fffb4) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
