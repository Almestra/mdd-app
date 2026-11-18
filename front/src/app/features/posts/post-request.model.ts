export interface PostRequest {
  // null until the user chooses a topic: the form requires one before sending
  topicId: number | null;
  title: string;
  content: string;
}
