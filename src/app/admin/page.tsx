"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { PixelGrid } from "@/types/pixel";

type Design = {
  id: number;
  design_name: string;
  student_name: string;
  grid_data: PixelGrid;
  status: string;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();

  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  // Load pending designs
  useEffect(() => {
    const loadDesigns = async () => {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      // Not logged in -> send to login page
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
        console.error("Error loading designs:", error);
      } else {
        setDesigns(data || []);
      }

      setLoading(false);
    };

    loadDesigns();
  }, [router]);

  // Approve or reject a design
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

    // Remove it from the pending list
    setDesigns((currentDesigns) =>
      currentDesigns.filter((design) => design.id !== id)
    );
  };

 const printDesign = (design: Design) => {
  const printWindow = window.open("", "_blank");

  if (!printWindow) return;

  const getPixelLetter = (pixel: string) => {
  const value = pixel.toLowerCase().trim();

  if (value.includes("pink")) return "P";
  if (value.includes("yellow")) return "Y";
  if (value.includes("blue")) return "B";

  return "";
};

const pixels = design.grid_data
  .flatMap((row) =>
    row.map((pixel) => {
      const letter = getPixelLetter(String(pixel));

      return `
        <div class="pixel">
          ${letter}
        </div>
      `;
    })
  )
  .join("");

  const pixels = design.grid_data
    .flatMap((row) =>
      row.map((pixel) => {
        const letter = letterMap[pixel] || "";

        return `
          <div class="pixel">
            ${letter}
          </div>
        `;
      })
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${design.design_name}</title>

        <style>
          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
            padding: 30px;
            text-align: center;
            color: #000;
          }

          h1 {
            margin: 0 0 6px;
            font-size: 28px;
          }

          .student {
            margin: 0 0 12px;
          }

          .key {
            margin-bottom: 20px;
            font-weight: bold;
          }

          .board {
            display: grid;
            grid-template-columns: repeat(24, 1fr);
            grid-template-rows: repeat(24, 1fr);
            width: 600px;
            height: 600px;
            margin: 0 auto;
            border-top: 1px solid #000;
            border-left: 1px solid #000;
          }

          .pixel {
            display: flex;
            align-items: center;
            justify-content: center;

            border-right: 1px solid #000;
            border-bottom: 1px solid #000;

            font-size: 14px;
            font-weight: bold;
          }

          @media print {
            body {
              padding: 0;
            }

            .board {
              width: 6.5in;
              height: 6.5in;
            }
          }
        </style>
      </head>

      <body>
        <h1>${design.design_name}</h1>

        <p class="student">
          Submitted by: ${design.student_name}
        </p>

        <p class="key">
          P = Pink &nbsp;&nbsp; Y = Yellow &nbsp;&nbsp; B = Blue
        </p>

        <div class="board">
          ${pixels}
        </div>

        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

  // Log admin out
  const handleLogout = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.replace("/admin/login");
  };

  if (loading) {
    return (
      <main>
        <p>Loading submissions...</p>
      </main>
    );
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
                  {design.grid_data.flatMap(
                    (row, rowIndex) =>
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
                  onClick={() =>
                    updateDesignStatus(
                      design.id,
                      "approved"
                    )
                  }
                >
                  Approve
                </button>

                <button
                  type="button"
                  className="reject-button"
                  onClick={() =>
                    updateDesignStatus(
                      design.id,
                      "rejected"
                    )
                  }
                >
                  Reject
                </button>

                {design.grid_data?.length > 0 && (
                  <button
                    type="button"
                    className="print-button"
                    onClick={() => printDesign(design)}
                  >
                    Print Design
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}