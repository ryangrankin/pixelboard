"use client";

import { useState } from "react";
import type { PixelColor, PixelGrid } from "@/types/pixel";

interface PixelBoardProps {
  grid: PixelGrid;
  selectedColor: PixelColor;
  eraserActive: boolean;
  onGridChange: (newGrid: PixelGrid) => void;
}

export default function PixelBoard({
  grid,
  selectedColor,
  eraserActive,
  onGridChange,
}: PixelBoardProps) {
  const [isDrawing, setIsDrawing] = useState(false);

  function paintPixel(rowIndex: number, columnIndex: number) {
    const newGrid = grid.map((row) => [...row]);

    newGrid[rowIndex][columnIndex] = eraserActive
      ? "blank"
      : selectedColor;

    onGridChange(newGrid);
  }

  function handlePointerDown(
    rowIndex: number,
    columnIndex: number,
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();

    setIsDrawing(true);
    paintPixel(rowIndex, columnIndex);

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerEnter(
    rowIndex: number,
    columnIndex: number,
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    if (isDrawing && event.buttons === 1) {
      paintPixel(rowIndex, columnIndex);
    }
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  return (
    <div
      className="pixel-board"
      onPointerUp={stopDrawing}
      onPointerLeave={stopDrawing}
    >
      {grid.flatMap((row, rowIndex) =>
        row.map((pixel, columnIndex) => (
          <button
            type="button"
            key={`${rowIndex}-${columnIndex}`}
            className={`pixel pixel-${pixel}`}
            aria-label={`Pixel ${rowIndex + 1}, ${columnIndex + 1}`}
            onPointerDown={(event) =>
              handlePointerDown(rowIndex, columnIndex, event)
            }
            onPointerEnter={(event) =>
              handlePointerEnter(rowIndex, columnIndex, event)
            }
          />
        )),
      )}
    </div>
  );
}