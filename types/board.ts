export interface BoardSettings {
  name: string;
  description?: string;
  defaultName: string;
  forceAnon: boolean;
  sageOnlyEmail: boolean;
  forceThreadSubject: boolean;
  forceThreadMessage: boolean;
  forceReplyMessage: boolean;
  forceThreadFile: boolean;
  forceReplyFile: boolean;
  minThreadMessageLength: number;
  maxThreadMessageLength: number;
  minReplyMessageLength: number;
  maxReplyMessageLength: number;
  maxFiles: number;
  allowedFileTypes: {
    image: boolean;
    video: boolean;
    audio: boolean;
    other: boolean;
  };
  userPostSpoiler: boolean;
  userPostDelete: boolean;
  userPostUnlink: boolean;
  customFlags: boolean;
  geoFlags: boolean;
  enableTegaki: boolean;
  enableWeb3: boolean;
  captchaMode: number;
  replyLimit: number;
  theme: string;
  codeTheme: string;
  language: string;
  tags?: string[];
  customCss?: string;
  unlistedLocal: boolean;
  ids: boolean;
  reverseImageSearchLinks: boolean;
}

export interface Board {
  _id: string;
  owner: string;
  settings: BoardSettings;
  flags: Record<string, string>;
  banners: string[];
  staff: Record<string, any>;
  lastPostTimestamp?: Date;
}
