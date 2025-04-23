'use client';

import { LibroType } from '@/types/bible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookSelectorProps {
  books: LibroType[];
  selectedBook: string;
  onSelectBook: (bookId: string) => void;
}

const BookSelector = ({ books, selectedBook, onSelectBook }: BookSelectorProps) => {
  return (
    <div className="w-full sm:w-1/3">
      <Select value={selectedBook} onValueChange={onSelectBook}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar libro" />
        </SelectTrigger>
        <SelectContent>
          {books.map((book) => (
            <SelectItem key={book.id} value={book.id}>
              {book.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BookSelector;
