'use client';

import { useState, useEffect } from 'react';
import BookSelector from './BookSelector';
import ChapterSelector from './ChapterSelector';
import VerseSelector from './VerseSelector';
import ScriptureDisplay from './ScriptureDisplay';
import { useBibleData } from '@/hooks/useBibleData';
import { antiguoTestamento } from '@/lib/api/bibleData';

const BibleApp = () => {
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const { bibleData, loadBookData } = useBibleData();

  useEffect(() => {
    if (selectedBook) {
      setLoading(true);
      loadBookData(selectedBook).finally(() => {
        setLoading(false);
      });
    }
  }, [selectedBook, loadBookData]);

  const handleBookChange = (bookId: string) => {
    setSelectedBook(bookId);
    setSelectedChapter(null);
    setSelectedVerse(null);
  };
  const handleChapterChange = (chapter: number) => {
    setSelectedChapter(chapter);
    setSelectedVerse(null); // No mostrar nada al seleccionar un capítulo
  };

  const handleVerseChange = (verse: number | string) => {
    setSelectedVerse(verse);
  };

  // Obtenemos el libro seleccionado para mostrar su número de capítulos
  const selectedBookData = selectedBook
    ? antiguoTestamento.find(book => book.id === selectedBook)
    : null;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <BookSelector
          books={antiguoTestamento}
          selectedBook={selectedBook}
          onSelectBook={handleBookChange}
        />

        <ChapterSelector
          chapters={selectedBookData?.capitulos || 0}
          selectedChapter={selectedChapter}
          onSelectChapter={handleChapterChange}
          disabled={!selectedBook}
        />

        <VerseSelector
          versesData={selectedBook && selectedChapter ? bibleData[selectedBook]?.[selectedChapter] : null}
          selectedVerse={selectedVerse}
          onSelectVerse={handleVerseChange}
          disabled={!selectedChapter}
        />
      </div>

      <ScriptureDisplay
        bookId={selectedBook}
        chapterNum={selectedChapter}
        verseNum={selectedVerse}
        bibleData={bibleData}
        loading={loading}
      />
    </div>
  );
};

export default BibleApp;
