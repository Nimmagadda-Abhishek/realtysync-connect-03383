import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, Link } from "react-router-dom";
import { apiClient } from "@/lib/api";
import { Property, PropertyType, ListingType } from "@/types/property";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/LoadingSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search as SearchIcon, Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    state: searchParams.get("state") || "",
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    listingType: searchParams.get("listingType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    pincode: searchParams.get("pincode") || "",
    parkingAvailable: searchParams.get("parkingAvailable") || "any",
    parkingSpots: searchParams.get("parkingSpots") || "",
  });
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", "12");

    if (filters.state) params.append("state", filters.state);
    if (filters.city) params.append("city", filters.city);
    if (filters.propertyType) params.append("propertyType", filters.propertyType);
    if (filters.listingType) params.append("listingType", filters.listingType);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
    if (filters.pincode) params.append("pincode", filters.pincode);
    if (filters.parkingAvailable && filters.parkingAvailable !== "any") params.append("parkingAvailable", filters.parkingAvailable);
    if (filters.parkingSpots) params.append("parkingSpots", filters.parkingSpots);

    return params.toString();
  };

  const { data: propertiesData, isLoading } = useQuery<{ content: Property[]; totalElements: number }>({
    queryKey: ["search-properties", filters, page, searchQuery],
    queryFn: async () => {
      const queryString = buildQueryString();
      const response = await apiClient.get(`/properties?${queryString}`);

      // Filter by search query on client side
      let filtered = response.content || response;
      if (!Array.isArray(filtered)) filtered = [filtered];

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((p: Property) =>
          p.propertyTitle.toLowerCase().includes(query) ||
          p.locality.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.fullAddress.toLowerCase().includes(query)
        );
      }

      // Sort
      if (sort === "price-low") filtered.sort((a: Property, b: Property) => a.price - b.price);
      if (sort === "price-high") filtered.sort((a: Property, b: Property) => b.price - a.price);
      if (sort === "views") filtered.sort((a: Property, b: Property) => b.viewCount - a.viewCount);

      return {
        content: filtered,
        totalElements: filtered.length,
      };
    },
  });

  const { data: soldOutProperties, isLoading: soldOutLoading } = useQuery<Property[]>({
    queryKey: ["sold-out-properties"],
    queryFn: () => apiClient.get("/agent/properties/sold"),
  });

  const handleApplyFilters = () => {
    setPage(0);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      state: "",
      city: "",
      propertyType: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      pincode: "",
      parkingAvailable: "any",
      parkingSpots: "",
    });
    setSearchQuery("");
    setPage(0);
  };



  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          value={filters.state}
          onChange={(e) => setFilters({ ...filters, state: e.target.value })}
          placeholder="Enter state name (e.g., Telangana)"
        />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          placeholder="Enter city name (e.g., Hyderabad)"
        />
      </div>
      <div>
        <Label htmlFor="pincode">Zip Code</Label>
        <Input
          id="pincode"
          value={filters.pincode}
          onChange={(e) => setFilters({ ...filters, pincode: e.target.value })}
          placeholder="Enter zip code (e.g., 500081)"
        />
      </div>

      <div>
        <Label>Property Type</Label>
        <div className="space-y-2 mt-2">
          {["RESIDENTIAL", "COMMERCIAL", "AGRICULTURE", "NEW_DEVELOPMENT"].map((type) => (
            <div key={type} className="flex items-center gap-2">
              <Checkbox
                id={type}
                checked={filters.propertyType === type}
                onCheckedChange={(checked) =>
                  setFilters({ ...filters, propertyType: checked ? type : "" })
                }
              />
              <Label htmlFor={type} className="cursor-pointer">
                {type.replace(/_/g, " ")}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="listingType">Listing Type</Label>
        <Select value={filters.listingType} onValueChange={(value) => setFilters({ ...filters, listingType: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select listing type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="SALE">For Sale</SelectItem>
            <SelectItem value="RESALE">Resale</SelectItem>
            <SelectItem value="RENT">For Rent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Price Range</Label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="bedrooms">Bedrooms</Label>
        <Select value={filters.bedrooms} onValueChange={(value) => setFilters({ ...filters, bedrooms: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select bedrooms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="1">1 BHK</SelectItem>
            <SelectItem value="2">2 BHK</SelectItem>
            <SelectItem value="3">3 BHK</SelectItem>
            <SelectItem value="4">4 BHK</SelectItem>
            <SelectItem value="5">5+ BHK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="parkingAvailable">Parking</Label>
        <Select value={filters.parkingAvailable} onValueChange={(value) => setFilters({ ...filters, parkingAvailable: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select parking availability" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="true">With Parking</SelectItem>
            <SelectItem value="false">Without Parking</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="parkingSpots">Parking Spots</Label>
        <Input
          id="parkingSpots"
          type="number"
          value={filters.parkingSpots}
          onChange={(e) => setFilters({ ...filters, parkingSpots: e.target.value })}
          placeholder="Enter number of parking spots"
        />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApplyFilters} className="flex-1">Apply Filters</Button>
        <Button onClick={handleResetFilters} variant="outline">Reset</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Search Bar */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by location, title, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12 h-12"
            />

          </div>

          <div className="flex items-center justify-between gap-4">
            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="views">Most Viewed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-4 bg-card p-6 rounded-lg shadow-card max-h-[calc(100vh-2rem)] overflow-y-auto">
              <h3 className="font-bold text-lg mb-4">Filters</h3>
              <FilterPanel />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 space-y-6">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                {isLoading ? "Loading..." : `Found ${propertiesData?.totalElements || 0} properties`}
              </p>
            </div>

            {/* Results Grid */}
            {isLoading ? (
              <PropertyGridSkeleton count={9} />
            ) : propertiesData?.content && propertiesData.content.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {propertiesData.content.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                {propertiesData.totalElements > (page + 1) * 12 && (
                  <div className="text-center">
                    <Button onClick={() => setPage((p) => p + 1)} variant="outline" size="lg">
                      Load More
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing {(page + 1) * 12} of {propertiesData.totalElements} properties
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="text-6xl">🔍</div>
                <h3 className="text-2xl font-bold">No properties found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria</p>
                <Button onClick={handleResetFilters}>Reset All Filters</Button>
              </div>
            )}

            {/* Sold Out Properties */}
            <section className="mt-16">
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
      </div>
    </div>
  );
};

export default Search;
