import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Property, ListingType } from "@/types/property";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/LoadingSkeleton";
import { ChevronRight } from "lucide-react";

const listingTitles: Record<string, { title: string; apiType: ListingType }> = {
  sale: { title: "Properties For Sale", apiType: "SALE" },
  resale: { title: "Resale Properties", apiType: "RESALE" },
  rent: { title: "Properties For Rent", apiType: "RENT" },
};

const ListingTypeProperties = () => {
  const params = useParams();
  const listingType = params.listingType || (params["*"] as string)?.split("/")[1];
  const listingInfo = listingType ? listingTitles[listingType] : null;

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["listing-type-properties", listingInfo?.apiType],
    queryFn: () => apiClient.get(`/properties/recent/${listingInfo?.apiType}`),
    enabled: !!listingInfo,
  });

  if (!listingInfo) {
    return <div className="min-h-screen flex items-center justify-center">Listing type not found</div>;
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{listingInfo.title}</span>
        </div>

        <h1 className="text-3xl font-bold mb-8">{listingInfo.title}</h1>

        {isLoading ? (
          <PropertyGridSkeleton count={9} />
        ) : properties && properties.length > 0 ? (
          <>
            <p className="text-muted-foreground mb-6">Found {properties.length} properties</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 space-y-4">
            <div className="text-6xl">🔍</div>
            <h3 className="text-2xl font-bold">No properties found</h3>
            <p className="text-muted-foreground">Check back later for new listings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingTypeProperties;
