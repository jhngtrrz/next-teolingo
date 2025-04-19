'use client';

import { useState, useCallback } from 'react';
import { BibleDataType, CapituloDataMap, PalabraData } from '@/types/bible';

// Estructura para datos en español antes de fusionar (para XML)
interface SpanishWord {
  traduccion: string;
  strong?: string;
}
interface SpanishVerseData {
  [verseNum: number]: SpanishWord[];
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

  // Modificada para extraer también la traducción española del JSON
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

        const palabras: PalabraData[] = verseData.words
          .filter(word => word.hebrew) // Asegurarse de que hay palabra hebrea
          .map(word => ({
            original: word.hebrew || '',
            // Extraer la traducción directamente del campo 'spanish' del JSON
            traduccion: word.spanish || '[sin trad.]',
            strong: word.strong, // Strong viene del JSON
            parsing: word.parsing // Parsing viene del JSON
          }));

        resultado[capNum][verseNum].palabras.push(...palabras);
      });
    } catch (error) {
      console.error("Error procesando JSON Hebreo (Génesis):", error);
    }
    return resultado;
  }, []);


  // Función para procesar el XML Español (USFX - para otros libros)
  const procesarEspanolXML = useCallback((xmlDoc: Document, bookId: string): SpanishChapterData => {
    const resultado: SpanishChapterData = {};
    try {
      // Encuentra el libro específico usando el ID (insensible a mayúsculas/minúsculas para robustez)
      const bookElement = xmlDoc.querySelector(`book[id="${bookId.toUpperCase()}"]`) || xmlDoc.querySelector(`book[id="${bookId.toLowerCase()}"]`);

      // Si no se encuentra el libro, busca en todo el documento (puede ser un archivo de un solo libro)
      const rootElement = bookElement || xmlDoc;

      const capitulos = rootElement.querySelectorAll('c'); // Busca capítulos
      if (capitulos.length === 0) {
        console.warn(`No se encontraron capítulos ('c') para el libro ${bookId} en el XML español.`);
      }

      // En lugar de iterar por capítulos <c>, procesaremos todos los versículos <v> del libro
      // y los agruparemos por capítulo usando el atributo 'bcv' o 'id'.
      const allVerses = rootElement.querySelectorAll('v');
      allVerses.forEach(versiculo => {
        const verseIdAttr = versiculo.getAttribute('id'); // Número de versículo
        const bcvAttr = versiculo.getAttribute('bcv'); // Formato LIB.CAP.VER

        let capNum: number | null = null;
        let verseNum: number | null = null;

        if (bcvAttr) {
          const parts = bcvAttr.split('.');
          if (parts.length === 3 && parts[0].toUpperCase() === bookId.toUpperCase()) {
            capNum = parseInt(parts[1]);
            verseNum = parseInt(parts[2]);
          }
        } else if (verseIdAttr) {
          // Fallback si no hay bcv: intentar inferir capítulo basado en el último <c> encontrado
          // Esto es menos fiable. Por ahora, nos centramos en bcv.
          console.warn(`Versículo sin atributo 'bcv', usando 'id': ${verseIdAttr}. La asignación de capítulo puede ser incorrecta.`);
          // Podríamos intentar encontrar el <c> precedente, pero es propenso a errores.
          // Por ahora, solo procesaremos versículos con 'bcv' claro.
          return;
        }

        if (capNum === null || verseNum === null) return; // Saltar si no pudimos determinar cap/ver

        // Asegurarse de que el capítulo exista en el resultado
        if (!resultado[capNum]) {
          resultado[capNum] = {};
        }

        const palabrasTemp: SpanishWord[] = [];
        const parentElement = versiculo.parentElement; // e.g., a <p> tag

        if (parentElement) {
          let currentNode = versiculo.nextSibling; // Start after the <v> tag

          while (currentNode && currentNode.parentElement === parentElement) {
            // Stop if we hit the next verse marker within the same parent
            if (currentNode.nodeName === 'v') {
              break;
            }

            // Process <w> elements directly or nested within other elements
            if (currentNode.nodeType === Node.ELEMENT_NODE) {
              const element = currentNode as Element;
              // Find all <w> descendants of the current sibling node
              const wordsInNode = element.querySelectorAll('w');
              if (element.nodeName === 'w') {
                // If the node itself is 'w'
                const traduccion = element.textContent?.trim() || '';
                const strong = element.getAttribute('s') || undefined;
                if (traduccion) {
                  palabrasTemp.push({ traduccion, strong });
                }
              } else if (wordsInNode.length > 0) {
                // If <w> are nested within this node
                wordsInNode.forEach(word => {
                  const traduccion = word.textContent?.trim() || '';
                  const strong = word.getAttribute('s') || undefined;
                  if (traduccion) {
                    palabrasTemp.push({ traduccion, strong });
                  }
                });
              }
              // Optional: Handle plain text nodes if needed
              // else if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent?.trim()) {
              //    console.log("Plain text node:", currentNode.textContent.trim());
              // }
            }
            currentNode = currentNode.nextSibling;
          }
        } else {
          console.warn(`Verse ${bookId} ${capNum}:${verseNum} has no parent element? Skipping word extraction.`);
        }

        // Añadir las palabras encontradas para este versículo
        if (palabrasTemp.length > 0) {
          resultado[capNum][verseNum] = [...(resultado[capNum][verseNum] || []), ...palabrasTemp];
          // *** DEBUG LOGGING START ***
          if (bookId === 'Genesis' && capNum === 1 && verseNum === 1) {
            console.log(`[procesarEspanolXML] Extracted Spanish for ${bookId} ${capNum}:${verseNum}:`, palabrasTemp.map(p => `${p.traduccion}(${p.strong || '-'})`));
          }
          // *** DEBUG LOGGING END ***
        }
      });
    } catch (error) {
      console.error("Error procesando XML Español (USFX):", error);
    }
    // console.log("Datos Español Procesados:", resultado); // Para depuración
    return resultado;
  }, []);

  // Función para cargar y fusionar datos de un libro
  const loadBookData = useCallback(async (libroId: string) => {
    // Si ya tenemos los datos cargados (verificar si tienen traducción)
    if (bibleData[libroId] && Object.keys(bibleData[libroId]).length > 0) {
      const firstChapterKey = Object.keys(bibleData[libroId])[0];
      if (firstChapterKey) {
        const firstVerseKey = Object.keys(bibleData[libroId][parseInt(firstChapterKey)])[0];
        // Check if the first word has a translation (or the placeholder)
        if (firstVerseKey && bibleData[libroId][parseInt(firstChapterKey)][parseInt(firstVerseKey)].palabras[0]?.traduccion !== '') {
          console.log(`Datos para ${libroId} ya cargados.`);
          return bibleData[libroId];
        }
      }
    }

    try {
      console.log(`Cargando datos para ${libroId}...`);
      let finalBookData: CapituloDataMap; // Variable para almacenar el resultado final

      // Cargar datos (JSON para Génesis, XML para otros)
      if (libroId === 'Genesis') {
        console.log("Cargando datos JSON para Génesis...");
        const hebrewJsonResponse = await fetch(`/data/bible/genesis.json`);
        if (!hebrewJsonResponse.ok) throw new Error(`Error cargando Hebreo JSON: ${hebrewJsonResponse.status}`);
        const hebrewJson = await hebrewJsonResponse.json();
        // Procesar JSON que ahora incluye hebreo, strong y español
        finalBookData = procesarHebreoJSON(hebrewJson);
        console.log("Datos Completos (JSON) procesados para Génesis.");

        // *** NO SE NECESITA CARGAR NI FUSIONAR XML ESPAÑOL PARA GÉNESIS ***

      } else {
        // Lógica para otros libros (usando XML Hebreo y Español)
        console.log(`Cargando datos XML para ${libroId}.`);
        const parser = new DOMParser();

        // Cargar XML Hebreo
        const hebrewXmlFile = `${libroId}.xml`;
        const hebrewResponse = await fetch(`/data/bible/hebrew/${hebrewXmlFile}`);
        if (!hebrewResponse.ok) throw new Error(`Error cargando Hebreo XML: ${hebrewResponse.status}`);
        const hebrewData = await hebrewResponse.text();
        const hebrewXmlDoc = parser.parseFromString(hebrewData, "text/xml");
        const hebrewBookData = procesarHebreoXML(hebrewXmlDoc); // Solo hebreo y strong undefined
        console.log(`Datos Hebreos (XML) procesados para ${libroId}.`);

        // Cargar XML Español
        const spanishXmlFile = 'spavbl_usfx.xml';
        const spanishResponse = await fetch(`/data/bible/${spanishXmlFile}`);
        if (!spanishResponse.ok) throw new Error(`Error cargando Español XML: ${spanishResponse.status}`);
        const spanishData = await spanishResponse.text();
        const spanishXmlDoc = parser.parseFromString(spanishData, "text/xml");
        const spanishBookData = procesarEspanolXML(spanishXmlDoc, libroId); // Solo español y strong
        console.log(`Datos Españoles (XML) procesados para ${libroId}.`);

        // Fusionar datos XML
        finalBookData = {}; // Inicializar para este libro
        Object.keys(hebrewBookData).forEach(capNumStr => {
          const capNum = parseInt(capNumStr);
          finalBookData[capNum] = {};
          Object.keys(hebrewBookData[capNum]).forEach(verseNumStr => {
            const verseNum = parseInt(verseNumStr);
            const hebrewWords = hebrewBookData[capNum][verseNum].palabras; // original, strong=undefined
            const spanishWords = spanishBookData[capNum]?.[verseNum] || []; // traduccion, strong
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
                // Opcional: añadir strongs extra si es necesario
                // if (spanishWords[i].strong) extraSpanishText += ` (${spanishWords[i].strong})`;
              }
              lastMergedWord.traduccion += ` ${extraSpanishText.trim()}`;
            }
            finalBookData[capNum][verseNum] = { palabras: mergedPalabras };
          });
        });
        console.log(`Datos XML fusionados para ${libroId}.`);
      } // Fin del else (libros != Genesis)

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
  }, [bibleData, procesarHebreoXML, procesarEspanolXML, procesarHebreoJSON]); // Dependencias actualizadas

  return {
    bibleData,
    loadBookData
  };
};
