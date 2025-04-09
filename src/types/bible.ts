// Tipos relacionados con la Biblia y el texto interlineal

export interface LibroType {
  nombre: string;
  id: string;
  capitulos: number;
}

export interface PalabraType {
  original: string;
  traduccion: string;
  idioma?: string; // Indica el idioma de la palabra (opcional)
  strong?: string; // Código Strong para referencias léxicas (opcional)
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
