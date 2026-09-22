interface ToolbarProps {
  onUndo: () => void;
  onErase: () => void;
  onClear: () => void;
  eraserActive: boolean;
}

export default function Toolbar({
  onUndo,
  onErase,
  onClear,
  eraserActive,
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <button onClick={onUndo}>↶ Undo</button>

      <button
        onClick={onErase}
        className={eraserActive ? "active-tool" : ""}
      >
        Eraser
      </button>

      <button onClick={onClear}>Clear</button>
    </div>
  );
}