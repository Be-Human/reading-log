import type { Book } from '../types/book';

const STORAGE_KEY = 'reading-log-books';

export const saveBooks = (books: Book[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
};

export const loadBooks = (): Book[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Book[];
    } catch {
      return [];
    }
  }
  return [];
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};
