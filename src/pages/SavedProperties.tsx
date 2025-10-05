import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Property } from "@/types/property";
import { PropertyCard } from "@/components/PropertyCard";
import { PropertyGridSkeleton } from "@/components/LoadingSkeleton";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Heart } from "lucide-react";

const SavedProperties = () => {
  const navigate = useNavigate();
  const { savedPropertyIds, clearAllSaved } = useSavedProperties();

  const { data: allProperties, isLoading } = useQuery<Property[]>({
    queryKey: ["all-properties-for-saved"],
    queryFn: () => apiClient.get("/properties/recent"),
    enabled: savedPropertyIds.length > 0,
  });

  const savedProperties = allProperties?.filter((p) => savedPropertyIds.includes(p.id)) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 md:pb-8">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold mb-8">My Saved Properties</h1>
          <PropertyGridSkeleton count={6} />
        </div>
      </div>
    );
  }

  if (savedPropertyIds.length === 0) {
    return (
      <div className="min-h-screen pb-24 md:pb-8 flex items-center justify-center">
        <div className="text-center space-y-6 px-4">
          <div className="flex justify-center">
            <div className="bg-muted rounded-full p-8">
              <Heart className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">No saved properties yet</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Save properties you're interested in for quick access later
            </p>
          </div>
          <Button onClick={() => navigate("/search")} size="lg">
            Start Exploring
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">My Saved Properties</h1>
            <p className="text-muted-foreground mt-1">
              You have {savedPropertyIds.length} saved {savedPropertyIds.length === 1 ? "property" : "properties"}
            </p>
          </div>
          {savedPropertyIds.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Clear All</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove all saved properties?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all {savedPropertyIds.length} properties from your saved list.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearAllSaved} className="bg-error hover:bg-error/90">
                    Yes, Remove All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedProperties;
