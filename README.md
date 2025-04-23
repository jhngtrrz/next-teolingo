# Teolingo Interlineal

## Descripción
Teolingo Interlineal es una aplicación web moderna desarrollada con Next.js que proporciona acceso a textos bíblicos del Antiguo Testamento en hebreo con traducción interlineal. Esta herramienta está diseñada para estudiantes, teólogos e interesados en el estudio profundo de las escrituras en sus idiomas originales.

## Características principales
- **Visualización interlineal**: Texto en hebreo con traducción palabra por palabra
- **Navegación intuitiva**: Selección sencilla de libros, capítulos y versículos
- **Interfaz responsiva**: Diseño adaptable para dispositivos móviles y de escritorio
- **Colección completa**: Todos los libros del Antiguo Testamento en hebreo

## Estructura del proyecto
El proyecto sigue una arquitectura "screaming" (por características) en Next.js:

```
src/
  app/            # Configuración de páginas y rutas
  components/      # Componentes compartidos
  contexts/        # Contextos de React para estado global
  features/        # Características organizadas por dominio
    bible/         # Funcionalidad principal de visualización bíblica
    interlinear/   # Funcionalidad específica de traducción interlineal
    search/        # Búsqueda en textos bíblicos
    bookmarks/     # Marcadores de versículos
    notes/         # Notas personales
    languages/     # Gestión de idiomas
  hooks/           # Hooks personalizados de React
  lib/             # Utilidades y funciones
    api/           # Servicios para acceso a datos
  styles/          # Estilos globales
  types/           # Definiciones de tipos TypeScript
```

## Roadmap y Tareas Pendientes (TODO)

### Conversión y Preparación de Datos (2025 Q2-Q3)
- ✅ Libros completados en formato JSON con números Strong: Génesis, Éxodo, Levítico, Números
- [ ] Conversión de XML a JSON para los siguientes libros (en orden de prioridad):
  - [ ] 1. Deuteronomio (completa el Pentateuco)
  - [ ] 2. Josué, Jueces, Rut
  - [ ] 3. 1 y 2 Samuel, 1 y 2 Reyes
  - [ ] 4. Isaías, Jeremías, Ezequiel (profetas mayores)
  - [ ] 5. Salmos, Proverbios, Job (literatura sapiencial)
  - [ ] 6. Profetas menores (Oseas - Malaquías)
  - [ ] 7. Libros históricos restantes (Crónicas, Esdras, Nehemías, Ester)
  - [ ] 8. Resto de literatura sapiencial (Eclesiastés, Cantares)
  - [ ] 9. Daniel, Lamentaciones

### Diccionario Bíblico Strong (2025 Q3)
- [ ] Estructura de datos para el diccionario Strong
- [ ] Página dedicada para cada número Strong con:
  - [ ] Definición léxica completa
  - [ ] Análisis morfológico y sintáctico
  - [ ] Etimología y desarrollo histórico
  - [ ] Referencias cruzadas con otras palabras relacionadas
  - [ ] Ejemplos de uso en distintos contextos bíblicos

### Características de Audio (2025 Q4)
- [ ] Grabación/adquisición de pronunciación para palabras hebreas
- [ ] Implementación del reproductor de audio para cada palabra
- [ ] Opción para reproducir versículos completos en hebreo
- [ ] Control de velocidad de reproducción para estudio

### Mejoras de Experiencia de Usuario (2026 Q1)
- [ ] Modo oscuro/claro adaptable
- [ ] Configuración de fuentes y tamaños para mejor lectura
- [ ] Opciones de visualización personalizada (interlineal, paralela, solo original)
- [ ] Sistema de guardado de preferencias de usuario

### Funcionalidades Avanzadas (2026 Q2-Q3)
- [ ] Herramientas de análisis lingüístico avanzado
  - [ ] Análisis de frecuencia de palabras
  - [ ] Búsqueda por raíces semíticas
  - [ ] Identificación de construcciones gramaticales especiales
- [ ] Notas de estudio personalizadas vinculadas a versículos o palabras
- [ ] Exportación de resultados en diferentes formatos (PDF, DOCX, HTML)
- [ ] Sistema de marcadores y etiquetas para organizar el estudio personal
- [ ] Integración con herramientas externas de estudio bíblico

### Optimizaciones y Plataforma (2026 Q3-Q4)
- [ ] Optimización de rendimiento para dispositivos de gama baja
- [ ] Soporte offline con Progressive Web App (PWA)
- [ ] Sincronización entre dispositivos (opcional, para usuarios registrados)
- [ ] Versión nativa para dispositivos móviles (React Native)

## Datos bíblicos
La aplicación utiliza archivos XML que contienen los textos del Antiguo Testamento en hebreo, almacenados en la carpeta `public/data/bible/hebrew/`. Cada libro tiene su propio archivo XML con el siguiente formato:

```xml
<c n="1">                     <!-- Capítulo -->
  <v n="1">                   <!-- Versículo -->
    <w gloss="En el principio">בְּרֵאשִׁ֖ית</w>  <!-- Palabra con traducción -->
    <!-- más palabras... -->
  </v>
  <!-- más versículos... -->
</c>
<!-- más capítulos... -->
```

## Tecnologías utilizadas
- Next.js
- React
- TypeScript
- Tailwind CSS

## Contribuciones
Las contribuciones son bienvenidas. Por favor, si encuentras algún error o tienes alguna mejora, no dudes en abrir un issue o enviar un pull request.

## Licencia
[MIT](LICENSE)

---

© 2025 Teolingo Interlineal
