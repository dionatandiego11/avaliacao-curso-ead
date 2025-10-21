
export interface Review {
  id?: string;
  userId: string;
  university: string;
  course: string;
  graduationYear: number;
  isEAD: boolean;
  anonymous: boolean;
  createdAt: any; // Firestore timestamp
  
  // Ratings
  teachersRating: number;
  curriculumRating: number;
  infrastructureRating: number;
  supportRating: number;
  marketReputationRating: number;
  
  pros: string;
  cons: string;
  
  weightedAverage: number;
}

export interface CourseReviewSummary {
  CO_CURSO: number;
  university: string;
  course: string;
  rating: number;
  reviewCount: number;
  city: string;
  uf: string;
  isFree: boolean;
  area: string;
  degree: string;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}
