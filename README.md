# Chess Puzzle

Aplicación web en **React + TypeScript (Vite)** para crear y jugar un **puzzle de ajedrez** sobre un tablero de tamaño configurable.

El objetivo es **mover la pieza inicial** hasta la **posición final**. Cuando `puzzleInitial` y `puzzleEnd` son iguales, el juego termina y el usuario **gana**.

## Cómo se juega

- **Generar tablero**: ingresa dimensiones (vertical y horizontal) y presiona **Generar**.
- **Colocar piezas**: haz click en una celda y elige una pieza (peón, torre, caballo, alfil, reina, rey u obstáculo).
- **Definir inicio**: cambia a “posición inicial” y selecciona la celda donde inicia el puzzle.
- **Definir final**: cambia a “posición final” y selecciona la celda objetivo.
- **Jugar**:
  - Selecciona una pieza en el tablero para ver sus movimientos posibles.
  - Selecciona una celda marcada para moverla.
  - **Victoria**: si la pieza inicial llega a la celda final, aparece el estado **Ganaste** y puedes **Reiniciar**.

## Ejecutar en local

```bash
npm install
npm run dev
```

> Nota: Vite requiere Node moderno (20+). Si tu entorno usa Node 16, `build`/`lint` pueden fallar por versión de runtime.

## Arquitectura (resumen)

El proyecto está refactorizado para separar responsabilidades (principios SOLID):

- **Dominio (tipos)**: `src/types/chess.ts` (posición, dimensiones, tipo de pieza, tablero, estados del juego).
- **Reglas puras**:
  - `src/utils/board.ts`: creación/mutación inmutable del tablero y validaciones.
  - `src/utils/movements.ts`: cálculo de movimientos por tipo de pieza (sin UI).
- **UI mapping**: `src/utils/pieces.ts` mapea `PieceType` a íconos FontAwesome (la UI depende del mapeo, no el dominio).
- **Estado/uso en React**: `src/hooks/useChessPuzzle.ts` orquesta el estado del puzzle.
- **Presentación**: `src/components/*` y `src/App.tsx`.

