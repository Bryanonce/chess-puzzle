# Chess Puzzle

Aplicación web en **React + TypeScript (Vite)** para crear y resolver un **puzzle de ajedrez** sobre un tablero de tamaño configurable.

El objetivo del puzzle es **llevar una pieza objetivo** (seleccionada por el usuario) hasta una **casilla meta** (también seleccionada por el usuario).

- **Ganas** cuando la posición de la pieza objetivo coincide con la casilla meta (cuando `puzzleInitial` y `puzzleEnd` son iguales).
- Puedes **jugar manualmente** moviendo piezas o pedir al programa una **solución automática** (y verla ejecutarse paso a paso).

## Conceptos básicos

- **Tablero**: una matriz \(vertical × horizontal\). Por defecto el tablero inicia en **3×6**.
- **Piezas movibles**: `pawn`, `rook`, `knight`, `bishop`, `queen`, `king`.
- **Casilla muerta (`obstacle`)**:
  - No se mueve.
  - Ninguna pieza puede caer en esa casilla.
  - En la práctica, funciona como un bloque permanente en el tablero.

## Cómo jugar (guía paso a paso)

La interfaz está organizada como un **wizard de 5 pasos**. En la parte superior verás el paso actual y una descripción de lo que debes hacer.

### Paso 1: Escoger dimensiones del tablero

1. Ajusta los campos:
   - **vertical** (alto)
   - **horizontal** (ancho)
2. Por defecto: **vertical = 3**, **horizontal = 6**.
3. Presiona **Generar** para crear el tablero vacío.

### Paso 2: Colocar piezas en el tablero

En este paso defines las piezas que estarán “en juego”.

1. Haz click en una **celda** del tablero.
2. Se abrirá un selector de piezas.
3. Elige qué pieza colocar en esa celda.

Notas importantes:
- Si colocas `obstacle`, esa celda se convierte en **casilla muerta**.
- Puedes colocar tantas piezas como quieras.
- Actualmente no hay capturas: las piezas se mueven solo a **celdas vacías**.

Cuando termines de colocar piezas, presiona **Siguiente: elegir pieza**.

### Paso 3: Seleccionar la pieza objetivo

1. Haz click sobre una **pieza del tablero** (no puede ser `obstacle`).
2. Esa pieza se vuelve la **pieza objetivo** del puzzle (la app la marcará como “inicial”).

Luego presiona **Siguiente: elegir casilla**.

### Paso 4: Seleccionar la casilla meta

1. Haz click en una **celda vacía** (no debe tener ninguna pieza).
2. Esa celda se vuelve la **casilla meta** (destino final).

Luego presiona **Siguiente: jugar**.

### Paso 5: Jugar o pedir solución

En este paso tienes dos opciones:

#### A) Jugar manualmente

1. Haz click en una **pieza** para ver sus movimientos posibles.
2. Verás las celdas válidas marcadas.
3. Haz click en una celda marcada para ejecutar el movimiento.

#### B) Pedir solución automática (con autoplay)

1. Presiona **Sugerir solución**.
2. El programa buscará una solución óptima (mínimo número de movimientos) que puede mover **cualquier pieza** para abrirse paso.
3. Si encuentra solución, se mostrará la lista de movimientos y la app empezará a ejecutarlos automáticamente con una pausa entre jugadas.
4. Puedes presionar **Detener** para cancelar la reproducción.

## Reglas de movimiento (resumen)

La lógica de movimientos es la estándar por pieza (sin capturas):
- **pawn**: un paso hacia “arriba” (fila - 1) si está libre.
- **rook**: líneas rectas hasta antes de un bloqueo.
- **bishop**: diagonales hasta antes de un bloqueo.
- **queen**: combinación de torre + alfil.
- **king**: 1 casilla alrededor.
- **knight**: salto en “L”.

Importante:
- Una celda ocupada (incluyendo `obstacle`) **bloquea** movimientos deslizantes y no puede ser destino.

## Victoria

- Ganas cuando la pieza objetivo llega a la casilla meta.
- En ese momento la app muestra el estado **Ganaste**.

## Ejecutar en local

```bash
npm install
npm run dev
```

> Nota: Vite requiere Node moderno (20+). Si tu entorno usa Node 16, `build`/`lint` pueden fallar por versión de runtime.

## Publicar en GitHub Pages (deploy)

Esta app se puede publicar gratis en **GitHub Pages** usando **GitHub Actions**.

### Requisitos

- El repositorio debe estar en GitHub.
- Tu branch principal debe llamarse `main` (el workflow está configurado así).

### Paso 1: Configurar `base` de Vite

GitHub Pages publica tu sitio bajo la ruta `/<nombre-del-repo>/`, por lo que Vite debe construirse con `base` correcto.

En `vite.config.ts`:

- Si tu repo se llama `Chess-Puzzle`, debes tener:
  - `base: '/Chess-Puzzle/'`
- Si tu repo tiene otro nombre, cambia ese valor a:
  - `base: '/NOMBRE_REPO/'`

### Paso 2: Activar Pages en GitHub

1. En tu repositorio ve a **Settings → Pages**.
2. En **Build and deployment**, selecciona **GitHub Actions**.

### Paso 3: Push a `main`

Cuando hagas push a `main`, GitHub Actions:

- instala dependencias
- ejecuta `npm run build`
- publica `dist/` en GitHub Pages

### URL final

Tu sitio quedará disponible en:

- `https://TU_USUARIO.github.io/NOMBRE_REPO/`

## Arquitectura (resumen)

El proyecto está refactorizado para separar responsabilidades (principios SOLID):

- **Dominio (tipos)**: `src/types/chess.ts` (posición, dimensiones, tipo de pieza, tablero, estados del juego).
- **Reglas puras**:
  - `src/utils/board.ts`: creación/mutación inmutable del tablero y validaciones.
  - `src/utils/movements.ts`: cálculo de movimientos por tipo de pieza (sin UI).
- **UI mapping**: `src/utils/pieces.ts` mapea `PieceType` a íconos FontAwesome (la UI depende del mapeo, no el dominio).
- **Estado/uso en React**: `src/hooks/useChessPuzzle.ts` orquesta el estado del puzzle.
- **Presentación**: `src/components/*` y `src/App.tsx`.

## Solucionador (cómo funciona)

El botón **Sugerir solución** usa un algoritmo de búsqueda sobre **estados completos del tablero**:

- Puede mover **cualquier pieza movible** (no `obstacle`).
- Busca una solución **óptima** (mínimo número de movimientos), con límites de tiempo/iteraciones para mantenerlo usable en el navegador.
- La solución se devuelve como una lista de movimientos:
  - `P{id} (tipo): (row,cell) -> (row,cell)`

