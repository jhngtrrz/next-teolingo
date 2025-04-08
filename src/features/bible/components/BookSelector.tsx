'use client';

import { LibroType } from '@/types/bible';

interface BookSelectorProps {
  books: LibroType[];
  selectedBook: string;
  onSelectBook: (bookId: string) => void;
}

const BookSelector = ({ books, selectedBook, onSelectBook }: BookSelectorProps) => {
  return (
    <div className="w-full sm:w-1/3">
      <select
        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700"
        value={selectedBook}
        onChange={(e) => onSelectBook(e.target.value)}
        aria-label="Seleccionar libro"
      >
        <option value="">Seleccionar libro</option>
        {books.map((book) => (
          <option key={book.id} value={book.id}>
            {book.nombre}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BookSelector;
