import { useRef, useState } from "react";
import { uploadImage } from "./api.js";

export default function ImageDropzone({ value, onChange }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    setError("");
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (e) {
      setError("Upload fehlgeschlagen: " + e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="field">
      <label>Foto</label>
      {value && <img className="dropzone-preview" src={value} alt="" />}
      <div
        className={"dropzone" + (dragOver ? " dragover" : "")}
        onClick={() => inputRef.current && inputRef.current.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFile(e.dataTransfer.files && e.dataTransfer.files[0]);
        }}
      >
        {busy ? "Lädt hoch…" : "Foto hierher ziehen oder klicken zum Auswählen"}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files && e.target.files[0])}
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}
