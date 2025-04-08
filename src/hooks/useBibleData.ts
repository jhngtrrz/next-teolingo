'use client';

import { useState, useCallback } from 'react';
import { BibleDataType, CapituloDataMap, VersiculoDataMap } from '@/types/bible';

export const useBibleData = () => {
  const [bibleData, setBibleData] = useState<BibleDataType>({});

  // Función para procesar el XML y convertirlo a nuestro formato de datos
  const procesarXML = useCallback((xmlDoc: Document, libroId: string): CapituloDataMap => {
    const resultado: CapituloDataMap = {};

    try {
      // Buscar todos los elementos de capítulo en el XML
      const capitulos = xmlDoc.querySelectorAll('c');

      capitulos.forEach(capitulo => {
        // Obtener el número de capítulo del atributo 'n'
        const capNum = parseInt(capitulo.getAttribute('n') || '1');
        resultado[capNum] = {};

        // Buscar todos los versículos en este capítulo
        const versiculos = capitulo.querySelectorAll('v');

        versiculos.forEach(versiculo => {          // Obtener el número de versículo del atributo 'n'
          const verseNum = parseInt(versiculo.getAttribute('n') || '1');
          const palabras: { original: string; traduccion: string }[] = [];

          // Procesar cada palabra en el versículo
          const words = versiculo.querySelectorAll('w');

          words.forEach(word => {
            // Extraer el texto hebreo y su traducción
            const original = word.textContent?.trim() || '';
            // Intentar obtener la traducción del atributo 'gloss' o usar el atributo 't' como respaldo
            const traduccion = word.getAttribute('gloss') || word.getAttribute('t') || "[sin traducción]";

            palabras.push({
              original,
              traduccion
            });
          });

          resultado[capNum][verseNum] = {
            palabras
          };
        });
      });
    } catch (error) {
      console.error("Error procesando XML:", error);
    }

    return resultado;
  }, []);
  // Función para cargar un libro
  const loadBookData = useCallback(async (libroId: string) => {
    try {
      // Ya tenemos los datos cargados
      if (bibleData[libroId]) {
        return bibleData[libroId];
      }

      // Determinar qué archivo XML cargar
      const xmlFile = `${libroId}.xml`;

      const response = await fetch(`/data/bible/hebrew/${xmlFile}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();

      // Parsear el XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(data, "text/xml");

      // Procesar los datos XML
      const bookData = procesarXML(xmlDoc, libroId);

      // Actualizar el estado con los datos del nuevo libro
      setBibleData(prevData => ({
        ...prevData,
        [libroId]: bookData
      }));

      return bookData;
    } catch (error) {
      console.error("Error cargando el XML:", error);
      return null;
    }
  }, [bibleData, procesarXML]);

  return {
    bibleData,
    loadBookData
  };
};
