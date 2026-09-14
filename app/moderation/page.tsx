import type { Metadata } from "next";
import { requireChatGPTUser } from "../chatgpt-auth";
import ModerationDashboard from "./ModerationDashboard";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Moderatsiya" };

export default async function ModerationPage() {
  const user = await requireChatGPTUser("/moderation");
  return <ModerationDashboard viewerName={user.displayName} />;
}
