export type ReadingStatus = 'want' | 'reading' | 'read';

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  want: '想读',
  reading: '在读',
  read: '已读'
};

export type Rating = 1 | 2 | 3 | 4 | 5;

export interface Book {
  id: string;
  title: string;
  author?: string;
  description?: string;
  totalPages?: number;
  currentPage?: number;
  createdAt: number;
  status: ReadingStatus;
  rating?: Rating;
  review?: string;
}
