"use client";
import React, { useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const palette = {
  // Professional yellow-based palette
  cream: "#FFFBEB",
  lightYellow: "#FEF3C7",
  golden: "#F59E0B",
  amber: "#D97706",
  darkYellow: "#B45309",
  sage: "#F0FDF4",
  mint: "#F0FDFA",
  slate: "#F8FAFC",
  stone: "#F5F5F4",
  neutral: "#FAFAF9",
  muted: "#F3F4F6",
  accent: "#EAB308",
  accentLight: "#FDE047",
  text: "#1F2937",
  textMuted: "#6B7280",
  textLight: "#9CA3AF",
} as const;

export type Restaurant = {
  name: string;
  address: string;
  description: string;
  rating?: string;
};

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

const quickPrefs = [
  "Vegan",
  "Vegetarian",
  "Gluten-free",
  "Halal",
  "Kosher",
  "Keto",
  "Paleo",
  "Dairy-free",
  "Nut-free",
  "Low-carb",
  "Organic",
];

export default function PlatePalPage() {
  const [dietPrefs, setDietPrefs] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  
  // New customization states
  const [calorieRange, setCalorieRange] = useState({ min: "", max: "" });
  const [macroPreferences, setMacroPreferences] = useState({
    carbs: "", // "minimize", "balanced", "maximize", ""
    protein: "",
    fat: ""
  });
  const [foodGroupPriorities, setFoodGroupPriorities] = useState({
    vegetables: "", // "avoid", "neutral", "prioritize", ""
    fruits: "",
    grains: "",
    dairy: "",
    meat: "",
    seafood: ""
  });

  // Header animations based on scroll
  const ref = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const headerH = useTransform(scrollYProgress, [0, 1], [180, 100]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const titleY = useTransform(scrollYProgress, [0, 1], [0, -6]);

  const tokens = useMemo(
    () =>
      dietPrefs
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [dietPrefs]
  );

  const isPrefActive = (label: string) =>
    tokens.map((t) => t.toLowerCase()).includes(label.toLowerCase());

  // Helper functions for customization
  const hasAnyCustomization = () => {
    return (
      calorieRange.min !== "" ||
      calorieRange.max !== "" ||
      Object.values(macroPreferences).some(pref => pref !== "") ||
      Object.values(foodGroupPriorities).some(priority => priority !== "")
    );
  };

  const updateMacroPreference = (macro: keyof typeof macroPreferences, value: string) => {
    setMacroPreferences(prev => ({ ...prev, [macro]: value }));
  };

  const updateFoodGroupPriority = (foodGroup: keyof typeof foodGroupPriorities, value: string) => {
    setFoodGroupPriorities(prev => ({ ...prev, [foodGroup]: value }));
  };

  // Sorting logic
  const sortRestaurants = (restaurants: Restaurant[]) => {
    const sorted = [...restaurants];
    
    switch (sortBy) {
      case "distance":
        // Sort alphabetically by name as a proxy for distance (since we don't have actual distance data)
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case "rating":
        return sorted.sort((a, b) => {
          const ratingA = parseFloat(a.rating?.split('/')[0] || '0');
          const ratingB = parseFloat(b.rating?.split('/')[0] || '0');
          return ratingB - ratingA; // Highest first
        });
      
      case "diet_match":
        // Sort by description length (longer descriptions usually mean better matches)
        return sorted.sort((a, b) => b.description.length - a.description.length);
      
      case "price_low_high":
        // Sort alphabetically by name as a proxy for price (since we don't have actual price data)
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      
      case "price_high_low":
        // Sort alphabetically by name as a proxy for price (since we don't have actual price data)
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      
      case "relevance":
      default:
        return sorted; // Keep original order
    }
  };

  const sortedRestaurants = useMemo(() => sortRestaurants(restaurants), [restaurants, sortBy]);

  const onTogglePref = (label: string) => {
    const lower = label.toLowerCase();
    if (isPrefActive(label)) {
      setDietPrefs(tokens.filter((t) => t.toLowerCase() !== lower).join(", "));
    } else {
      setDietPrefs([...tokens, lower].join(", ").replace(/^,\s*/, ""));
    }
  };


  const openInMaps = (r: Restaurant) => {
    const query = encodeURIComponent(`${r.name} ${r.address ?? ""}`.trim());
    const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const getLocation = async () => {
    setLocLoading(true);
    try {
      if (!("geolocation" in navigator)) {
        console.error("Your browser doesn't support geolocation.");
        return;
      }
      await new Promise<void>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            setLocation({ latitude, longitude });

            // Reverse geocode to get zipcode
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
              const data = await response.json();
              if (data.postcode) {
                setZipcode(data.postcode);
              }
            } catch (e) {
              console.error("Failed to get zipcode:", e);
            }

            resolve();
          },
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 15000 }
        );
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLocLoading(false);
    }
  };

  const findRestaurants = async () => {
    if (!hasAnyCustomization()) {
      console.error("Please enter at least one customization");
      return;
    }
    if (!location && !zipcode.trim()) {
      console.error("Please get your location or enter a zipcode");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const locationStr = location
        ? `latitude ${location.latitude}, longitude ${location.longitude}`
        : `zipcode ${zipcode}`;

      // Build comprehensive customization details
      let customizationDetails = [];
      
      if (dietPrefs.trim()) {
        customizationDetails.push(`Dietary preferences: ${dietPrefs}`);
      }
      
      if (calorieRange.min || calorieRange.max) {
        const calorieStr = calorieRange.min && calorieRange.max 
          ? `${calorieRange.min}-${calorieRange.max} calories`
          : calorieRange.min 
          ? `at least ${calorieRange.min} calories`
          : `maximum ${calorieRange.max} calories`;
        customizationDetails.push(`Calorie range: ${calorieStr}`);
      }

      const macroDetails = Object.entries(macroPreferences)
        .filter(([_, value]) => value !== "")
        .map(([macro, value]) => `${value} ${macro}`)
        .join(", ");
      if (macroDetails) {
        customizationDetails.push(`Macro preferences: ${macroDetails}`);
      }

      const foodGroupDetails = Object.entries(foodGroupPriorities)
        .filter(([_, value]) => value !== "")
        .map(([group, value]) => `${value} ${group}`)
        .join(", ");
      if (foodGroupDetails) {
        customizationDetails.push(`Food group priorities: ${foodGroupDetails}`);
      }

      const prompt = `Find me restaurants near ${locationStr}${customizationDetails.length > 0 ? ` that match these customizations:\n${customizationDetails.join('\n')}` : ''}.\n\nFor each restaurant, suggest specific menu items and mention what to avoid or prioritize within their menu. Consider calorie counts, macro ratios, and food group preferences when making recommendations.\n\nPlease return ONLY a JSON array of restaurants in this exact format:\n[\n  {\n    "name": "Restaurant Name",\n    "address": "Street address",\n    "description": "Detailed description of the restaurant and menu recommendations",\n    "rating": "4.5/5 or similar"\n  }\n]\n\nLimit to 8 restaurants maximum. Make sure the JSON is valid and contains no other text.`;

      const res = await fetch("/api/platepal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const data = await res.json();
      const text: string = data.text || "";
      const match = text.match(/\[[\s\S]*\]/);
      if (!match)
        throw new Error("Could not parse restaurant data from response");
      const parsed = JSON.parse(match[0]);
      setRestaurants(parsed);
    } catch (e: any) {
      console.error(e);
      if (e.message?.includes("500")) {
        setError("Server error: Please check if the Gemini API key is configured. Contact support if the issue persists.");
      } else if (e.message?.includes("API key not configured")) {
        setError("API key not configured. Please add your Gemini API key to the .env.local file.");
      } else {
        setError(`Error: ${e.message || "Something went wrong. Please try again."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    if (!location || !dietPrefs.trim()) return;
    setRefreshing(true);
    try {
      await findRestaurants();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div
      ref={ref}
      className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 pt-2 pb-2"
    >
      {/* Container for responsive centering */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-8">
        {/* Hero */}
        <motion.div
          className="relative overflow-hidden rounded-2xl mb-8 flex items-end shadow-lg"
          style={{ height: headerH }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-200 via-yellow-100 to-orange-100" />
          <div className="relative px-6 pb-6 w-full">
            <motion.h1
              className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-center text-slate-800 flex items-center justify-center"
              style={{ scale: titleScale, y: titleY }}
            >
              <img
                src="/platepal-logo.svg"
                alt="PlatePal Logo"
                className="w-10 h-10 mr-3"
              />
              PlatePal
            </motion.h1>
            <p className="text-center text-base sm:text-lg mt-3 text-slate-600 font-medium">
              Discover restaurants that match your dietary preferences
            </p>
            <div className="flex justify-center mt-4">
              <div className="inline-flex items-center bg-white/70 backdrop-blur-sm border border-white/50 rounded-full px-4 py-2 shadow-md hover:bg-white/90 hover:shadow-lg transition-all duration-300 group">
                <svg
                  className="w-4 h-4 mr-2 text-amber-600 group-hover:text-amber-500 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] transition-all duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-800 group-hover:drop-shadow-[0_0_6px_rgba(71,85,105,0.4)] transition-all duration-300">
                  Powered by AI
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Unified Search Box */}
        <div className="mb-8">
          <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800">
                Find Your Perfect Meal
              </h2>
            </div>

            {/* Dietary Preferences */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Dietary Preferences
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 pr-12 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="Type or select your preferences..."
                  value={dietPrefs}
                  onChange={(e) => setDietPrefs(e.target.value)}
                />
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

              </div>


              {/* Quick selection buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {quickPrefs.map((label) => (
                  <button
                    key={label}
                    onClick={() => onTogglePref(label)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      isPrefActive(label)
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Location
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="Enter zipcode (e.g., 10001)"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                />
                <button
                  onClick={getLocation}
                  disabled={locLoading}
                  className={`w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all hover:scale-105 disabled:opacity-60 ${
                    location
                      ? "bg-amber-500 border-amber-600 text-white"
                      : "bg-slate-100 border-slate-200 text-slate-600"
                  }`}
                >
                  {locLoading ? (
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Calorie Range */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Calorie Range
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="Min calories"
                  value={calorieRange.min}
                  onChange={(e) => setCalorieRange(prev => ({ ...prev, min: e.target.value }))}
                />
                <span className="flex items-center text-slate-500 font-medium">to</span>
                <input
                  type="number"
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-4 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="Max calories"
                  value={calorieRange.max}
                  onChange={(e) => setCalorieRange(prev => ({ ...prev, max: e.target.value }))}
                />
              </div>
            </div>

            {/* Macro Preferences */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Macro Preferences
              </label>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(macroPreferences).map(([macro, value]) => (
                  <div key={macro} className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 capitalize">{macro}</label>
                    <select
                      value={value}
                      onChange={(e) => updateMacroPreference(macro as keyof typeof macroPreferences, e.target.value)}
                      className={`w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${value === "" ? "text-slate-400" : "text-slate-900"}`}
                    >
                      <option value="">No selection</option>
                      <option value="minimize">Minimize</option>
                      <option value="balanced">Balanced</option>
                      <option value="maximize">Maximize</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Food Group Priorities */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Food Group Priorities
              </label>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(foodGroupPriorities).map(([group, priority]) => (
                  <div key={group} className="space-y-2">
                    <label className="text-xs font-medium text-slate-600 capitalize">{group}</label>
                    <select
                      value={priority}
                      onChange={(e) => updateFoodGroupPriority(group as keyof typeof foodGroupPriorities, e.target.value)}
                      className={`w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent ${priority === "" ? "text-slate-400" : "text-slate-900"}`}
                    >
                      <option value="">No selection</option>
                      <option value="avoid">Avoid</option>
                      <option value="neutral">Neutral</option>
                      <option value="prioritize">Prioritize</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Button */}
            <div className="flex justify-center">
              <button
                onClick={findRestaurants}
                disabled={
                  loading || (!location && !zipcode.trim()) || !hasAnyCustomization()
                }
                className="w-20 h-20 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-center transition-all hover:scale-105 disabled:opacity-60 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center shadow-lg">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
              <button
                onClick={() => setError("")}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {restaurants.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold text-slate-800">
                Recommended Restaurants
              </h2>
            </div>
            
            {/* Sort Dropdown */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-slate-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="relevance">Most Relevant</option>
                  <option value="rating">Highest Rated</option>
                  <option value="diet_match">Best Diet Match</option>
                  <option value="distance">Closest Distance</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                </select>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
              {sortedRestaurants.map((r, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-lg hover:shadow-xl transition-all"
                >
                  {r.rating && (
                    <div className="absolute top-6 right-6 bg-amber-500 text-white rounded-full px-3 py-1 text-sm font-semibold flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {r.rating}
                    </div>
                  )}
                  <div className="pr-24">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">
                      {r.name}
                    </h3>
                    <div className="text-sm text-slate-600 mb-3 flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {r.address}
                    </div>
                    <div className="text-sm text-slate-700 leading-relaxed space-y-2">
                      {r.description.split('. ').map((sentence, idx) => (
                        <p key={idx} className="mb-2 last:mb-0">
                          {sentence.trim()}
                          {!sentence.endsWith('.') && idx < r.description.split('. ').length - 1 && '.'}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => openInMaps(r)}
                      className="px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold text-sm transition-all hover:scale-105 hover:bg-amber-600 shadow-md flex items-center"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Open in Maps
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && restaurants.length === 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-amber-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <h2 className="text-xl font-display font-bold text-slate-800 mb-2">
                Ready to discover amazing restaurants?
              </h2>
              <p className="text-slate-600">
                Enter your dietary preferences and location above to get
                started!
              </p>
            </div>
          </div>
        )}

        {(loading || refreshing) && (
          <div className="fixed inset-0 bg-black/20 grid place-items-center pointer-events-none z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 shadow-xl"
            >
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
                <div className="font-display font-semibold text-lg text-slate-800">
                  Finding great places for you…
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
