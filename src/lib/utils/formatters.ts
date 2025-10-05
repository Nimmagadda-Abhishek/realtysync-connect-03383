export const formatPrice = (price: number, listingType?: string): string => {
  let formatted = "";
  
  if (price >= 10000000) {
    formatted = `₹${(price / 10000000).toFixed(2)} Cr`;
  } else if (price >= 100000) {
    formatted = `₹${(price / 100000).toFixed(2)} L`;
  } else {
    formatted = `₹${price.toLocaleString("en-IN")}`;
  }

  if (listingType === "RENT") {
    formatted += "/month";
  }

  return formatted;
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const parseAmenities = (amenitiesString: string): string[] => {
  if (!amenitiesString) return [];
  return amenitiesString.split(",").map((a) => a.trim()).filter(Boolean);
};

export const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;

  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^&\n?#]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
};
