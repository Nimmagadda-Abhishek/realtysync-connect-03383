import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Property, PropertyType, ListingType } from "@/types/property";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/LoadingSkeleton";
import { Search, Home as HomeIcon, Building2, Sprout, Construction, Grid3x3 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

const categoryButtons = [
  { type: "RESIDENTIAL" as PropertyType, icon: HomeIcon, label: "Residential", path: "/properties/residential" },
  { type: "COMMERCIAL" as PropertyType, icon: Building2, label: "Commercial", path: "/properties/commercial" },
  { type: "AGRICULTURE" as PropertyType, icon: Sprout, label: "Agriculture", path: "/properties/agriculture" },
  { type: "NEW_DEVELOPMENT" as PropertyType, icon: Construction, label: "New Development", path: "/properties/new-development" },
  { icon: Grid3x3, label: "View All", path: "/search" },
];

const listingTypeFilters = [
  { type: "SALE" as ListingType, label: "For Sale", path: "/properties/sale" },
  { type: "RESALE" as ListingType, label: "Resale", path: "/properties/resale" },
  { type: "RENT" as ListingType, label: "For Rent", path: "/properties/rent" },
];

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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

  // Sort properties to show premium first
  const sortedFeaturedProperties = useMemo(() => {
    if (!featuredProperties) return [];
    return [...featuredProperties].sort((a, b) => {
      if (a.listingStatus === "PREMIUM" && b.listingStatus !== "PREMIUM") return -1;
      if (a.listingStatus !== "PREMIUM" && b.listingStatus === "PREMIUM") return 1;
      return 0;
    });
  }, [featuredProperties]);

  const sortedRecentProperties = useMemo(() => {
    if (!recentProperties) return [];
    return [...recentProperties].sort((a, b) => {
      if (a.listingStatus === "PREMIUM" && b.listingStatus !== "PREMIUM") return -1;
      if (a.listingStatus !== "PREMIUM" && b.listingStatus === "PREMIUM") return 1;
      return 0;
    });
  }, [recentProperties]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold">Find Your Dream Property</h1>
          <p className="text-xl opacity-90">Browse thousands of properties for sale and rent</p>
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by location, property type, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-card text-foreground"
            />
          </form>
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
                    <Icon className="h-8 w-8" />
                    <span className="text-sm font-medium">{category.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Listing Type Filters */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Browse by Type</h2>
          <div className="flex flex-wrap gap-3">
            {listingTypeFilters.map((filter) => (
              <Link key={filter.type} to={filter.path}>
                <Button variant="secondary" size="lg" className="rounded-full">
                  {filter.label}
                </Button>
              </Link>
            ))}
          </div>
        </section>

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
              {premiumProperties?.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </section>

        {/* Recent Properties */}
        <section className="mb-20">
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
      </div>
    </div>
  );
};

export default Home;
