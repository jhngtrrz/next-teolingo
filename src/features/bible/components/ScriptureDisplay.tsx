'use client';

import { LibroType, BibleDataType, VersiculoType } from '@/types/bible';
import { antiguoTestamento } from '@/lib/api/bibleData';

interface ScriptureDisplayProps {
  bookId: string;
  chapterNum: number | null;
  verseNum: number | string | null;
  bibleData: BibleDataType;
  loading: boolean;
}

const ScriptureDisplay = ({ 
  bookId, 
  chapterNum, 
  verseNum, 
  bibleData, 
  loading 
}: ScriptureDisplayProps) => {
  
  // Obtener el nombre del libro
  const getLibroNombre = (id: string): string => {
    const libro = antiguoTestamento.find(l => l.id === id);
    return libro ? libro.nombre : id;
  };
  
  // Renderizar un versículo en formato interlineal
  const renderVersiculo = (versiculo: VersiculoType, versiculoNum: number) => {
    if (!versiculo || !versiculo.palabras || versiculo.palabras.length === 0) {
      return (
        <div className="verse" key={`empty-${versiculoNum}`}>
          <span className="verse-number">{versiculoNum}</span>
          <div className="interlinear-line">
            <em>No hay datos disponibles para este versículo</em>
          </div>
        </div>
      );
    }
    
    return (
      <div className="verse mb-4 pb-2 border-b border-gray-100 dark:border-gray-800" key={versiculoNum}>
        <span className="verse-number font-bold mr-2">{versiculoNum}</span>
        <div className="interlinear-line flex flex-wrap gap-3">
          {versiculo.palabras.map((palabra, i) => (
            <div className="word-group flex flex-col items-center mb-2" key={i}>
              <div className="original font-hebrew text-lg" dir="rtl">{palabra.original}</div>
              <div className="translation text-xs text-gray-600 dark:text-gray-400">{palabra.traduccion}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Si está cargando, mostrar indicador
  if (loading) {
    return <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md"><p className="text-center italic text-gray-600">Cargando texto bíblico...</p></div>;
  }
  
  // Si no hay selección, mostrar mensaje inicial
  if (!bookId) {
    return <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md"><p>Selecciona un libro, capítulo y versículo para comenzar.</p></div>;
  }
  
  // Si no hay datos del libro seleccionado
  if (!bibleData[bookId]) {
    return <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md"><p>Cargando datos del libro...</p></div>;
  }
  
  // Si no hay capítulo seleccionado
  if (!chapterNum) {
    return <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md"><p>Selecciona un capítulo para continuar.</p></div>;
  }
  
  // Si el capítulo no existe en los datos
  if (!bibleData[bookId][chapterNum]) {
    return <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md"><p>No se encontraron datos para este capítulo.</p></div>;
  }
  
  // Renderizar todo el capítulo
  if (verseNum === 'all' || !verseNum) {
    const capitulo = bibleData[bookId][chapterNum];
    const versiculos = Object.keys(capitulo).map(Number).sort((a, b) => a - b);
    
    return (
      <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md">
        <h2 className="text-xl font-bold mb-4">{getLibroNombre(bookId)} {chapterNum}</h2>
        {versiculos.map(num => renderVersiculo(capitulo[num], num))}
      </div>
    );
  }
  
  // Renderizar un versículo específico
  if (typeof verseNum === 'number' && bibleData[bookId][chapterNum][verseNum]) {
    const versiculo = bibleData[bookId][chapterNum][verseNum];
    
    return (
      <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md">
        <h2 className="text-xl font-bold mb-4">{getLibroNombre(bookId)} {chapterNum}:{verseNum}</h2>
        {renderVersiculo(versiculo, verseNum)}
      </div>
    );
  }
  
  // Si el versículo no existe
  return <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-md"><p>No se encontró este versículo.</p></div>;
};

export default ScriptureDisplay;
