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

  // Filter and sort properties within 50km of user's location
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

      // Filter properties within 50km and sort by distance
      return properties
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
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10">
          <div className="container mx-auto max-w-4xl text-center space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold">Find Your Dream Property</h1>
            <p className="text-xl opacity-90">Browse thousands of properties for sale and rent</p>
            <div className="flex gap-2 max-w-xl mx-auto">
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by location, property type, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={() => navigate("/search")}
                  className="pl-12 h-12 text-base bg-card text-foreground"
                  readOnly
                />
              </form>
              <Button
                variant="default"
                size="lg"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="h-12 px-4 bg-white text-black hover:bg-gray-100"
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
        <section>
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoryButtons.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.label} to={category.path}>
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col gap-3 hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <div className={`p-3 rounded-full ${category.color} text-white`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <span className="text-sm font-medium">{category.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Listing Type Filters */}


        {/* Featured Properties */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Properties</h2>
            <Link to="/search?featured=true">
              <Button variant="ghost">View All →</Button>
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
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Premium Properties</h2>
            <Link to="/search?premium=true">
              <Button variant="ghost">View All →</Button>
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
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recently Added</h2>
            <Link to="/search">
              <Button variant="ghost">View All →</Button>
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
        <section className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Sold Out Properties</h2>
            <Link to="/search?sold=true">
              <Button variant="ghost">View All →</Button>
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
