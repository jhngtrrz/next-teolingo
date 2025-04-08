// Tipos relacionados con la Biblia y el texto interlineal

export interface LibroType {
  nombre: string;
  id: string;
  capitulos: number;
}

export interface PalabraType {
  original: string;
  traduccion: string;
}

export interface VersiculoType {
  palabras: PalabraType[];
}

export interface VersiculoDataMap {
  [verseNumber: number]: VersiculoType;
}

export interface CapituloDataMap {
  [chapterNumber: number]: VersiculoDataMap;
}

export interface BibleDataType {
  [bookId: string]: CapituloDataMap;
}
