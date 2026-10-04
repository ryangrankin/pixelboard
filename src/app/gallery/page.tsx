"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { PixelGrid } from "@/types/pixel";

type GalleryDesign = {
  id: number;
  design_name: string;
  grid_data: PixelGrid;
  approved_at: string;
};

export default function GalleryPage() {
  const [designs, setDesigns] = useState<GalleryDesign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDesigns = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("approved_designs")
        .select("*")
        .order("approved_at", { ascending: false });

      if (error) {
        console.error("Error loading gallery:", error);
      } else {
        setDesigns(data || []);
      }

      setLoading(false);
    };

    loadDesigns();
  }, []);

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">SPARK STUDIOS</p>
        <h1>Student Gallery</h1>
        <p className="subtitle">
          Explore designs created for the Spark Studios pixel wall.
        </p>
      </header>

     <nav className="site-nav">
  <a
    href="https://sparkstudiosvt.com/"
    target="_blank"
    rel="noopener noreferrer"
    className="spark-home-link"
  >
    <img
      src="/sparklogo.jpg"
      alt="Spark Studios"
      className="spark-logo"
    />
  </a>

  <div className="nav-pages">
    <a href="/" className="nav-link active">
      Create a Design
    </a>

    <a href="/gallery" className="nav-link">
      Gallery
    </a>
  </div>
</nav>

      <section className="designer">
        {loading ? (
          <p>Loading designs...</p>
        ) : designs.length === 0 ? (
          <p>No designs have been added to the gallery yet.</p>
        ) : (
          <div className="gallery-grid">
            {designs.map((design) => (
              <article className="gallery-card" key={design.id}>
                <div className="gallery-preview">
                  {design.grid_data.flatMap((row, rowIndex) =>
                    row.map((pixel, columnIndex) => (
                      <div
                        key={`${rowIndex}-${columnIndex}`}
                        className={`preview-pixel pixel-${pixel}`}
                      />
                    ))
                  )}
                </div>

                <h2>{design.design_name}</h2>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}