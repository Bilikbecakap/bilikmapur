import type { Metadata } from "next";
import pool from "@/lib/db";
import VideoCard from "@/components/video/VideoCard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Video — Mapur" };

interface VideoRow {
  id: string;
  judul: string;
  deskripsi: string | null;
  youtube_id: string;
}

export default async function VideoPage() {
  const { rows: videoList } = await pool.query<VideoRow>(
    `SELECT id, judul, deskripsi, youtube_id
     FROM video
     WHERE status = 'published'
     ORDER BY dibuat_pada DESC`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 border-b-2 border-granit/35 pb-6">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-rimba mb-2">Koleksi</p>
        <h1
          className="font-semibold text-arang mb-1 leading-tight"
          style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2.25rem", fontStyle: "italic" }}
        >
          Video
        </h1>
        <p className="text-teks-sekunder text-sm" style={{ fontFamily: "var(--font-lora), Georgia, serif" }}>
          Dokumentasi visual adat, tradisi, dan budaya masyarakat Mapur.
        </p>
      </div>

      {videoList.length === 0 ? (
        <div className="text-center py-20 text-teks-sekunder">
          Belum ada video yang dipublikasikan.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {videoList.map((video) => (
            <VideoCard
              key={video.id}
              judul={video.judul}
              deskripsi={video.deskripsi}
              youtube_id={video.youtube_id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
