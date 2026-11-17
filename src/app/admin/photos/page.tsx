
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import "./photos.css";

type StudentDesign = {
  id: number;
  design_name: string;
  student_name: string | null;
  grid_data: unknown;
};

export default function AdminPhotosPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [publish, setPublish] = useState(false);
  const [message, setMessage] = useState("");
  const [designs, setDesigns] = useState<StudentDesign[]>([]);
  const [selectedDesignIds, setSelectedDesignIds] = useState<number[]>([]);


type ManagedPhoto = {
  id: string;
  title: string | null;
  description: string | null;
  storage_path: string;
  is_published: boolean;
};

const [existingPhotos, setExistingPhotos] = useState<ManagedPhoto[]>([]);
const [updatingPhotoId, setUpdatingPhotoId] = useState<string | null>(null);


  useEffect(() => {
    const checkLogin = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: designsError } = await supabase
        .from("designs")
        .select("id, design_name, student_name, grid_data")
        .eq("status", "approved")
        .order("id", { ascending: false });

      if (designsError) {
        setMessage(`Could not load designs: ${designsError.message}`);
      } else {
        setDesigns(data ?? []);
      }


const { data: photosData, error: photosError } = await supabase
  .from("pixelboard_photos")
  .select("id, title, description, storage_path, is_published")
  .order("created_at", { ascending: false });

if (photosError) {
  setMessage(`Could not load photos: ${photosError.message}`);
} else {
  setExistingPhotos(photosData ?? []);
}


      setLoading(false);
    };

    void checkLogin();
  }, [router]);

  useEffect(() => {
    if (!photo) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(photo);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [photo]);

  const handlePhotoChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] ?? null;
    setMessage("");

    if (!file) {
      setPhoto(null);
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    ) {
      setMessage("Please choose a JPG, PNG, or WebP image.");
      event.target.value = "";
      setPhoto(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Please choose an image smaller than 5 MB.");
      event.target.value = "";
      setPhoto(null);
      return;
    }

    setPhoto(file);
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!photo || uploading) {
      if (!photo) setMessage("Please select a photo first.");
      return;
    }

    setUploading(true);
    setMessage("Uploading photo...");

    try {
      const supabase = createClient();

      const extension =
        photo.type === "image/png"
          ? "png"
          : photo.type === "image/webp"
            ? "webp"
            : "jpg";

      const filePath = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("pixelboard-photos")
        .upload(filePath, photo, {
          contentType: photo.type,
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }


const { data: savedPhoto, error: databaseError } =
  await supabase
    .from("pixelboard_photos")
    .insert({
      storage_path: filePath,
      title: title.trim(),
      description: description.trim(),
      is_published: publish,
    })
    .select("id")
    .single();


      if (databaseError) {
        setMessage(
          `Image uploaded, but saving details failed: ${databaseError.message}`
        );
        return;
      }


// Connect the photo to selected student designs
if (selectedDesignIds.length > 0) {
  const connections = selectedDesignIds.map((designId) => ({
    photo_id: savedPhoto.id,
    design_id: designId,
  }));

  const { error: connectionError } = await supabase
    .from("pixelboard_photo_designs")
    .insert(connections);

  if (connectionError) {
    setMessage(
      `Photo saved, but linking designs failed: ${connectionError.message}`
    );
    return;
  }
}



setExistingPhotos((previous) => [
  {
    id: savedPhoto.id,
    title: title.trim(),
    description: description.trim(),
    storage_path: filePath,
    is_published: publish,
  },
  ...previous,
]);

      setMessage("Photo and details saved successfully!");
      setPhoto(null);
      setTitle("");
      setDescription("");
      setPublish(false);
      setSelectedDesignIds([]);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Upload failed."
      );
    } finally {
      setUploading(false);
    }
  };


const togglePhotoArchive = async (photo: ManagedPhoto) => {
  const action = photo.is_published ? "archive" : "restore";

  if (
    photo.is_published &&
    !window.confirm(
      `Archive "${photo.title || "Untitled Photo"}"? It will be hidden from the public gallery.`
    )
  ) {
    return;
  }

  setUpdatingPhotoId(photo.id);
  setMessage("");

  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("pixelboard_photos")
      .update({ is_published: !photo.is_published })
      .eq("id", photo.id)
      .select("id, is_published")
      .single();

    if (error) throw error;

    setExistingPhotos((previous) =>
      previous.map((item) =>
        item.id === data.id
          ? { ...item, is_published: data.is_published }
          : item
      )
    );

    setMessage(
      `Photo ${action === "archive" ? "archived" : "restored"} successfully!`
    );
 
} catch (error) {
  console.error("Archive/Restore error:", error);

  setMessage(
    `Could not update photo: ${
      error instanceof Error
        ? error.message
        : JSON.stringify(error)
    }`
  );
} finally {
    setUpdatingPhotoId(null);
  }
};


  if (loading) {
    return (
      <main className="photos-page">
        <p>Checking admin access...</p>
      </main>
    );
  }

  return (
    <main className="photos-page">
      <header className="hero">
        <p className="eyebrow">SPARK STUDIOS</p>
        <h1>Pixelboard Photos</h1>
        <p className="subtitle">
          Share real-world creations and connect them to
          student designs.
        </p>
        <button
          type="button"
          className="logout-button"
          onClick={() => router.push("/admin")}
        >
          ← Back to Admin
        </button>
      </header>

      <form className="photos-form" onSubmit={handleSubmit}>
        <section className="photos-card">
          <div className="photos-section-heading">
            <span className="photos-step">1</span>
            <div>
              <h2>Upload a Photo</h2>
              <p>Choose a photo of the physical Pixelboard.</p>
            </div>
          </div>

          <label className="photos-upload-area">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Selected Pixelboard"
                className="photos-preview"
              />
            ) : (
              <div className="photos-upload-placeholder">
                <span className="photos-upload-icon">+</span>
                <strong>Choose a photo</strong>
                <span>JPG, PNG, or WebP · Max 5 MB</span>
              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              required
            />
          </label>

          {photo && (
            <p className="photos-filename">
              Selected: {photo.name}
            </p>
          )}
        </section>

        <section className="photos-card">
          <div className="photos-section-heading">
            <span className="photos-step">2</span>
            <div>
              <h2>Photo Details</h2>
              <p>Add a title and an optional description.</p>
            </div>
          </div>

          <div className="photos-field">
            <label htmlFor="photo-title">Photo Title</label>
            <input
              id="photo-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Our First Pixelboard Creation"
            />
          </div>

          <div className="photos-field">
            <label htmlFor="photo-description">
              Description (optional)
            </label>
            <textarea
              id="photo-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Tell us about this creation..."
              rows={4}
            />
          </div>
        </section>

        <section className="photos-card">
          <div className="photos-section-heading">
            <span className="photos-step">3</span>
            <div>
              <h2>Connect Student Designs</h2>
              <p>
                Select the student designs featured in this photo.
              </p>
            </div>
          </div>

          {designs.length === 0 ? (
            <p>No approved student designs found.</p>
          ) : (
            <div className="photos-design-grid">
              {designs.map((design) => {
                const selected = selectedDesignIds.includes(
                  design.id
                );

                return (
                  <label
                    key={design.id}
                    className={`photos-design-card ${
                      selected ? "selected" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(event) => {
                        setSelectedDesignIds((previous) =>
                          event.target.checked
                            ? [...previous, design.id]
                            : previous.filter(
                                (id) => id !== design.id
                              )
                        );
                      }}
                    />

                    <div className="photos-design-info">
                      <strong>{design.design_name}</strong>
                      <span>
                        {design.student_name || "Unknown Student"}
                      </span>
                    </div>

                    <span className="photos-design-check">
                      {selected ? "✓" : "+"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          <p className="photos-selection-count">
            {selectedDesignIds.length} design(s) selected
          </p>
        </section>

        <section className="photos-card">
          <div className="photos-section-heading">
            <span className="photos-step">4</span>
            <div>
              <h2>Publish Photo</h2>
              <p>Choose whether this photo should be public.</p>
            </div>
          </div>

          <label className="photos-publish-row">
            <div>
              <strong>Publish to public gallery</strong>
              <span>
                {publish
                  ? "Marked for public display"
                  : "Keep this photo unpublished for now"}
              </span>
            </div>
            <input
              type="checkbox"
              checked={publish}
              onChange={(event) =>
                setPublish(event.target.checked)
              }
            />
          </label>
        </section>

        <button
          type="submit"
          className="photos-submit"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Photo →"}
        </button>

        {message && (
          <p className="photos-message" role="status">
            {message}
          </p>
        )}
      
    </form>

    <section className="photos-card" style={{ marginTop: 32 }}>
      <div className="photos-section-heading">
        <div>
          <h2>Manage Existing Photos</h2>
          <p>Archive or restore previously uploaded Pixelboard photos.</p>
        </div>
      </div>

      {(["published", "archived"] as const).map((section) => {
        const filteredPhotos = existingPhotos.filter((item) =>
          section === "published"
            ? item.is_published
            : !item.is_published
        );

        return (
          <div key={section} style={{ marginTop: 24 }}>
            <h3>
              {section === "published"
                ? "Published Photos"
                : "Archived / Unpublished Photos"}
              {" "}({filteredPhotos.length})
            </h3>

            {filteredPhotos.length === 0 ? (
              <p>No photos in this section.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                {filteredPhotos.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: 12,
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        createClient()
                          .storage.from("pixelboard-photos")
                          .getPublicUrl(item.storage_path)
                          .data.publicUrl
                      }
                      alt={item.title || "Pixelboard photo"}
                      style={{
                        width: 90,
                        height: 90,
                        objectFit: "cover",
                        borderRadius: 8,
                      }}
                    />

                    <div style={{ flex: 1, minWidth: 120 }}>
                      <strong>{item.title || "Untitled Photo"}</strong>
                      <p style={{ margin: "4px 0", fontSize: 13 }}>
                        {item.is_published
                          ? "Visible in public gallery"
                          : "Hidden from public gallery"}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={updatingPhotoId !== null}
                      onClick={() => void togglePhotoArchive(item)}
                      style={{
                        padding: "10px 18px",
                        borderRadius: 8,
                        border: "1px solid #d1d5db",
                        background: item.is_published
                          ? "#fff"
                          : "#e7f4d8",
                        color: "#222",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {updatingPhotoId === item.id
                        ? "Updating..."
                        : item.is_published
                          ? "Archive"
                          : "Restore"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>

    {message && (
      <p className="photos-message" role="status">
        {message}
      </p>
    )}
  </main>

  );
}
