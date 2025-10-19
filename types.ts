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
  university: string;
  course: string;
  rating: number;
  reviewCount: number;
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  googleSignIn: () => Promise<any>;
}
