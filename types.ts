
export interface Ratings {
  courseQuality: number;
  professorQuality: number;
  studySupport: number;
  onSiteSupport: number;
  didacticMaterial: number;
}

export interface Review extends Ratings {
  id: string;
  fullName: string;
  academicRegistry: string;
  university: string;
  course: string;
  campus: string;
  region: string;
  comment?: string;
  createdAt: Date;
}

export interface Course {
  university: string;
  course: string;
  averageRating: number;
  reviewCount: number;
  area: string;
  grau: string;
  reviews: Review[];
}
