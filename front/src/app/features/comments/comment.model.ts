export interface Comment {
  id: number;
  content: string;
  // An ISO 8601 date in UTC, such as 2026-11-13T10:42:00Z
  createdAt: string;
  // The username of the author
  author: string;
}
