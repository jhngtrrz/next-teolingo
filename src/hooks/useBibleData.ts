'use client';

import { useState, useCallback } from 'react';
import { BibleDataType, CapituloDataMap, PalabraData } from '@/types/bible';

// Estructura para datos en español antes de fusionar (para XML)
interface SpanishWord {
  traduccion: string;
  strong?: string;
}
// *** Modificado para incluir texto completo ***
interface SpanishVerseDetail {
  words: SpanishWord[];
  fullText: string;
}
interface SpanishVerseData {
  [verseNum: number]: SpanishVerseDetail; // Cambiado de SpanishWord[]
}
interface SpanishChapterData {
  [capNum: number]: SpanishVerseData;
}

// Estructura del JSON de Génesis
interface GenesisJsonWord {
  hebrew?: string;
  parsing?: string;
  strong?: string;
  spanish?: string; // Campo de traducción en español
}
interface GenesisJsonVerse {
  chapter: number;
  verse: number;
  words: GenesisJsonWord[];
}

export const useBibleData = () => {
  const [bibleData, setBibleData] = useState<BibleDataType>({});

  // Función para procesar el XML Hebreo (formato original - para otros libros)
  const procesarHebreoXML = useCallback((xmlDoc: Document): CapituloDataMap => {
    const resultado: CapituloDataMap = {};
    try {
      const capitulos = xmlDoc.querySelectorAll('c');
      capitulos.forEach(capitulo => {
        const capNum = parseInt(capitulo.getAttribute('n') || '1');
        resultado[capNum] = {};
        const versiculos = capitulo.querySelectorAll('v');
        versiculos.forEach(versiculo => {
          const verseNum = parseInt(versiculo.getAttribute('n') || '1');
          const palabras: PalabraData[] = [];
          const words = versiculo.querySelectorAll('w');
          words.forEach(word => {
            const original = word.textContent?.trim() || '';
            // Inicializar traducción y strong, se llenarán después
            palabras.push({ original, traduccion: '', strong: undefined });
          });
          resultado[capNum][verseNum] = { palabras };
        });
      });
    } catch (error) {
      console.error("Error procesando XML Hebreo:", error);
    }
    return resultado;
  }, []);

  // Modificada para verificar si verseData.words es un array
  const procesarHebreoJSON = useCallback((jsonData: GenesisJsonVerse[]): CapituloDataMap => {
    const resultado: CapituloDataMap = {};
    try {
      jsonData.forEach(verseData => {
        const capNum = verseData.chapter;
        const verseNum = verseData.verse;

        if (!resultado[capNum]) {
          resultado[capNum] = {};
        }
        if (!resultado[capNum][verseNum]) {
          resultado[capNum][verseNum] = { palabras: [] };
        }

        // *** Añadir verificación Array.isArray ***
        if (Array.isArray(verseData.words)) {
          const palabras: PalabraData[] = verseData.words
            .filter(word => word.hebrew) // Asegurarse de que hay palabra hebrea
            .map(word => ({
              original: word.hebrew || '',
              traduccion: word.spanish || '[sin trad.]',
              strong: word.strong,
              parsing: word.parsing
            }));

          resultado[capNum][verseNum].palabras.push(...palabras);
        } else {
          // Opcional: Registrar una advertencia si words no es un array
          console.warn(`Datos inválidos para ${capNum}:${verseNum} en JSON: 'words' no es un array.`, verseData);
          // Asegurarse de que el versículo exista incluso si no tiene palabras válidas
          if (!resultado[capNum][verseNum]) {
            resultado[capNum][verseNum] = { palabras: [] };
          }
        }
      });
    } catch (error) {
      // Registrar el error específico que ocurrió durante el procesamiento
      console.error("Error procesando JSON Hebreo:", error);
    }
    return resultado;
  }, []);


  // Función para procesar el XML Español (USFX)
  const procesarEspanolXML = useCallback((xmlDoc: Document, bookId: string): SpanishChapterData => {
    const resultado: SpanishChapterData = {};
    try {
      // Mapear IDs de libros en inglés a sus equivalentes en el XML español
      const bookIdMap: { [key: string]: string } = {
        'Genesis': 'GEN',
        'Exodus': 'EXO',
        'Leviticus': 'LEV'
        // Añadir más mapeos según sea necesario
      };

      // Usar el ID mapeado o el original si no hay mapeo
      const xmlBookId = bookIdMap[bookId] || bookId.toUpperCase();
      console.log(`Buscando libro con ID "${xmlBookId}" en el XML español`);

      // Función para extraer el texto de un versículo
      const extraerTextoVersiculo = (verseElement: Element): string => {
        let texto = '';
        let currentNode: Node | null = verseElement.nextSibling;

        // Buscar la etiqueta <ve> o el siguiente <v> que marque el fin del versículo
        while (currentNode) {
          if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const element = currentNode as Element;
            const nodeName = element.nodeName.toUpperCase();

            // Si encontramos una etiqueta VE o V, terminamos la extracción
            if (nodeName === 'VE') {
              console.log('Encontrada etiqueta VE - fin de versículo');
              break;
            }

            if (nodeName === 'V') {
              console.log('Encontrado siguiente elemento V - fin de versículo anterior');
              break;
            }

            // Ignorar notas al pie
            if (nodeName === 'F') {
              currentNode = currentNode.nextSibling;
              continue;
            }

            // Si es una palabra o elemento de texto, añadirlo
            if (nodeName === 'W') {
              texto += element.textContent?.trim() + ' ';
            } else {
              // Para otros elementos, incluir su contenido
              texto += element.textContent?.trim() + ' ';
            }
          }
          // Nodos de texto directos
          else if (currentNode.nodeType === Node.TEXT_NODE) {
            const textoNodo = currentNode.textContent?.trim();
            if (textoNodo && textoNodo.length > 0) {
              texto += textoNodo + ' ';
            }
          }

          currentNode = currentNode.nextSibling;
        }

        return texto.replace(/\s+/g, ' ').trim();
      };

      // Extraer palabras con sus strongs
      const extraerPalabrasVersiculo = (verseElement: Element): SpanishWord[] => {
        const palabras: SpanishWord[] = [];
        let currentNode: Node | null = verseElement.nextSibling;

        while (currentNode) {
          if (currentNode.nodeType === Node.ELEMENT_NODE) {
            const element = currentNode as Element;
            const nodeName = element.nodeName.toUpperCase();

            // Detectar fin de versículo
            if (nodeName === 'VE' || nodeName === 'V') {
              break;
            }

            // Extraer palabras con strong
            if (nodeName === 'W') {
              const traduccion = element.textContent?.trim() || '';
              const strong = element.getAttribute('s') || undefined;
              palabras.push({ traduccion, strong });
            }
          }

          currentNode = currentNode.nextSibling;
        }

        return palabras;
      };

      // Encontrar todos los versículos del libro específico
      const allVerses = Array.from(xmlDoc.querySelectorAll('v'))
        .filter(v => {
          const bcvAttr = v.getAttribute('bcv');
          return bcvAttr && bcvAttr.startsWith(`${xmlBookId}.`);
        });

      console.log(`Encontrados ${allVerses.length} versículos para ${bookId} (ID: ${xmlBookId}) en el XML español`);

      // Procesar cada versículo
      allVerses.forEach(versiculo => {
        const bcvAttr = versiculo.getAttribute('bcv');
        if (!bcvAttr) return;

        const parts = bcvAttr.split('.');
        if (parts.length !== 3) return;

        const capNum = parseInt(parts[1]);
        const verseNum = parseInt(parts[2]);

        if (!resultado[capNum]) {
          resultado[capNum] = {};
        }

        // Extraer texto completo y palabras
        const textoCompleto = extraerTextoVersiculo(versiculo);
        const palabras = extraerPalabrasVersiculo(versiculo);

        resultado[capNum][verseNum] = {
          fullText: textoCompleto,
          words: palabras
        };

        // Log para depuración
        if (bookId === 'Genesis' && capNum === 1 && verseNum <= 5) {
          console.log(`[EXTRACCIÓN] ${bookId} ${capNum}:${verseNum} - Texto: "${textoCompleto}"`);
        }
      });

      // Verificar que encontramos datos
      const capitulosEncontrados = Object.keys(resultado).length;
      if (capitulosEncontrados === 0) {
        console.error(`No se encontró ningún capítulo para ${bookId} en el XML español`);
      } else {
        console.log(`Se extrajeron datos para ${capitulosEncontrados} capítulos de ${bookId}`);
        // Verificar el primer capítulo
        const primerCapitulo = Math.min(...Object.keys(resultado).map(Number));
        if (resultado[primerCapitulo]) {
          const versiculosEnPrimerCapitulo = Object.keys(resultado[primerCapitulo]).length;
          console.log(`El capítulo ${primerCapitulo} tiene ${versiculosEnPrimerCapitulo} versículos extraídos`);
        }
      }

    } catch (error) {
      console.error("Error procesando XML Español:", error);
    }

    return resultado;
  }, []);

  // Función para cargar y fusionar datos de un libro
  const loadBookData = useCallback(async (libroId: string) => {
    // Si ya tenemos los datos cargados (verificar si tienen traducción)
    if (bibleData[libroId] && Object.keys(bibleData[libroId]).length > 0) {
      const firstChapterKey = Object.keys(bibleData[libroId])[0];
      if (firstChapterKey) {
        const firstVerseKey = Object.keys(bibleData[libroId][parseInt(firstChapterKey)])[0];
        // Check if the first verse has a full text (or the placeholder)
        if (firstVerseKey && bibleData[libroId][parseInt(firstChapterKey)][parseInt(firstVerseKey)].textoCompleto && bibleData[libroId][parseInt(firstChapterKey)][parseInt(firstVerseKey)].textoCompleto !== '') {
          console.log(`Datos para ${libroId} ya cargados (con texto completo).`);
          return bibleData[libroId];
        }
      }
    }

    try {
      console.log(`Cargando datos para ${libroId}...`);
      let finalBookData: CapituloDataMap;

      // PRIMER PASO: Cargar siempre el XML Español para obtener los textos completos
      console.log(`Cargando XML Español para textos completos de ${libroId}...`);
      const parser = new DOMParser();
      const spanishXmlFile = 'spavbl_usfx.xml';
      const spanishResponse = await fetch(`/data/bible/${spanishXmlFile}`);
      if (!spanishResponse.ok) throw new Error(`Error cargando Español XML: ${spanishResponse.status}`);
      const spanishData = await spanishResponse.text();
      const spanishXmlDoc = parser.parseFromString(spanishData, "text/xml");
      const spanishBookData = procesarEspanolXML(spanishXmlDoc, libroId);
      console.log(`Datos Españoles (XML) procesados para ${libroId}.`);

      if (libroId === 'Genesis' || libroId === 'Exodus' || libroId === 'Leviticus') {
        // Determinar el nombre del archivo JSON basado en el libroId
        let jsonFileName = '';
        if (libroId === 'Genesis') jsonFileName = 'genesis.json';
        else if (libroId === 'Exodus') jsonFileName = 'exodus.json';
        else if (libroId === 'Leviticus') jsonFileName = 'leviticus.json';
        console.log(`Cargando datos JSON (${jsonFileName}) para ${libroId}...`);
        // Ajustar la ruta para que coincida con la estructura de carpetas
        const jsonResponse = await fetch(`/data/bible/${jsonFileName}`);
        if (!jsonResponse.ok) throw new Error(`Error cargando JSON (${jsonFileName}): ${jsonResponse.status}`);
        const jsonData = await jsonResponse.json();
        // Procesar JSON que incluye hebreo, strong y español
        const processedData = procesarHebreoJSON(jsonData);

        // Asignar texto completo del XML español a los datos procesados del JSON
        Object.keys(processedData).forEach(capNumStr => {
          const capNum = parseInt(capNumStr);
          Object.keys(processedData[capNum]).forEach(verseNumStr => {
            const verseNum = parseInt(verseNumStr);
            const verse = processedData[capNum][verseNum];

            // Usar el texto completo del XML si existe, de lo contrario usar el generado por palabras
            if (spanishBookData[capNum]?.[verseNum]?.fullText) {
              verse.textoCompleto = spanishBookData[capNum][verseNum].fullText;
              console.log(`Usando texto XML para ${libroId} ${capNum}:${verseNum}: "${verse.textoCompleto.substring(0, 40)}..."`);
            } else {
              // Fallback a unir traducciones si no hay texto XML
              verse.textoCompleto = verse.palabras.map(p => p.traduccion).join(' ').replace(' [sin trad.]', '').trim() || "Traducción completa no disponible en JSON.";
              console.log(`No se encontró texto XML para ${libroId} ${capNum}:${verseNum}, usando fallback.`);
            }
          });
        });

        finalBookData = processedData;
        console.log(`Datos Completos (JSON) procesados para ${libroId} con textos de XML.`);

      } else {
        // Lógica para otros libros (usando XML Hebreo y Español)
        console.log(`Cargando datos XML Hebreo para ${libroId}.`);

        // Cargar XML Hebreo
        const hebrewXmlFile = `${libroId}.xml`;
        const hebrewResponse = await fetch(`/data/bible/hebrew/${hebrewXmlFile}`);
        if (!hebrewResponse.ok) throw new Error(`Error cargando Hebreo XML: ${hebrewResponse.status}`);
        const hebrewData = await hebrewResponse.text();
        const hebrewXmlDoc = parser.parseFromString(hebrewData, "text/xml");
        const hebrewBookData = procesarHebreoXML(hebrewXmlDoc); // Solo hebreo y strong undefined

        // Fusionar datos XML
        finalBookData = {}; // Inicializar para este libro
        Object.keys(hebrewBookData).forEach(capNumStr => {
          const capNum = parseInt(capNumStr);
          finalBookData[capNum] = {};
          Object.keys(hebrewBookData[capNum]).forEach(verseNumStr => {
            const verseNum = parseInt(verseNumStr);
            const hebrewWords = hebrewBookData[capNum][verseNum].palabras; // original, strong=undefined
            // *** Acceder a los detalles del español ***
            const spanishDetails = spanishBookData[capNum]?.[verseNum];
            const spanishWords = spanishDetails?.words || [];
            const spanishFullText = spanishDetails?.fullText || "Traducción completa no disponible."; // *** Obtener texto completo ***
            const mergedPalabras: PalabraData[] = [];

            for (let index = 0; index < hebrewWords.length; index++) {
              const hebrewWord = hebrewWords[index];
              const spanishWord = spanishWords[index];
              const traduccion = spanishWord?.traduccion || '[sin trad.]';
              // Para XML, el strong viene del español (si existe)
              const strong = spanishWord?.strong;

              mergedPalabras.push({
                ...hebrewWord, // original
                traduccion: traduccion,
                strong: strong, // Strong del XML español
              });
            }
            // Manejar palabras españolas sobrantes (si aplica)
            if (spanishWords.length > hebrewWords.length && mergedPalabras.length > 0) {
              const lastMergedWord = mergedPalabras[mergedPalabras.length - 1];
              let extraSpanishText = '';
              for (let i = hebrewWords.length; i < spanishWords.length; i++) {
                extraSpanishText += ` ${spanishWords[i].traduccion}`;
              }
              lastMergedWord.traduccion += ` ${extraSpanishText.trim()}`;
            }
            // *** Asignar palabras y texto completo al resultado final ***
            finalBookData[capNum][verseNum] = {
              palabras: mergedPalabras,
              textoCompleto: spanishFullText // *** Asignar el texto completo extraído ***
            };
          });
        });
        console.log(`Datos XML fusionados para ${libroId}.`);
      } // Fin del else (libros != Genesis/Exodus)

      // Actualizar el estado con los datos (ya sea de JSON o XML fusionado)
      setBibleData(prevData => ({
        ...prevData,
        [libroId]: finalBookData
      }));

      console.log(`Datos para ${libroId} cargados y listos.`);
      return finalBookData;

    } catch (error) {
      console.error(`Error cargando datos para el libro ${libroId}:`, error);
      setBibleData(prevData => {
        const newData = { ...prevData };
        delete newData[libroId];
        return newData;
      });
      return null;
    }
  }, [bibleData, procesarHebreoXML, procesarEspanolXML, procesarHebreoJSON]);

  return {
    bibleData,
    loadBookData
  };
};
