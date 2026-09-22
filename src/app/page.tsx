"use client";

import { useState } from "react";

import PixelBoard from "@/components/PixelBoard";
import ColorPalette from "@/components/ColorPalette";
import Toolbar from "@/components/Toolbar";

import {
  createEmptyGrid,
  PixelColor,
  PixelGrid,
} from "@/types/pixel";

export default function Home() {
  const [grid, setGrid] = useState<PixelGrid>(createEmptyGrid());
  const [selectedColor, setSelectedColor] =
    useState<PixelColor>("pink");

  const [eraserActive, setEraserActive] = useState(false);

  const [history, setHistory] = useState<PixelGrid[]>([]);

  const [message, setMessage] = useState("");

  const handleGridChange = (newGrid: PixelGrid) => {
    setHistory((previousHistory) => [...previousHistory, grid]);
    setGrid(newGrid);
  };

  const handleColorSelect = (color: PixelColor) => {
    setSelectedColor(color);
    setEraserActive(false);
  };

  const handleUndo = () => {
    if (history.length === 0) return;

    const previousGrid = history[history.length - 1];

    setGrid(previousGrid);
    setHistory(history.slice(0, -1));
  };

  const handleClear = () => {
    setHistory((previousHistory) => [...previousHistory, grid]);
    setGrid(createEmptyGrid());
    setMessage("");
  };

  const handleSend = () => {
    // This is temporary for the prototype.
    // Eventually this function will send the grid
    // data to the physical LED board.

    console.log("Design sent to board:", grid);

    setMessage("Your design was sent to the board!");
  };

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">SPARK STUDIOS</p>

        <h1>Light Up Your Idea.</h1>

        <p className="subtitle">
          Pick a color, create your pixel design, and send it
          to the Spark Studios light board.
        </p>
      </header>

      <section className="designer">
        <div className="instructions">
          <span className="step-number">1</span>

          <div>
            <h2>Choose a color</h2>
            <p>Select one of the three colors to start drawing.</p>
          </div>
        </div>

        <ColorPalette
          selectedColor={selectedColor}
          onSelectColor={handleColorSelect}
        />

        <div className="instructions board-instructions">
          <span className="step-number">2</span>

          <div>
            <h2>Create your design</h2>
            <p>Click or drag across the board to light up pixels.</p>
          </div>
        </div>

        <PixelBoard
          grid={grid}
          selectedColor={selectedColor}
          eraserActive={eraserActive}
          onGridChange={handleGridChange}
        />

        <Toolbar
          onUndo={handleUndo}
          onErase={() => setEraserActive(!eraserActive)}
          onClear={handleClear}
          eraserActive={eraserActive}
        />

        <div className="send-section">
          <div className="instructions">
            <span className="step-number">3</span>

            <div>
              <h2>Ready?</h2>
              <p>Send your creation to the Spark Studios board.</p>
            </div>
          </div>

          <button className="send-button" onClick={handleSend}>
            Send to Board →
          </button>

          {message && <p className="success-message">{message}</p>}
        </div>
      </section>
    </main>
  );
}