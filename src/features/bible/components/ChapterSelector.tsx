'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <Select
        value={selectedChapter?.toString() || ""}
        onValueChange={(value) => onSelectChapter(Number(value))}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Seleccionar capítulo" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: chapters }, (_, i) => i + 1).map((num) => (
            <SelectItem key={num} value={num.toString()}>
              {num}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChapterSelector;
