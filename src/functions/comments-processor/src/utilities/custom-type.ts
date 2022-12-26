export type ImageType = {
  png: string;
};

export type UserType = {
  image?: ImageType;
  username?: string;
  currentUser?: string;
};

export type CommentType = {
  id: number;
  content: string;
  createdAt: string;
  score: number;
  user: UserType;
  username?: string;
  replyingTo?: string;
  currentUser?: boolean;
};

export type CommentGroupType = {
  id: number;
  content: string;
  createdAt: string;
  score: number;
  user: UserType;
  username?: string;
  currentUser?: boolean;
  replies?: Array<CommentType>;
};
