import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Property, PropertyType, ListingType } from "@/types/property";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/LoadingSkeleton";
import { Search, Home as HomeIcon, Building2, Sprout, Construction, Grid3x3, RefreshCw, Heart } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo, useEffect } from "react";
import { getStateFromCoordinates, getCityAndStateFromCoordinates, calculateDistance } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { useUser } from "@/contexts/UserContext";
import { Badge } from "@/components/ui/badge";

const categoryButtons = [
  { type: "RESIDENTIAL" as PropertyType, icon: HomeIcon, label: "Residential", path: "/properties/residential", color: "bg-blue-500" },
  { type: "COMMERCIAL" as PropertyType, icon: Building2, label: "Commercial", path: "/properties/commercial", color: "bg-green-500" },
  { type: "AGRICULTURE" as PropertyType, icon: Sprout, label: "Agriculture", path: "/properties/agriculture", color: "bg-yellow-500" },
  { type: "NEW_DEVELOPMENT" as PropertyType, icon: Construction, label: "New Development", path: "/properties/new-development", color: "bg-purple-500" },
  { icon: Grid3x3, label: "View All", path: "/search", color: "bg-gray-500" },
];

const listingTypeFilters = [
  { type: "SALE" as ListingType, label: "For Sale", path: "/properties/sale" },
  { type: "RESALE" as ListingType, label: "Resale", path: "/properties/resale" },
  { type: "RENT" as ListingType, label: "For Rent", path: "/properties/rent" },
];

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [userState, setUserState] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { savedPropertyIds } = useSavedProperties();
  const { isLoggedIn } = useUser();

  const { data: featuredProperties, isLoading: featuredLoading } = useQuery<Property[]>({
    queryKey: ["featured-properties"],
    queryFn: () => apiClient.get("/properties/featured"),
  });

  const { data: premiumProperties, isLoading: premiumLoading } = useQuery<Property[]>({
    queryKey: ["premium-properties"],
    queryFn: () => apiClient.get("/properties/premium"),
  });

  const { data: recentProperties, isLoading: recentLoading } = useQuery<Property[]>({
    queryKey: ["recent-properties"],
    queryFn: () => apiClient.get("/properties/recent"),
  });

  const { data: soldOutProperties, isLoading: soldOutLoading } = useQuery<Property[]>({
    queryKey: ["sold-out-properties"],
    queryFn: () => apiClient.get("/agent/properties/sold"),
  });

  // Get user's location and determine state
  useEffect(() => {
    const getUserState = async () => {
      const storedLocation = localStorage.getItem("userLocation");
      if (storedLocation) {
        try {
          const { latitude, longitude } = JSON.parse(storedLocation);
          const state = await getStateFromCoordinates(latitude, longitude);
          setUserState(state);
        } catch (error) {
          console.error("Error getting user state:", error);
        }
      }
    };
    getUserState();
  }, []);

  // Filter and sort properties within 50km of user's location, fallback to all if none found
  const filterAndSortProperties = useMemo(() => {
    const filterAndSort = (properties: Property[] | undefined, excludeSold: boolean = false) => {
      if (!properties) return [];

      // Get user location
      const storedLocation = localStorage.getItem("userLocation");
      if (!storedLocation) return properties; // If no user location, show all properties

      let userLat = 0, userLon = 0;
      try {
        const { latitude, longitude } = JSON.parse(storedLocation);
        userLat = latitude;
        userLon = longitude;
      } catch (error) {
        console.error("Error parsing user location:", error);
        return properties;
      }

      // First, filter properties within 50km
      const nearbyProperties = properties
        .filter(property => {
          // Exclude sold properties if requested
          if (excludeSold && property.status === "SOLD") return false;
          return property.latitude && property.longitude && calculateDistance(userLat, userLon, property.latitude, property.longitude) <= 50;
        })
        .sort((a, b) => {
          const distA = calculateDistance(userLat, userLon, a.latitude!, a.longitude!);
          const distB = calculateDistance(userLat, userLon, b.latitude!, b.longitude!);
          return distA - distB;
        });

      // If no properties found within 50km, show all properties (excluding sold if requested)
      if (nearbyProperties.length === 0) {
        return properties
          .filter(property => !excludeSold || property.status !== "SOLD")
          .sort((a, b) => {
            // Sort by listing status (premium first) if no location-based sorting
            if (a.listingStatus === "PREMIUM" && b.listingStatus !== "PREMIUM") return -1;
            if (a.listingStatus !== "PREMIUM" && b.listingStatus === "PREMIUM") return 1;
            return 0;
          });
      }

      return nearbyProperties;
    };

    return {
      featured: filterAndSort(featuredProperties),
      premium: filterAndSort(premiumProperties, true), // Exclude sold properties from premium
      recent: filterAndSort(recentProperties, true), // Exclude sold properties from recent
    };
  }, [featuredProperties, premiumProperties, recentProperties]);

  // Sort properties to show premium first within filtered results
  const sortedFeaturedProperties = useMemo(() => {
    return [...filterAndSortProperties.featured].sort((a, b) => {
      if (a.listingStatus === "PREMIUM" && b.listingStatus !== "PREMIUM") return -1;
      if (a.listingStatus !== "PREMIUM" && b.listingStatus === "PREMIUM") return 1;
      return 0;
    });
  }, [filterAndSortProperties.featured]);

  const sortedRecentProperties = useMemo(() => {
    return [...filterAndSortProperties.recent].sort((a, b) => {
      if (a.listingStatus === "PREMIUM" && b.listingStatus !== "PREMIUM") return -1;
      if (a.listingStatus !== "PREMIUM" && b.listingStatus === "PREMIUM") return 1;
      return 0;
    });
  }, [filterAndSortProperties.recent]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const { city, state } = await getCityAndStateFromCoordinates(latitude, longitude);

          if (city || state) {
            // Store location for future use
            localStorage.setItem("userLocation", JSON.stringify({ latitude, longitude }));

            toast({
              title: "Location updated",
              description: `Set location to ${city || "Unknown city"}, ${state || "Unknown state"}`,
            });

            // Invalidate queries to refresh property lists with new location
            queryClient.invalidateQueries({ queryKey: ["featured-properties"] });
            queryClient.invalidateQueries({ queryKey: ["premium-properties"] });
            queryClient.invalidateQueries({ queryKey: ["recent-properties"] });
          } else {
            toast({
              title: "Location not found",
              description: "Could not determine your city and state from your location.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error getting location:", error);
          toast({
            title: "Error getting location",
            description: "Failed to get your location. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Failed to get your location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        toast({
          title: "Location access denied",
          description: errorMessage,
          variant: "destructive",
        });
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-cover bg-center bg-no-repeat text-primary-foreground py-32 px-4 relative min-h-[80vh]" style={{ backgroundImage: "url('/01.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
        <div className="relative z-10">
          <div className="container mx-auto max-w-4xl text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold animate-fade-in bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
              Find Your Dream Property
            </h1>
            <p className="text-xl md:text-2xl opacity-90 animate-slide-in-left">Browse thousands of properties for sale and rent</p>
            <div className="flex gap-3 max-w-2xl mx-auto animate-scale-in">
              <form onSubmit={handleSearch} className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search by location, property type, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => navigate("/search")}
                  className="pl-12 h-14 text-base bg-white/95 backdrop-blur-md text-foreground border-2 border-transparent hover:border-primary focus:border-primary transition-all shadow-xl rounded-xl"
                  readOnly
                />
              </form>
              <Button
                variant="default"
                size="lg"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="h-14 px-6 bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-xl"
                title="Use current location"
              >
                <RefreshCw className={`h-5 w-5 ${isGettingLocation ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16 max-w-7xl">
        {/* Category Filters */}
        <section className="animate-fade-in">
          <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categoryButtons.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link key={category.label} to={category.path} style={{ animationDelay: `${index * 0.1}s` }} className="animate-scale-in">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-8 flex flex-col gap-4 hover:bg-gradient-to-br hover:from-primary hover:to-accent hover:text-white border-2 hover:border-transparent transition-all duration-300 transform hover:scale-105 hover:shadow-xl rounded-xl group"
                  >
                    <div className="relative">
                      <div className={`absolute inset-0 ${category.color} rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity`}></div>
                      <div className={`relative p-4 rounded-full ${category.color} text-white group-hover:scale-110 transition-transform shadow-lg`}>
                        <Icon className="h-8 w-8" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{category.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Listing Type Filters */}


        {/* Featured Properties */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Featured Properties</h2>
            <Link to="/search?featured=true">
              <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white transition-all duration-300 rounded-lg">
                View All →
              </Button>
            </Link>
          </div>
          {featuredLoading ? (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="min-w-[300px] md:min-w-[350px]">
                    <PropertyGridSkeleton count={1} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4 -mx-4 px-4">
              <div className="flex gap-6">
                {sortedFeaturedProperties?.slice(0, 4).map((property) => (
                  <div key={property.id} className="min-w-[300px] md:min-w-[350px]">
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Premium Properties */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Premium Properties</h2>
            <Link to="/search?premium=true">
              <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white transition-all duration-300 rounded-lg">
                View All →
              </Button>
            </Link>
          </div>
          {premiumLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterAndSortProperties.premium?.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Properties */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Recently Added</h2>
            <Link to="/search">
              <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white transition-all duration-300 rounded-lg">
                View All →
              </Button>
            </Link>
          </div>
          {recentLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedRecentProperties?.slice(0, 8).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* Sold Out Properties */}
        <section className="mb-20 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Sold Out Properties</h2>
            <Link to="/search?sold=true">
              <Button variant="ghost" className="hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white transition-all duration-300 rounded-lg">
                View All →
              </Button>
            </Link>
          </div>
          {soldOutLoading ? (
            <PropertyGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {soldOutProperties?.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
