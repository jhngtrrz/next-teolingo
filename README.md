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
