export const PROJECT_CATEGORIES = [
    "Bridges",
    "Buildings and Facilities",
    "Flood Control and Drainage",
    "Roads",
    "Septage and Sewerage Plants",
    "Water Provision and Storage"
] as const;

export type ProjectCategory = typeof PROJECT_CATEGORIES[number];

export const ISLAND_GROUPS = ["Luzon", "Visayas", "Mindanao"] as const;
export type IslandGroup = typeof ISLAND_GROUPS[number];

export const REGIONS = [
    "Region I – Ilocos Region",
    "Region II – Cagayan Valley",
    "Region III – Central Luzon",
    "Region IV‑A – CALABARZON",
    "MIMAROPA Region",
    "Region V – Bicol Region",
    "Region VI – Western Visayas",
    "Region VII – Central Visayas",
    "Region VIII – Eastern Visayas",
    "Region IX – Zamboanga Peninsula",
    "Region X – Northern Mindanao",
    "Region XI – Davao Region",
    "Region XII – SOCCSKSARGEN",
    "Region XIII – Caraga",
    "NCR – National Capital Region",
    "CAR – Cordillera Administrative Region",
    "BARMM – Bangsamoro Autonomous Region in Muslim Mindanao",
    "NIR – Negros Island Region"
] as const;

export type Region = typeof REGIONS[number];

export const PROVINCES_BY_REGION: Record<Region, string[]> = {
    "Region I – Ilocos Region": [
        "Ilocos Norte", "Ilocos Sur", "La Union", "Pangasinan"
    ],
    "Region II – Cagayan Valley": [
        "Batanes", "Cagayan", "Isabela", "Nueva Vizcaya", "Quirino"
    ],
    "Region III – Central Luzon": [
        "Aurora", "Bataan", "Bulacan", "Nueva Ecija", "Pampanga", "Tarlac", "Zambales"
    ],
    "Region IV‑A – CALABARZON": [
        "Batangas", "Cavite", "Laguna", "Quezon", "Rizal"
    ],
    "MIMAROPA Region": [
        "Marinduque", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Romblon"
    ],
    "Region V – Bicol Region": [
        "Albay", "Camarines Norte", "Camarines Sur", "Catanduanes", "Masbate", "Sorsogon"
    ],
    "Region VI – Western Visayas": [
        "Aklan", "Antique", "Capiz", "Guimaras", "Iloilo"
    ],
    "Region VII – Central Visayas": [
        "Bohol", "Cebu"
    ],
    "Region VIII – Eastern Visayas": [
        "Biliran", "Eastern Samar", "Leyte", "Northern Samar", "Samar", "Southern Leyte"
    ],
    "Region IX – Zamboanga Peninsula": [
        "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"
    ],
    "Region X – Northern Mindanao": [
        "Bukidnon", "Camiguin", "Lanao del Norte", "Misamis Occidental", "Misamis Oriental"
    ],
    "Region XI – Davao Region": [
        "Davao de Oro (Compostela Valley)", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental"
    ],
    "Region XII – SOCCSKSARGEN": [
        "Cotabato", "Sarangani", "South Cotabato", "Sultan Kudarat"
    ],
    "Region XIII – Caraga": [
        "Agusan del Norte", "Agusan del Sur", "Dinagat Islands", "Surigao del Norte", "Surigao del Sur"
    ],
    "NCR – National Capital Region": [], // No provinces in user list for NCR
    "CAR – Cordillera Administrative Region": [
        "Abra", "Apayao", "Benguet", "Ifugao", "Kalinga", "Mountain Province"
    ],
    "BARMM – Bangsamoro Autonomous Region in Muslim Mindanao": [
        "Basilan", "Lanao del Sur", "Maguindanao del Norte (partitioned recently from Maguindanao)", "Maguindanao del Sur (partitioned recently from Maguindanao)", "Sulu", "Tawi-Tawi"
    ],
    "NIR – Negros Island Region": [
        "Negros Occidental", "Negros Oriental", "Siquijor"
    ]
};

export const REGION_TO_ISLAND_GROUP: Record<Region, IslandGroup> = {
    "Region I – Ilocos Region": "Luzon",
    "Region II – Cagayan Valley": "Luzon",
    "Region III – Central Luzon": "Luzon",
    "Region IV‑A – CALABARZON": "Luzon",
    "MIMAROPA Region": "Luzon",
    "Region V – Bicol Region": "Luzon",
    "Region VI – Western Visayas": "Visayas",
    "Region VII – Central Visayas": "Visayas",
    "Region VIII – Eastern Visayas": "Visayas",
    "Region IX – Zamboanga Peninsula": "Mindanao",
    "Region X – Northern Mindanao": "Mindanao",
    "Region XI – Davao Region": "Mindanao",
    "Region XII – SOCCSKSARGEN": "Mindanao",
    "Region XIII – Caraga": "Mindanao",
    "NCR – National Capital Region": "Luzon",
    "CAR – Cordillera Administrative Region": "Luzon",
    "BARMM – Bangsamoro Autonomous Region in Muslim Mindanao": "Mindanao",
    "NIR – Negros Island Region": "Visayas"
};

export const getRegionForProvince = (province: string): Region | null => {
    for (const [region, provinces] of Object.entries(PROVINCES_BY_REGION)) {
        if (provinces.includes(province)) {
            return region as Region;
        }
    }
    return null;
};

export const getIslandGroupForRegion = (region: string): IslandGroup | null => {
    if (region in REGION_TO_ISLAND_GROUP) {
        return REGION_TO_ISLAND_GROUP[region as Region];
    }
    return null;
};
