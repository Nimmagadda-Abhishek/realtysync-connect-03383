import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Property } from "@/types/property";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Car,
  Eye,
  Calendar,
  Phone,
  Mail,
  MessageCircle,
  Share2,
  Heart,
  CheckCircle2,
  Instagram,
  Play,
} from "lucide-react";
import { useState } from "react";
import { useSavedProperties } from "@/contexts/SavedPropertiesContext";
import { formatPrice, formatDate, parseAmenities } from "@/lib/utils/formatters";
import { PropertyCard } from "@/components/PropertyCard";
import { InquiryModal } from "@/components/InquiryModal";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const { toggleSaveProperty, isPropertySaved } = useSavedProperties();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: ["property", id],
    queryFn: () => apiClient.get(`/properties/${id}`),
  });

  const { data: similarProperties } = useQuery<Property[]>({
    queryKey: ["similar-properties", property?.city, property?.propertyType],
    queryFn: () => apiClient.get(`/properties?city=${property?.city}&propertyType=${property?.propertyType}`),
    enabled: !!property,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <p className="text-muted-foreground">This property may have been sold or removed</p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/search")}>Browse Properties</Button>
          <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const images = property.propertyImages.sort((a, b) => a.displayOrder - b.displayOrder);
  const amenitiesList = parseAmenities(property.amenities);
  const isSaved = isPropertySaved(property.id);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = async () => {
    const shareData = {
      title: property.propertyTitle,
      text: `Check out: ${property.propertyTitle} - ${formatPrice(property.price, property.listingType)}`,
      url: window.location.href,
    };
    
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleWhatsApp = () => {
    const message = `Hi, I'm interested in ${property.propertyTitle} listed on PropConnect.`;
    window.open(`https://wa.me/${property.contactPhone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleCall = () => {
    window.location.href = `tel:${property.contactPhone}`;
  };

  const handleEmail = () => {
    window.location.href = `mailto:${property.contactEmail}?subject=Inquiry about ${property.propertyTitle}`;
  };

  const handleSave = () => {
    toggleSaveProperty(property.id);
    toast.success(isSaved ? "Property removed from saved" : "Property saved!");
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      {/* Image Gallery */}
      <div className="relative w-full bg-black">
        <div className="container mx-auto max-w-6xl">
          <div className="relative aspect-video">
            <img
              src={images[currentImageIndex]?.imageUrl || "/placeholder.svg"}
              alt={images[currentImageIndex]?.altText || property.propertyTitle}
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <button
                onClick={handlePrevImage}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={handleNextImage}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {images.length}
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setCurrentImageIndex(idx)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentImageIndex ? "border-primary scale-105" : "border-transparent"
              }`}
            >
              <img src={img.imageUrl} alt={img.altText} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
        {/* Property Header */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-foreground/80 text-background">
              {property.propertyType.replace(/_/g, " ")}
            </Badge>
            <Badge className="bg-badge-sale text-white">{property.listingType}</Badge>
            {property.isVerified && (
              <Badge className="bg-badge-verified text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
              </Badge>
            )}
            <Badge className="bg-success text-white">{property.status.replace(/_/g, " ")}</Badge>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">{property.propertyTitle}</h1>

          <div className="flex items-start gap-2 text-muted-foreground">
            <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium">{property.fullAddress}</p>
              <p className="text-sm">{property.locality}, {property.city}, {property.state} - {property.pincode}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{property.viewCount} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Posted on {formatDate(property.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="text-4xl font-bold text-primary">
              {formatPrice(property.price, property.listingType)}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleSave}>
                <Heart className={`h-5 w-5 ${isSaved ? "fill-current text-primary" : ""}`} />
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted p-4 rounded-lg text-center">
            <Bed className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="font-semibold">{property.bedrooms} Bedrooms</p>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <Bath className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="font-semibold">{property.bathrooms} Bathrooms</p>
          </div>
          <div className="bg-muted p-4 rounded-lg text-center">
            <Ruler className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="font-semibold">{property.area} sq.ft</p>
          </div>
          {property.parkingAvailable && (
            <div className="bg-muted p-4 rounded-lg text-center">
              <Car className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="font-semibold">{property.parkingSpots} Parking</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-card p-6 rounded-lg shadow-card">
          <h2 className="text-2xl font-bold mb-4">About This Property</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {property.propertyDescription}
          </p>
        </div>

        {/* Property Details */}
        <div className="bg-card p-6 rounded-lg shadow-card">
          <h2 className="text-2xl font-bold mb-4">Property Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Property Type</span>
              <span className="font-medium">{property.propertyType.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Listing Type</span>
              <span className="font-medium">{property.listingType}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Carpet Area</span>
              <span className="font-medium">{property.carpetArea} sq.ft</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Built-up Area</span>
              <span className="font-medium">{property.builtUpArea} sq.ft</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Floor</span>
              <span className="font-medium">{property.floors} of {property.totalFloors}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Property Age</span>
              <span className="font-medium">{property.propertyAge} years</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Furnishing</span>
              <span className="font-medium">{property.furnishing}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{property.status.replace(/_/g, " ")}</span>
            </div>
          </div>
        </div>

        {/* Amenities */}
        {amenitiesList.length > 0 && (
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h2 className="text-2xl font-bold mb-4">Amenities & Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {amenitiesList.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-muted px-3 py-2 rounded-md">
                  <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video & Social */}
        {(property.youtubeVideoUrl || property.instagramProfile) && (
          <div className="space-y-4">
            {property.youtubeVideoUrl && (
              <div className="bg-card p-6 rounded-lg shadow-card">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Play className="h-6 w-6" /> Video Tour
                </h2>
                <div className="aspect-video">
                  <iframe
                    src={property.youtubeVideoUrl}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
            {property.instagramProfile && (
              <Button variant="outline" className="w-full" onClick={() => window.open(property.instagramProfile, "_blank")}>
                <Instagram className="h-5 w-5 mr-2" />
                View on Instagram
              </Button>
            )}
          </div>
        )}

        {/* Map */}
        {property.latitude && property.longitude && (
          <div className="bg-card p-6 rounded-lg shadow-card">
            <h2 className="text-2xl font-bold mb-4">Location</h2>
            <div className="aspect-video rounded-lg overflow-hidden mb-4">
              <iframe
                src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&output=embed`}
                className="w-full h-full"
                loading="lazy"
              />
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(`https://www.google.com/maps?q=${property.latitude},${property.longitude}`, "_blank")}
            >
              Get Directions
            </Button>
          </div>
        )}

        {/* Contact Owner */}
        <div className="bg-card p-6 rounded-lg shadow-card">
          <h2 className="text-2xl font-bold mb-4">Contact Owner</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-full">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{property.contactName}</p>
                <p className="text-sm text-muted-foreground">{property.contactPhone}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Button onClick={handleCall} size="lg" className="w-full">
                <Phone className="h-5 w-5 mr-2" /> Call Owner
              </Button>
              <Button onClick={handleWhatsApp} variant="secondary" size="lg" className="w-full bg-success hover:bg-success/90 text-white">
                <MessageCircle className="h-5 w-5 mr-2" /> WhatsApp
              </Button>
              <Button onClick={handleEmail} variant="outline" size="lg" className="w-full">
                <Mail className="h-5 w-5 mr-2" /> Send Email
              </Button>
              <Button onClick={() => setShowInquiryModal(true)} variant="outline" size="lg" className="w-full">
                <MessageCircle className="h-5 w-5 mr-2" /> Send Inquiry
              </Button>
            </div>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties && similarProperties.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.filter(p => p.id !== property.id).slice(0, 6).map((prop) => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <InquiryModal
        open={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        propertyId={property.id}
        propertyTitle={property.propertyTitle}
      />

      {/* Mobile Sticky Contact */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 bg-card border-t border-border p-4 flex gap-2 z-40">
        <Button onClick={handleWhatsApp} className="flex-1" size="lg">
          <MessageCircle className="h-5 w-5 mr-2" /> Contact Owner
        </Button>
        <Button onClick={handleSave} variant="outline" size="lg">
          <Heart className={`h-5 w-5 ${isSaved ? "fill-current" : ""}`} />
        </Button>
      </div>
    </div>
  );
};

export default PropertyDetails;
