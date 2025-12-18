/**
 * Review Types for QRDatMon Web Admin
 */

export interface ItemReview {
  id: string;
  menuItem: {
    id: string;
    name: string;
    imageUrl?: string;
  };
  rating: number;
  comment?: string;
}

export interface Review {
  id: string;
  user: {
    id: string;
    name?: string;
    email?: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
  bill?: {
    id: string;
    billNumber?: string;
  };
  foodRating: number;
  serviceRating: number;
  ambianceRating: number;
  averageRating: number;
  comment?: string;
  isAnonymous: boolean;
  itemReviews: ItemReview[];
  response?: string;
  respondedAt?: string;
  respondedBy?: {
    id: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ReviewFilters {
  minRating?: number;
  maxRating?: number;
  menuItemId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'averageRating';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  avgFoodRating: number;
  avgServiceRating: number;
  avgAmbianceRating: number;
  avgOverallRating: number;
  ratingDistribution: {
    rating: number;
    count: number;
  }[];
}
