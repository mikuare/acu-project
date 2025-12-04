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

<<<<<<< HEAD
=======
## Getting Started

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- Git for version control

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd acu-project

# Step 3: Install dependencies
npm install

# Step 4: Set up environment variables
# Copy .env.example to .env and fill in your credentials
cp .env.example .env
# Edit .env with your Mapbox and Supabase keys

# Step 5: Start the development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Technologies Used

This project is built with:

- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **Mapbox GL JS** - Interactive maps
- **shadcn-ui** - Component library
- **Tailwind CSS** - Utility-first CSS framework
- **Supabase** - Backend and database

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Editing the Code

You can edit this code using:

- **Your preferred IDE** (VS Code, WebStorm, etc.)
- **GitHub Codespaces** for cloud-based development
- **Direct GitHub editing** for quick changes

## Deployment

This project can be deployed to any static hosting service that supports Vite applications:

- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting
- Or any other hosting provider

Make sure to set your environment variables in your hosting provider's settings.

## License

This project is proprietary software developed for QMAZ Holdings Inc.

>>>>>>> 5305ca3 (Update README: Remove Lovable references and add proper setup instructions)
