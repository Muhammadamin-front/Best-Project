import type { Metadata } from "next";
import { requireChatGPTUser } from "../chatgpt-auth";
import MosqueDashboard from "./MosqueDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Masjid kabineti" };

export default async function MosqueDashboardPage() {
  const user = await requireChatGPTUser("/mosque-dashboard");
  return <MosqueDashboard viewerName={user.displayName} mosqueId="mosque-minor" />;
}
