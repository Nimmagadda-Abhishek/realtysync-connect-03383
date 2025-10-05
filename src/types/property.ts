export interface PropertyImage {
  id: number;
  imageUrl: string;
  altText: string;
  displayOrder: number;
  isPrimary: boolean;
}

export type PropertyType = "RESIDENTIAL" | "COMMERCIAL" | "NEW_DEVELOPMENT" | "AGRICULTURE";
export type ListingType = "SALE" | "RESALE" | "RENT";
export type PropertyStatus = "AVAILABLE" | "SOLD" | "UNDER_OFFER" | "RENTED";
export type ListingStatus = "STANDARD" | "FEATURED" | "PREMIUM" | "RECENT";

export interface Property {
  id: number;
  propertyTitle: string;
  price: number;
  propertyType: PropertyType;
  listingType: ListingType;
  propertyDescription: string;
  fullAddress: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  carpetArea: number;
  builtUpArea: number;
  floors: number;
  totalFloors: number;
  propertyAge: number;
  furnishing: string;
  amenities: string;
  parkingAvailable: boolean;
  parkingSpots: number;
  propertyImages: PropertyImage[];
  youtubeVideoUrl?: string;
  instagramProfile?: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  status: PropertyStatus;
  listingStatus: ListingStatus;
  latitude?: number;
  longitude?: number;
  viewCount: number;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryFormData {
  fullName: string;
  email: string;
  phoneNumber: string;
  message?: string;
  inquiryType: "PROPERTY_INQUIRY";
  propertyId: number;
  userId: null;
}
