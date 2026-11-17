
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

type LinkedDesign = {
  id: number;
  design_name: string;
  student_name: string | null;
  grid_data: PixelGrid;
};

type PhotoLink = {
  photo_id: string;
  design_id: number;
};

type RealLifePhoto = {
  id: string;
  title: string | null;
  description: string | null;
  storage_path: string;
  linkedDesigns: LinkedDesign[];
};

export default function GalleryPage() {
  const [designs, setDesigns] = useState<GalleryDesign[]>([]);
  const [realLifePhotos, setRealLifePhotos] =
    useState<RealLifePhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadGallery = async () => {
      const supabase = createClient();

      // Load approved student designs
      const { data: designData, error: designError } =
        await supabase
          .from("approved_designs")
          .select("*")
          .order("approved_at", { ascending: false });

      if (designError) {
        console.error("Error loading designs:", designError);
        setErrorMessage("Some gallery content could not be loaded.");
      } else {
        setDesigns(designData ?? []);
      }

      // Load published real-life photos
      const { data: photoData, error: photoError } =
        await supabase
          .from("pixelboard_photos")
          .select("id, title, description, storage_path")
          .eq("is_published", true)
          .order("created_at", { ascending: false });

      if (photoError) {
        console.error("Error loading photos:", photoError);
        setErrorMessage("Some gallery content could not be loaded.");
      }

      // Load connections between photos and designs
      const { data: linkData, error: linkError } =
        await supabase
          .from("pixelboard_photo_designs")
          .select("photo_id, design_id");

      if (linkError) {
        console.error("Error loading photo links:", linkError);
        setErrorMessage("Some design connections could not be loaded.");
      }

      const links = (linkData ?? []) as PhotoLink[];
      const linkedIds = [
        ...new Set(links.map((link) => link.design_id)),
      ];

      let linkedDesigns: LinkedDesign[] = [];

      if (linkedIds.length > 0) {
        const { data, error } = await supabase
          .from("designs")
          .select("id, design_name, student_name, grid_data")
          .eq("status", "approved")
          .in("id", linkedIds);

        if (error) {
          console.error("Error loading linked designs:", error);
          setErrorMessage(
            "Some linked student designs could not be loaded."
          );
        } else {
          linkedDesigns = (data ?? []) as LinkedDesign[];
        }
      }

      // Match each photo with its student designs
      const photosWithDesigns: RealLifePhoto[] =
        (photoData ?? []).map((photo) => {
          const designIds = links
            .filter((link) => link.photo_id === photo.id)
            .map((link) => link.design_id);

          return {
            ...photo,
            linkedDesigns: linkedDesigns.filter((design) =>
              designIds.includes(design.id)
            ),
          };
        });

      setRealLifePhotos(photosWithDesigns);
      setLoading(false);
    };

    void loadGallery();
  }, []);

  const supabase = createClient();

  const renderPixelGrid = (grid: PixelGrid) => (
    <div className="gallery-preview">
      {grid.flatMap((row, rowIndex) =>
        row.map((pixel, columnIndex) => (
          <div
            key={`${rowIndex}-${columnIndex}`}
            className={`preview-pixel pixel-${pixel}`}
          />
        ))
      )}
    </div>
  );

  return (
    <main>
      <nav className="site-nav">
        <a
          href="https://sparkstudiosvt.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="spark-home-link"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/sparklogo.jpg"
            alt="Spark Studios"
            className="spark-logo"
          />
        </a>

        <div className="nav-pages">
          <a href="/" className="nav-link">
            Create a Design
          </a>

          <a href="/gallery" className="nav-link active">
            Gallery
          </a>
        </div>

        <header className="hero">
          <p className="eyebrow">SPARK STUDIOS</p>
          <h1>Student Gallery</h1>
          <p className="subtitle">
            Explore student designs and see how they come to life
            on the Spark Studios Pixelboard!
          </p>
        </header>
      </nav>

      {/* ORIGINAL STUDENT GALLERY */}
      <section className="designer">
        <h2>Student Designs</h2>
        <p>Explore pixel art created by students.</p>

        {loading ? (
          <p>Loading designs...</p>
        ) : designs.length === 0 ? (
          <p>No designs have been added yet.</p>
        ) : (
          <div className="gallery-grid">
            {designs.map((design) => (
              <article className="gallery-card" key={design.id}>
                {renderPixelGrid(design.grid_data)}
                <h2>{design.design_name}</h2>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* REAL-LIFE PIXELBOARDS */}
      <section className="designer">
        <h2>Real-Life Pixelboards</h2>
        <p>
          See how student creations become real Pixelboards!
        </p>

        {loading ? (
          <p>Loading photos...</p>
        ) : realLifePhotos.length === 0 ? (
          <p>No real-life photos have been published yet.</p>
        ) : (
          
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))",
    gap: 20,
    marginTop: 24,
    justifyContent: "center",
  }}
>

            {realLifePhotos.map((photo) => (
              <article
                className="gallery-card"
                key={photo.id}
                
style={{
  padding: 20,
  width: "100%",
  maxWidth: 650,
  margin: "0 auto",
  boxSizing: "border-box",
}}

              >
                <h2>{photo.title || "Pixelboard Creation"}</h2>

                {photo.description && (
                  <p>{photo.description}</p>
                )}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: 16,
                    marginTop: 20,
                    alignItems: "start",
                  }}
                >
                  {/* REAL PHOTO */}
                  <div>
                    <h3>Real-Life Creation</h3>

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        supabase.storage
                          .from("pixelboard-photos")
                          .getPublicUrl(photo.storage_path)
                          .data.publicUrl
                      }
                      alt={photo.title || "Physical Pixelboard"}
                      
style={{
  width: "100%",
  height: 190,
  objectFit: "contain",
  borderRadius: 10,
  background: "#f2f9e9",
}}

                    />
                  </div>

                  {/* LINKED STUDENT DESIGNS */}
                  {photo.linkedDesigns.length > 0 && (
                    <div>
                      <h3>Original Student Design</h3>

                      {photo.linkedDesigns.map((design) => (
                        <div
                          key={design.id}
                          style={{
                            marginBottom: 20,
                            padding: 16,
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                          }}
                        >
                          {renderPixelGrid(design.grid_data)}

                          <h3 style={{ marginTop: 12 }}>
                            {design.design_name}
                          </h3>

                          {design.student_name && (
                            <p>Created by {design.student_name}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {errorMessage && (
        <p role="alert" style={{ textAlign: "center", color: "red" }}>
          {errorMessage}
        </p>
      )}
    </main>
  );
}
