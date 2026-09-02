// frontend/src/pages/NearbyPage.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Building2,
  Heart,
  GraduationCap,
  Navigation,
  Search,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Globe,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  LocateFixed,
  ShieldCheck,
  School,
  Wrench,
  BookOpen,
  Accessibility,
  Compass,
  X,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  EducationInstitute,
  POPULAR_CITIES,
} from "@/features/education/services/nearbyInstitutesData";
import {
  getNearbyInstitutes,
  getGoogleMapsDirectionsUrl,
  reverseGeocode,
  InstituteWithDistance,
  UserCoordinates,
} from "@/features/education/services/nearbyInstitutesService";

// Default coordinates if geolocation is not granted (New Delhi Center)
const DEFAULT_COORDS: UserCoordinates = {
  latitude: 28.6139,
  longitude: 77.2090,
  locality: "Delhi NCR (Default)",
  source: "default",
};

const CATEGORIES = [
  { id: "all", label: "All Institutes", icon: Compass },
  { id: "college", label: "Colleges & Universities", icon: GraduationCap },
  { id: "special", label: "Special Education & Inclusive", icon: Accessibility },
  { id: "vocational", label: "Vocational & Skill Centers", icon: Wrench },
  { id: "school", label: "Schools & Learning", icon: School },
  { id: "support", label: "Government & Support", icon: Building2 },
];

const RADIUS_OPTIONS = [
  { label: "Within 15 km", value: "15" },
  { label: "Within 30 km", value: "30" },
  { label: "Within 50 km", value: "50" },
  { label: "Within 100 km", value: "100" },
  { label: "All Distances", value: "0" },
];

const NearbyPage = () => {
  // User Location States
  const [userCoords, setUserCoords] = useState<UserCoordinates>(DEFAULT_COORDS);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied" | "error"
  >("requesting");
  const [locationName, setLocationName] = useState<string>("Detecting your location...");
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedRadius, setSelectedRadius] = useState<string>("50"); // Default 50 km for local relevance
  const [selectedCity, setSelectedCity] = useState<string>("gps");

  // Institutes List State
  const [institutes, setInstitutes] = useState<InstituteWithDistance[]>([]);
  const [isLoadingInstitutes, setIsLoadingInstitutes] = useState<boolean>(true);

  // Modal Details State
  const [selectedInstitute, setSelectedInstitute] = useState<InstituteWithDistance | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);

  // Debounce search input by 300ms for smooth live search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  /**
   * Request GPS Geolocation from User
   */
  const requestLocation = useCallback(async () => {
    setIsLocating(true);
    setLocationStatus("requesting");

    if (!navigator.geolocation) {
      setLocationStatus("error");
      setLocationName("Geolocation not supported by browser");
      toast.error("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coords: UserCoordinates = {
          latitude,
          longitude,
          accuracy,
          source: "gps",
        };
        setUserCoords(coords);
        setLocationStatus("granted");
        setSelectedCity("gps");

        // Reverse geocode to get city / locality name
        try {
          const locality = await reverseGeocode(latitude, longitude);
          coords.locality = locality;
          setLocationName(locality);
          toast.success(`📍 Location detected: ${locality}`, {
            description: `Showing educational institutes near your GPS position.`,
          });
        } catch {
          const fallbackName = `${latitude.toFixed(3)}° N, ${longitude.toFixed(3)}° E`;
          setLocationName(fallbackName);
        }

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
          setLocationName("Location permission denied (Showing All Regions)");
          toast.warning("Location access was blocked.", {
            description:
              "Please allow location in your browser address bar to show exact institutes near you, or select a city below.",
          });
        } else {
          setLocationStatus("error");
          setLocationName("Unable to retrieve GPS position");
          toast.error("GPS position unavailable. Retrying with fallback coordinates.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, []);

  // Request location on component mount
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Load and calculate nearby institutes whenever coordinates, search, category, or radius changes
  useEffect(() => {
    let isCancelled = false;

    const loadInstitutes = async () => {
      setIsLoadingInstitutes(true);
      try {
        const radiusKm = parseInt(selectedRadius, 10);
        const data = await getNearbyInstitutes(
          {
            latitude: userCoords.latitude,
            longitude: userCoords.longitude,
          },
          {
            category: selectedCategory,
            searchQuery: debouncedSearch,
            radiusKm: radiusKm > 0 ? radiusKm : undefined,
            includeLiveNearby: true, // Always discover live local colleges & schools
          }
        );

        if (!isCancelled) {
          setInstitutes(data);
        }
      } catch (err) {
        console.error("Error loading institutes:", err);
      } finally {
        if (!isCancelled) {
          setIsLoadingInstitutes(false);
        }
      }
    };

    loadInstitutes();

    return () => {
      isCancelled = true;
    };
  }, [userCoords, selectedCategory, debouncedSearch, selectedRadius]);

  /**
   * Handle City Switcher selection
   */
  const handleCityChange = (cityName: string) => {
    if (cityName === "gps") {
      requestLocation();
      return;
    }

    const cityObj = POPULAR_CITIES.find((c) => c.name === cityName);
    if (cityObj) {
      setSelectedCity(cityName);
      setUserCoords({
        latitude: cityObj.lat,
        longitude: cityObj.lng,
        locality: cityObj.name,
        source: "manual",
      });
      setLocationStatus("granted");
      setLocationName(cityObj.name);
      toast.info(`📍 Showing institutes near ${cityObj.name}`);
    }
  };

  /**
   * Handle "Get Directions" click:
   * Redirects user directly to Google Maps showing the turn-by-turn route
   * from their current GPS location to the educational institute.
   */
  const handleGetDirections = (institute: InstituteWithDistance) => {
    const mapsUrl = getGoogleMapsDirectionsUrl(
      institute,
      userCoords.source === "gps" || userCoords.source === "manual"
        ? { latitude: userCoords.latitude, longitude: userCoords.longitude }
        : null
    );

    toast.success(`Opening Google Maps route to ${institute.name}...`, {
      description: `Navigating from ${locationName || "your location"} to ${institute.city}.`,
    });

    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  /**
   * Open Details Modal for an Institute
   */
  const handleViewDetails = (institute: InstituteWithDistance) => {
    setSelectedInstitute(institute);
    setIsDetailsOpen(true);
  };

  /**
   * Helper to pick category icon
   */
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "special":
        return Accessibility;
      case "college":
        return GraduationCap;
      case "vocational":
        return Wrench;
      case "school":
        return School;
      case "support":
        return Building2;
      case "ngo":
        return Heart;
      default:
        return GraduationCap;
    }
  };

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: institutes.length };
    institutes.forEach((inst) => {
      counts[inst.category] = (counts[inst.category] || 0) + 1;
    });
    return counts;
  }, [institutes]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <PageHeader
          icon={<Compass className="h-6 w-6 text-white" />}
          title="Nearby Educational Institutes & Colleges"
          subtitle="Explore inclusive schools, colleges, universities, and disability training institutes nearest to your GPS location"
        >
          <Button
            size="sm"
            onClick={requestLocation}
            disabled={isLocating}
            className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm shadow-sm transition-all flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLocating ? "animate-spin" : ""}`} />
            {isLocating ? "Detecting GPS..." : "Refresh Location"}
          </Button>
        </PageHeader>

        {/* Location Status Banner */}
        <Card className="border border-border/80 bg-gradient-to-r from-card via-card/90 to-primary/5 shadow-sm overflow-hidden">
          <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Status info */}
              <div className="flex items-start sm:items-center gap-3.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl flex-shrink-0 shadow-inner ${
                    locationStatus === "granted" && userCoords.source === "gps"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : locationStatus === "denied"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  <LocateFixed
                    className={`h-5 w-5 ${isLocating ? "animate-pulse" : ""}`}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Current Location
                    </span>
                    {locationStatus === "granted" && userCoords.source === "gps" ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30 text-[11px] gap-1 py-0.5"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                        Live GPS Active
                      </Badge>
                    ) : locationStatus === "denied" ? (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/15 text-amber-700 dark:text-amber-300 text-[11px] py-0.5"
                      >
                        GPS Blocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px] py-0.5">
                        {userCoords.source === "manual" ? "Manual City" : "Detecting..."}
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-foreground mt-0.5 flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="line-clamp-1">{locationName}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {locationStatus === "granted"
                      ? `Exact coordinates: ${userCoords.latitude.toFixed(4)}°N, ${userCoords.longitude.toFixed(4)}°E`
                      : "Allow GPS access in browser for exact turn-by-turn route navigation"}
                  </p>
                </div>
              </div>

              {/* Quick City Switcher & GPS Refresh */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                <div className="w-full sm:w-60">
                  <Select value={selectedCity} onValueChange={handleCityChange}>
                    <SelectTrigger className="h-9 text-xs bg-background">
                      <SelectValue placeholder="Switch City / Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gps" className="font-semibold text-primary">
                        📍 Use My Current Location (GPS)
                      </SelectItem>
                      {POPULAR_CITIES.map((city) => (
                        <SelectItem key={city.name} value={city.name} className="text-xs">
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={requestLocation}
                  disabled={isLocating}
                  className="h-9 text-xs flex items-center gap-1.5 shrink-0"
                >
                  <LocateFixed className={`h-3.5 w-3.5 ${isLocating ? "animate-spin text-primary" : ""}`} />
                  {isLocating ? "Locating..." : "Locate Me"}
                </Button>
              </div>
            </div>

            {/* Warning if GPS denied */}
            {locationStatus === "denied" && (
              <div className="mt-3.5 pt-3 border-t border-border/60 flex items-start gap-2.5 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <span>
                    Location access was denied. To find colleges closest to your doorstep, click the padlock/settings icon in your browser address bar and enable Location permissions.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="link"
                  onClick={requestLocation}
                  className="h-auto p-0 text-xs font-semibold text-amber-800 dark:text-amber-200 underline"
                >
                  Retry Permission
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters & Search Toolbar */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search input with live search indicator */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges, universities, special schools, courses (e.g. 'Graphic Era', 'DAV', 'IIT', 'College')..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 bg-card h-10 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Radius Filter */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                Max Distance:
              </span>
              <Select value={selectedRadius} onValueChange={setSelectedRadius}>
                <SelectTrigger className="w-36 h-10 text-xs bg-card">
                  <SelectValue placeholder="Distance" />
                </SelectTrigger>
                <SelectContent>
                  {RADIUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap border ${
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card hover:bg-accent/40 text-foreground border-border"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-foreground">{institutes.length}</strong> educational institutes (nearest first)
            </span>
            {isLoadingInstitutes && (
              <span className="flex items-center gap-1 text-primary text-[11px]">
                <Loader2 className="h-3 w-3 animate-spin" /> Searching & calculating distances...
              </span>
            )}
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-primary hover:underline text-xs"
            >
              Clear search filter
            </button>
          )}
        </div>

        {/* Institutes Grid */}
        {isLoadingInstitutes && institutes.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="border border-border animate-pulse p-5">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-8 bg-muted rounded w-1/3 mt-3" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : institutes.length === 0 ? (
          <Card className="border border-dashed border-border p-12 text-center">
            <div className="max-w-md mx-auto space-y-3">
              <div className="h-14 w-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground">No institutes found</h3>
              <p className="text-sm text-muted-foreground">
                No educational centers matched your current search filters or distance radius. Try expanding the distance radius or searching for another keyword.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                    setSelectedRadius("0"); // Expand to all distances
                  }}
                >
                  Expand to All Distances & Reset Filters
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {institutes.map((institute) => {
              const IconComponent = getCategoryIcon(institute.category);

              return (
                <Card
                  key={institute.id}
                  className="border border-border hover:border-primary/40 hover:shadow-lg transition-all duration-200 bg-card group flex flex-col justify-between"
                >
                  <CardContent className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Card Header: Icon, Name, Category & Distance */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary flex-shrink-0 group-hover:scale-105 transition-transform"
                          style={{
                            background:
                              "linear-gradient(135deg, hsl(265,80%,92%), hsl(250,84%,94%))",
                            color: "hsl(265,80%,40%)",
                          }}
                        >
                          <IconComponent className="h-6 w-6" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-foreground text-base leading-snug group-hover:text-primary transition-colors">
                              {institute.name}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[11px] font-medium py-0">
                              {institute.type}
                            </Badge>
                            <Badge
                              className="text-[11px] font-semibold bg-primary/15 text-primary hover:bg-primary/20 border-primary/30 py-0 flex items-center gap-1"
                            >
                              <Navigation className="h-2.5 w-2.5 fill-primary" />
                              {institute.formattedDistance} away
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Address */}
                      <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{institute.address}</span>
                      </p>

                      {/* Description snippet */}
                      <p className="text-xs text-foreground/80 mt-2 line-clamp-2 leading-relaxed">
                        {institute.description}
                      </p>

                      {/* Accessibility Features Tags */}
                      {institute.accessibilityFeatures && institute.accessibilityFeatures.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                          {institute.accessibilityFeatures.slice(0, 3).map((feat, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-secondary-foreground"
                            >
                              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                              {feat}
                            </span>
                          ))}
                          {institute.accessibilityFeatures.length > 3 && (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              +{institute.accessibilityFeatures.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-border/60">
                      <Button
                        size="sm"
                        onClick={() => handleGetDirections(institute)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 flex items-center justify-center gap-1.5 shadow-sm font-semibold text-xs"
                      >
                        <Navigation className="h-3.5 w-3.5 fill-white" />
                        Get Directions
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(institute)}
                        className="text-xs hover:bg-accent/40 font-medium"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Institute Detailed Profile Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          {selectedInstitute && (
            <>
              <DialogHeader className="space-y-2 text-left">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs font-semibold">
                    {selectedInstitute.type}
                  </Badge>
                  <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-primary/30 text-xs font-bold flex items-center gap-1">
                    <Navigation className="h-3 w-3 fill-primary" />
                    {selectedInstitute.formattedDistance} from your location
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedInstitute.name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                  {selectedInstitute.address}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-2 text-sm">
                {/* Description */}
                <div className="bg-muted/40 p-3.5 rounded-xl text-xs text-foreground leading-relaxed border border-border/60">
                  <p className="font-semibold text-foreground mb-1 flex items-center gap-1.5 text-xs">
                    <Sparkles className="h-3.5 w-3.5 text-primary" /> About the Institution
                  </p>
                  <p className="text-muted-foreground">{selectedInstitute.description}</p>
                </div>

                {/* Timings & Contact Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {selectedInstitute.timings && (
                    <div className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card text-xs">
                      <Clock className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <span className="font-semibold text-muted-foreground block text-[10px]">Operating Hours</span>
                        <span className="text-foreground font-medium">{selectedInstitute.timings}</span>
                      </div>
                    </div>
                  )}

                  {selectedInstitute.phone && (
                    <a
                      href={`tel:${selectedInstitute.phone}`}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/40 text-xs transition-colors"
                    >
                      <Phone className="h-4 w-4 text-primary shrink-0" />
                      <div>
                        <span className="font-semibold text-muted-foreground block text-[10px]">Phone Number</span>
                        <span className="text-primary font-medium">{selectedInstitute.phone}</span>
                      </div>
                    </a>
                  )}

                  {selectedInstitute.email && (
                    <a
                      href={`mailto:${selectedInstitute.email}`}
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/40 text-xs transition-colors"
                    >
                      <Mail className="h-4 w-4 text-primary shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-muted-foreground block text-[10px]">Email Address</span>
                        <span className="text-primary font-medium truncate block">{selectedInstitute.email}</span>
                      </div>
                    </a>
                  )}

                  {selectedInstitute.website && (
                    <a
                      href={selectedInstitute.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card hover:bg-accent/40 text-xs transition-colors"
                    >
                      <Globe className="h-4 w-4 text-primary shrink-0" />
                      <div className="truncate">
                        <span className="font-semibold text-muted-foreground block text-[10px]">Official Website</span>
                        <span className="text-primary font-medium flex items-center gap-1 truncate">
                          Visit Portal <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      </div>
                    </a>
                  )}
                </div>

                {/* Courses Offered */}
                {selectedInstitute.courses && selectedInstitute.courses.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      Courses & Academic Programs
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {selectedInstitute.courses.map((course, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border text-xs text-foreground font-medium"
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          <span>{course}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Accessibility Features */}
                {selectedInstitute.accessibilityFeatures &&
                  selectedInstitute.accessibilityFeatures.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        Campus Accessibility Provisions
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedInstitute.accessibilityFeatures.map((feat, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-medium"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                  className="text-xs"
                >
                  Close
                </Button>

                <Button
                  onClick={() => {
                    handleGetDirections(selectedInstitute);
                    setIsDetailsOpen(false);
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-2"
                >
                  <Navigation className="h-3.5 w-3.5 fill-white" />
                  Get Directions on Google Maps
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default NearbyPage;
