'use client';

import { VersiculoDataMap } from '@/types/bible';

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
      <select
        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400"
        value={selectedVerse || ''}
        onChange={(e) => onSelectVerse(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        disabled={disabled}
        aria-label="Seleccionar versículo"
      >
        <option value="">Seleccionar versículo</option>
        <option value="all">Todos los versículos</option>
        {verseNumbers.map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
};

export default VerseSelector;
