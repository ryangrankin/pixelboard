import type { PixelColor } from "@/types/pixel";

interface ColorPaletteProps {
  selectedColor: PixelColor;
  onSelectColor: (color: PixelColor) => void;
}

const colors: {
  name: string;
  value: PixelColor;
  hex: string;
}[] = [
  { name: "Pink", value: "pink", hex: "#ff5c8a" },
  { name: "Yellow", value: "yellow", hex: "#ffd84d" },
  { name: "Blue", value: "blue", hex: "#4da6ff" },
];

export default function ColorPalette({
  selectedColor,
  onSelectColor,
}: ColorPaletteProps) {
  return (
    <div className="palette">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          className={`color-button ${
            selectedColor === color.value ? "selected" : ""
          }`}
          onClick={() => onSelectColor(color.value)}
        >
          <span
            className="color-circle"
            style={{ backgroundColor: color.hex }}
          />
          <span>{color.name}</span>
        </button>
      ))}
    </div>
  );
}