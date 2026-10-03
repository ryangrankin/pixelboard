"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import type { PixelGrid } from "@/types/pixel";
import { useRouter } from "next/navigation";

type Design = {
  id: number;
  design_name: string;
  student_name: string;
  grid_data: PixelGrid;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

 useEffect(() => {
  const loadDesigns = async () => {
    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
  router.replace("/admin/login");
  return;
}

    const { data, error } = await supabase
      .from("designs")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        "Error loading designs:",
        JSON.stringify(error, null, 2)
      );
    } else {
      setDesigns(data || []);
    }

    setLoading(false);
  };

  loadDesigns();
}, [router]);

const handleLogout = async () => {
  const supabase = createClient();

  await supabase.auth.signOut();

  router.replace("/admin/login");
};

const updateDesignStatus = async (
  id: number,
  status: "approved" | "rejected"
) => {
  const supabase = createClient();

  const { error } = await supabase
    .from("designs")
    .update({
      status,
      approved_at:
        status === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating design:", error);
    return;
  }

  setDesigns((currentDesigns) =>
    currentDesigns.filter((design) => design.id !== id)
  );
};

   

  if (loading) {
    return <main><p>Loading submissions...</p></main>;
  }

  return (
    <main>
      <header className="hero">
        <p className="eyebrow">SPARK STUDIOS</p>
        <h1>Design Approvals</h1>
        <p className="subtitle">
          Review student designs before they appear in the gallery.
        </p>
        <button
  type="button"
  className="logout-button"
  onClick={handleLogout}
>
  Log Out
</button>
      </header>

      <section className="designer">
        <h2>Pending Designs</h2>

        {designs.length === 0 ? (
          <p>No designs are waiting for approval.</p>
        ) : (
          designs.map((design) => (
  <div className="approval-card" key={design.id}>
    <div>
      <h3>{design.design_name}</h3>
      <p>Submitted by: {design.student_name}</p>
    </div>

    {design.grid_data?.length > 0 && (
      <div className="design-preview">
        {design.grid_data.flatMap((row, rowIndex) =>
          row.map((pixel, columnIndex) => (
            <div
              key={`${rowIndex}-${columnIndex}`}
              className={`preview-pixel pixel-${pixel}`}
            />
          ))
        )}
      </div>
    )}

    <div className="approval-actions">
      <button
        type="button"
        className="approve-button"
        onClick={() => updateDesignStatus(design.id, "approved")}
      >
        Approve
      </button>

      <button
        type="button"
        className="reject-button"
        onClick={() => updateDesignStatus(design.id, "rejected")}
      >
        Reject
      </button>
    </div>
  </div>
))
        )}
      </section>
    </main>
  );
}