export interface PostFile {
  filename: string;
  originalFilename: string;
  mimetype: string;
  size: number;
  sizeString: string;
  hash: string;
  hasThumb: boolean;
  thumbextension?: string;
  geometry: {
    width: number;
    height: number;
    thumbwidth?: number;
    thumbheight?: number;
  };
  geometryString?: string;
  durationString?: string;
  spoiler: boolean;
  attachment: boolean;
  phash?: string;
}

export interface Post {
  _id: string;
  board: string;
  postId: number;
  thread: number | null;
  userId?: string;
  name: string;
  tripcode?: string;
  capcode?: string;
  subject?: string;
  email?: string;
  message?: string;
  nomarkup?: string;
  date: string;
  edited?: {
    date: string;
    username?: string;
  };
  country?: {
    code: string;
    name: string;
  };
  files: PostFile[];
  spoiler: boolean;
  banmessage?: string;
  reports?: any[];
  globalreports?: any[];
  ip?: {
    raw?: string;
    cloak?: string;
  };
  sticky?: boolean;
  locked?: boolean;
  cyclic?: boolean;
  saged?: boolean;
  replyposts?: number;
  replyfiles?: number;
  omittedposts?: number;
  omittedfiles?: number;
  replies?: Post[];
  backlinks?: Array<{ postId: number }>;
  previewbacklinks?: Array<{ postId: number }>;
  signature?: string;
  address?: string;
  bumped?: string;
}
