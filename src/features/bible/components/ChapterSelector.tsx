'use client';

interface ChapterSelectorProps {
  chapters: number;
  selectedChapter: number | null;
  onSelectChapter: (chapter: number) => void;
  disabled: boolean;
}

const ChapterSelector = ({ 
  chapters, 
  selectedChapter, 
  onSelectChapter, 
  disabled 
}: ChapterSelectorProps) => {
  return (
    <div className="w-full sm:w-1/3">
      <select
        className="w-full p-2 border border-gray-300 rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:text-gray-400"
        value={selectedChapter || ''}
        onChange={(e) => onSelectChapter(Number(e.target.value))}
        disabled={disabled}
        aria-label="Seleccionar capítulo"
      >
        <option value="">Seleccionar capítulo</option>
        {Array.from({ length: chapters }, (_, i) => i + 1).map((num) => (
          <option key={num} value={num}>
            {num}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ChapterSelector;
