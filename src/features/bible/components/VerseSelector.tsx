'use client';

import { VersiculoDataMap } from '@/types/bible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VerseSelectorProps {
  versesData: VersiculoDataMap | null;
  selectedVerse: number | string | null;
  onSelectVerse: (verse: number | string) => void;
  disabled: boolean;
}

const VerseSelector = ({
  versesData,
  selectedVerse,
  onSelectVerse,
  disabled
}: VerseSelectorProps) => {
  const verseNumbers = versesData
    ? Object.keys(versesData).map(Number).sort((a, b) => a - b)
    : [];

  return (
    <div className="w-full sm:w-1/3">
      <Select
        value={selectedVerse?.toString() || ""}
        onValueChange={(value) => onSelectVerse(value === 'all' ? 'all' : Number(value))}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar versículo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los versículos</SelectItem>
          {verseNumbers.map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VerseSelector;
