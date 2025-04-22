// Tipos relacionados con la Biblia y el texto interlineal

export interface LibroType {
  nombre: string;
  id: string;
  capitulos: number;
}

export interface PalabraType {
  parsing?: string;
  original: string;
  traduccion: string;
  idioma?: string; // Indica el idioma de la palabra (opcional)
  strong?: string; // Código Strong para referencias léxicas (opcional)
}

export interface PalabraData {
  original: string;
  traduccion: string;
  strong?: string; // Añadir campo opcional para número Strong
}

export interface VersiculoType {
  palabras: PalabraType[];
  textoCompleto?: string; // Texto completo del versículo en español
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
