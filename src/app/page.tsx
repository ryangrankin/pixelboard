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

  const [designName, setDesignName] = useState("");
  const [studentName, setStudentName] = useState("");

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
  if (!designName.trim() || !studentName.trim()) {
    setMessage("Please add a design name and your name or initials.");
    return;
  }

  const submission = {
    designName,
    studentName,
    grid,
    status: "pending",
  };

  console.log("Design submitted:", submission);

  setMessage("Your design was submitted for approval!");
};

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">SPARK STUDIOS</p>

        <h1>Light Up Your Idea.</h1>

        <p className="subtitle">
          Pick a color and create your design for the
          Spark Studios light board.
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
              <p>Submit your design for approval.</p>
            </div>
          </div>

          <button className="send-button" onClick={handleSend}>
            Submit Design →
          </button>

          <div className="submission-form">
  <label>
    Design name
    <input
      type="text"
      value={designName}
      onChange={(event) => setDesignName(event.target.value)}
      placeholder="Give your design a name"
      maxLength={50}
    />
  </label>

  <label>
    Your name or initials
    <input
      type="text"
      value={studentName}
      onChange={(event) => setStudentName(event.target.value)}
      placeholder="First name or initials"
      maxLength={30}
    />
  </label>
</div>

          {message && <p className="success-message">{message}</p>}
        </div>
      </section>
    </main>
  );
}