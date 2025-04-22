'use client';

import { useState, useCallback } from 'react';
import { BibleDataType, CapituloDataMap, PalabraData } from '@/types/bible';

interface SpanishWord {
  traduccion: string;
  strong?: string;
}
interface SpanishVerseDetail {
  words: SpanishWord[];
  fullText: string;
}
interface SpanishVerseData {
  [verseNum: number]: SpanishVerseDetail;
}
interface SpanishChapterData {
  [capNum: number]: SpanishVerseData;
}

interface GenesisJsonWord {
  hebrew?: string;
  parsing?: string;
  strong?: string;
  spanish?: string;
}
interface GenesisJsonVerse {
  chapter: number;
  verse: number;
  words: GenesisJsonWord[];
}

export const useBibleData = () => {
  const [bibleData, setBibleData] = useState<BibleDataType>({});

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

        if (Array.isArray(verseData.words)) {
          const palabras: PalabraData[] = verseData.words
            .filter(word => word.hebrew)
            .map(word => ({
              original: word.hebrew || '',
              traduccion: word.spanish || '[sin trad.]',
              strong: word.strong,
              parsing: word.parsing
            }));

          resultado[capNum][verseNum].palabras.push(...palabras);
        } else {
          console.warn(`Datos inválidos para ${capNum}:${verseNum} en JSON: 'words' no es un array.`, verseData);
          if (!resultado[capNum][verseNum]) {
            resultado[capNum][verseNum] = { palabras: [] };
          }
        }
      });
    } catch (error) {
      console.error("Error procesando JSON Hebreo:", error);
    }
    return resultado;
  }, []);


  const procesarEspanolXML = useCallback((xmlDoc: Document, bookId: string): SpanishChapterData => {
    const resultado: SpanishChapterData = {};
    try {
      const bookIdMap: { [key: string]: string } = {
        'Genesis': 'GEN',
        'Exodus': 'EXO',
        'Leviticus': 'LEV'
      };
      const xmlBookId = bookIdMap[bookId] || bookId.toUpperCase();
      const allVerses = Array.from(xmlDoc.querySelectorAll('v'))
        .filter(v => {
          const bcvAttr = v.getAttribute('bcv');
          return bcvAttr && bcvAttr.startsWith(`${xmlBookId}.`);
        });

      allVerses.forEach(verseElement => {
        const bcvAttr = verseElement.getAttribute('bcv');
        if (!bcvAttr) return;
        const parts = bcvAttr.split('.');
        if (parts.length !== 3) return;
        const capNum = parseInt(parts[1]);
        const verseNum = parseInt(parts[2]);

        if (!resultado[capNum]) {
          resultado[capNum] = {};
        }

        const palabras: SpanishWord[] = [];
        let textoCompletoCrudo = '';
        let currentSibling = verseElement.nextSibling;

        while (currentSibling) {
          if (currentSibling.nodeType === Node.ELEMENT_NODE) {
            const element = currentSibling as Element;
            const tagName = element.nodeName.toUpperCase();

            if (tagName === 'VE' || tagName === 'V') {
              break;
            }

            if (tagName === 'W') {
              const traduccion = element.textContent?.trim() || '';
              const strong = element.getAttribute('s') || undefined;
              palabras.push({ traduccion, strong });
              textoCompletoCrudo += element.textContent || '';
            } else if (tagName !== 'F') {
              textoCompletoCrudo += element.textContent || '';
            }

          } else if (currentSibling.nodeType === Node.TEXT_NODE) {
            textoCompletoCrudo += currentSibling.textContent || '';
          }

          currentSibling = currentSibling.nextSibling;
        }

        const textoFinal = textoCompletoCrudo.replace(/\s+/g, ' ').trim();

        resultado[capNum][verseNum] = {
          fullText: textoFinal,
          words: palabras
        };

      });

      const capitulosEncontrados = Object.keys(resultado).length;
      if (capitulosEncontrados === 0) {
        console.error(`No se encontró ningún capítulo para ${bookId} en el XML español`);
      }

    } catch (error) {
      console.error("Error procesando XML Español:", error);
    }

    return resultado;
  }, []);

  const loadBookData = useCallback(async (libroId: string) => {
    if (bibleData[libroId] && Object.keys(bibleData[libroId]).length > 0) {
      const firstChapterKey = Object.keys(bibleData[libroId])[0];
      if (firstChapterKey) {
        const firstVerseKey = Object.keys(bibleData[libroId][parseInt(firstChapterKey)])[0];
        if (firstVerseKey && bibleData[libroId][parseInt(firstChapterKey)][parseInt(firstVerseKey)].textoCompleto && bibleData[libroId][parseInt(firstChapterKey)][parseInt(firstVerseKey)].textoCompleto !== '') {
          return bibleData[libroId];
        }
      }
    }

    try {
      let finalBookData: CapituloDataMap;

      const parser = new DOMParser();
      const spanishXmlFile = 'spavbl_usfx.xml';
      const spanishResponse = await fetch(`/data/bible/${spanishXmlFile}`);
      if (!spanishResponse.ok) throw new Error(`Error cargando Español XML: ${spanishResponse.status}`);
      const spanishData = await spanishResponse.text();
      const spanishXmlDoc = parser.parseFromString(spanishData, "text/xml");
      const spanishBookData = procesarEspanolXML(spanishXmlDoc, libroId);

      if (libroId === 'Genesis' || libroId === 'Exodus' || libroId === 'Leviticus') {
        let jsonFileName = '';
        if (libroId === 'Genesis') jsonFileName = 'genesis.json';
        else if (libroId === 'Exodus') jsonFileName = 'exodus.json';
        else if (libroId === 'Leviticus') jsonFileName = 'leviticus.json';
        const jsonResponse = await fetch(`/data/bible/${jsonFileName}`);
        if (!jsonResponse.ok) throw new Error(`Error cargando JSON (${jsonFileName}): ${jsonResponse.status}`);
        const jsonData = await jsonResponse.json();
        const processedData = procesarHebreoJSON(jsonData);

        Object.keys(processedData).forEach(capNumStr => {
          const capNum = parseInt(capNumStr);
          Object.keys(processedData[capNum]).forEach(verseNumStr => {
            const verseNum = parseInt(verseNumStr);
            const verse = processedData[capNum][verseNum];

            if (spanishBookData[capNum]?.[verseNum]?.fullText) {
              verse.textoCompleto = spanishBookData[capNum][verseNum].fullText;
            } else {
              verse.textoCompleto = verse.palabras.map(p => p.traduccion).join(' ').replace(' [sin trad.]', '').trim() || "Traducción completa no disponible en JSON.";
            }
          });
        });

        finalBookData = processedData;

      } else {
        const hebrewXmlFile = `${libroId}.xml`;
        const hebrewResponse = await fetch(`/data/bible/hebrew/${hebrewXmlFile}`);
        if (!hebrewResponse.ok) throw new Error(`Error cargando Hebreo XML: ${hebrewResponse.status}`);
        const hebrewData = await hebrewResponse.text();
        const hebrewXmlDoc = parser.parseFromString(hebrewData, "text/xml");
        const hebrewBookData = procesarHebreoXML(hebrewXmlDoc);

        finalBookData = {};
        Object.keys(hebrewBookData).forEach(capNumStr => {
          const capNum = parseInt(capNumStr);
          finalBookData[capNum] = {};
          Object.keys(hebrewBookData[capNum]).forEach(verseNumStr => {
            const verseNum = parseInt(verseNumStr);
            const hebrewWords = hebrewBookData[capNum][verseNum].palabras;
            const spanishDetails = spanishBookData[capNum]?.[verseNum];
            const spanishWords = spanishDetails?.words || [];
            const spanishFullText = spanishDetails?.fullText || "Traducción completa no disponible.";
            const mergedPalabras: PalabraData[] = [];

            for (let index = 0; index < hebrewWords.length; index++) {
              const hebrewWord = hebrewWords[index];
              const spanishWord = spanishWords[index];
              const traduccion = spanishWord?.traduccion || '[sin trad.]';
              const strong = spanishWord?.strong;

              mergedPalabras.push({
                ...hebrewWord,
                traduccion: traduccion,
                strong: strong,
              });
            }
            if (spanishWords.length > hebrewWords.length && mergedPalabras.length > 0) {
              const lastMergedWord = mergedPalabras[mergedPalabras.length - 1];
              let extraSpanishText = '';
              for (let i = hebrewWords.length; i < spanishWords.length; i++) {
                extraSpanishText += ` ${spanishWords[i].traduccion}`;
              }
              lastMergedWord.traduccion += ` ${extraSpanishText.trim()}`;
            }
            finalBookData[capNum][verseNum] = {
              palabras: mergedPalabras,
              textoCompleto: spanishFullText
            };
          });
        });
      }

      setBibleData(prevData => ({
        ...prevData,
        [libroId]: finalBookData
      }));

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
