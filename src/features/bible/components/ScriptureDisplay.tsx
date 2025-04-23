'use client';

import { BibleDataType, VersiculoType } from '@/types/bible';
import { antiguoTestamento } from '@/lib/api/bibleData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    if (!versiculo || !versiculo.palabras || !versiculo.palabras.length) {
      return (
        <div className="verse" key={`empty-${versiculoNum}`}>
          <span className="verse-number">{versiculoNum}</span>
          <div className="interlinear-line">
            <em>No hay datos disponibles para este versículo</em>
          </div>
        </div>
      );
    }
    const palabras = [...versiculo.palabras];

    // Renderizar texto hebreo continuo (sin espacios entre palabras)
    // const textoHebreo = palabras.map(p => p.original).join('');

    return (
      <div
        className="verse mb-4 pb-2 border-b border-gray-100 dark:border-gray-800"
        key={versiculoNum}
        dir="rtl" // <-- Añadir dir="rtl" aquí para que el número vaya a la derecha
      >
        <div className="flex justify-start items-start w-full">
          <span className="verse-number font-bold ml-0 mr-2 order-first">{versiculoNum}</span>
          <div
            className="interlinear-line flex flex-wrap gap-3 flex-1" // <-- Quitar justify-end
            dir="rtl"
          >
            {palabras.map((palabra, i) => (
              <div
                className="word-group flex flex-col items-center mb-2 min-w-[100px]" // <-- Añadir min-w-[100px]
                key={i}
              >
                <div className="text-xs text-muted-foreground mb-1">{palabra.strong}</div>
                <div
                  className={`original text-2xl font-hebrew text-primary`} // <-- Cambiar text-lg a text-2xl
                  title={palabra.parsing ? palabra.parsing : undefined}
                >
                  {palabra.original}
                </div>
                <div className="translation text-sm text-secondary-foreground max-w-[100px]">
                  {palabra.traduccion}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Si está cargando, mostrar indicador
  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-center italic text-muted-foreground">Cargando texto bíblico...</p>
        </CardContent>
      </Card>
    );
  }

  // Si no hay selección, mostrar mensaje inicial
  if (!bookId) {
    return (
      <Card>
        <CardContent>
          <p>Selecciona un libro, capítulo y versículo para comenzar.</p>
        </CardContent>
      </Card>
    );
  }

  // Si no hay datos del libro seleccionado
  if (!bibleData[bookId]) {
    return (
      <Card>
        <CardContent>
          <p>Cargando datos del libro...</p>
        </CardContent>
      </Card>
    );
  }

  // Si no hay capítulo seleccionado
  if (!chapterNum) {
    return (
      <Card>
        <CardContent>
          <p>Selecciona un capítulo para continuar.</p>
        </CardContent>
      </Card>
    );
  }

  // Si el capítulo no existe en los datos
  if (!bibleData[bookId][chapterNum]) {
    return (
      <Card>
        <CardContent>
          <p>No se encontraron datos para este capítulo.</p>
        </CardContent>
      </Card>
    );
  }

  // Si solo hay capítulo seleccionado pero no versículo, mostrar mensaje
  if (!verseNum) {
    return (
      <Card>
        <CardContent>
          <p>Selecciona un versículo para continuar.</p>
        </CardContent>
      </Card>
    );
  }

  // Solo mostrar todo el capítulo cuando específicamente se seleccione "all"
  if (verseNum === 'all') {
    const capitulo = bibleData[bookId][chapterNum];
    const versiculos = Object.keys(capitulo).map(Number).sort((a, b) => a - b);

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{getLibroNombre(bookId)} {chapterNum}</CardTitle>
        </CardHeader>
        <CardContent>
          {versiculos.map(num => renderVersiculo(capitulo[num], num))}
        </CardContent>
      </Card>
    );
  }

  // Renderizar un versículo específico
  if (typeof verseNum === 'number' && bibleData[bookId][chapterNum][verseNum]) {
    const versiculo = bibleData[bookId][chapterNum][verseNum];
    const textoVersiculo = versiculo.textoCompleto || "Traducción no disponible.";

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{getLibroNombre(bookId)} {chapterNum}:{verseNum}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderVersiculo(versiculo, verseNum)}
          <Card className="mt-4 bg-accent/50">
            <CardContent className="py-3">
              <p>{textoVersiculo}</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    );
  }

  // Si el versículo no existe
  return (
    <Card>
      <CardContent>
        <p>No se encontró este versículo.</p>
      </CardContent>
    </Card>
  );
};

export default ScriptureDisplay;
