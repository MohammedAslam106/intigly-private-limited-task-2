// src/types.ts
export type Category = 'todo' | 'inprogress' | 'review' | 'completed';

export interface Task {
  id: string;
  title: string;
  category: Category;
  start: string; // ISO date (yyyy-mm-dd)
  end: string;   // ISO date inclusive
}
