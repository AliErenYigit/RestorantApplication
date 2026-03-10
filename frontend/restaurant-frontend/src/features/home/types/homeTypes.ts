export type SiteContent = {
  key: string;
  title: string;
  body: string;
  imageUrl?: string | null;
  updatedAt: string;
};

export type TeamMember = {
  id: number;
  fullName: string;
  role: string;
  bio?: string | null;
  imageUrl?: string | null;
  sortOrder: number;
};

export type CommentItem = {
  id: number;
  firstName: string;
  lastName: string;
  message: string;
  createdAt: string;
  isApproved?: boolean;
};

export type CreateCommentRequest = {
  firstName: string;
  lastName: string;
  message: string;
};