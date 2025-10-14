import { Heart, Share2, MapPin, Bed, Bath, Ruler, MessageCircle, Star } from "lucide-react";
import { Property } from "@/types/property";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";

interface PropertyCardProps {
  property: Property;
}

const formatPrice = (price: number) => {
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
  return `₹${price.toLocaleString("en-IN")}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "AVAILABLE":
      return "bg-success text-white";
    case "SOLD":
      return "bg-error text-white";
    case "UNDER_OFFER":
      return "bg-warning text-white";
    case "RENTED":
      return "bg-info text-white";
    default:
      return "bg-muted text-foreground";
  }
};

const getListingTypeBadge = (type: string) => {
  switch (type) {
    case "SALE":
      return "bg-badge-sale text-white";
    case "RESALE":
      return "bg-badge-resale text-white";
    case "RENT":
      return "bg-badge-rent text-white";
    default:
      return "bg-muted text-foreground";
  }
};

export const PropertyCard = ({ property }: PropertyCardProps) => {
  const { toggleSaveProperty, isPropertySaved } = useSavedProperties();
  const navigate = useNavigate();
  const isSaved = isPropertySaved(property.id);
  const isPremium = property.listingStatus === "PREMIUM";

  const primaryImage = property.propertyImages.find((img) => img.isPrimary) || property.propertyImages[0];

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSaveProperty(property.id);
    toast.success(isSaved ? "Property removed from saved" : "Property saved successfully!");
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: property.propertyTitle,
      text: `Check out this property: ${property.propertyTitle}`,
      url: `${window.location.origin}/property/${property.id}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        navigator.clipboard.writeText(shareData.url);
        toast.success("Link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const message = `Hi, I'm interested in ${property.propertyTitle} listed on PropConnect.`;
    window.open(`https://wa.me/${property.contactPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCardClick = () => {
    navigate(`/property/${property.id}`);
  };

  const priceText = property.listingType === "RENT" ? `${formatPrice(property.price)}/month` : formatPrice(property.price);

  return (
    <div
      onClick={handleCardClick}
      className={`bg-card rounded-lg overflow-hidden transition-all duration-200 cursor-pointer hover:scale-[1.02] animate-fade-in ${
        isPremium
          ? "border-2 border-primary shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] bg-gradient-to-br from-card to-primary/5"
          : "shadow-card hover:shadow-card-hover"
      }`}
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {property.status === "SOLD" ? (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-muted-foreground mb-2">SOLD OUT</div>
              <div className="text-sm text-muted-foreground">This property has been sold</div>
            </div>
          </div>
        ) : (
          <img
            src={primaryImage?.imageUrl || "/placeholder.svg"}
            alt={primaryImage?.altText || property.propertyTitle}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-foreground/80 text-background backdrop-blur-sm">
            {property.propertyType.replace(/_/g, " ")}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {isPremium && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-lg">
              <Star className="h-3 w-3 mr-1 fill-white" />
              Premium
            </Badge>
          )}
          {property.isVerified && (
            <Badge className="bg-badge-verified text-white">✓ Verified</Badge>
          )}
          <Badge className={getListingTypeBadge(property.listingType)}>
            {property.listingType}
          </Badge>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-lg line-clamp-2 text-card-foreground">
          {property.propertyTitle}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-muted-foreground text-sm">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{property.locality}, {property.city}</span>
        </div>

        {/* Price */}
        <div className="text-2xl font-bold text-primary">{priceText}</div>

        {/* Features */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-b border-border py-2">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.bedrooms} BHK</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Bath className="h-4 w-4" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1">
            <Ruler className="h-4 w-4" />
            <span>{property.area} sq.ft</span>
          </div>
        </div>

        {/* Status */}
        <div>
          <Badge className={getStatusColor(property.status)}>
            {property.status.replace(/_/g, " ")}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
              isSaved
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-foreground"
            }`}
          >
            <Heart className={`h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
            <span className="text-sm">{isSaved ? "Saved" : "Save"}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center p-2 rounded-md bg-muted hover:bg-muted/80 transition-colors"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center p-2 rounded-md bg-success hover:bg-success/90 text-white transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
