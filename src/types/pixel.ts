export type PixelColor =
  | "blank"
  | "pink"
  | "yellow"
  | "blue";

export type PixelGrid = PixelColor[][];

export const BOARD_SIZE = 16;

export function createEmptyGrid(): PixelGrid {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from(
      { length: BOARD_SIZE },
      () => "blank" as PixelColor,
    ),
  );
}