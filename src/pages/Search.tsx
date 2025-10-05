import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
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
    city: searchParams.get("city") || "",
    propertyType: searchParams.get("propertyType") || "",
    listingType: searchParams.get("listingType") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
  });
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("size", "12");
    
    if (filters.city) params.append("city", filters.city);
    if (filters.propertyType) params.append("propertyType", filters.propertyType);
    if (filters.listingType) params.append("listingType", filters.listingType);
    if (filters.minPrice) params.append("minPrice", filters.minPrice);
    if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
    if (filters.bedrooms) params.append("bedrooms", filters.bedrooms);
    
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

  const handleApplyFilters = () => {
    setPage(0);
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setFilters({
      city: "",
      propertyType: "",
      listingType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
    });
    setSearchQuery("");
    setPage(0);
  };

  const FilterPanel = () => (
    <div className="space-y-6">
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
              className="pl-10 h-12"
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
            <div className="sticky top-4 bg-card p-6 rounded-lg shadow-card">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
