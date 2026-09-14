import type { Metadata } from "next";
import DuodoshApp from "./components/DuodoshApp";
import { getChatGPTUser } from "./chatgpt-auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Duodosh — duoda birgamiz",
  description: "Niyatingizni ulashing, boshqalarni duoda eslang va mehrli musulmon hamjamiyati bilan bog‘laning.",
};

export default async function Home() {
  const user = await getChatGPTUser();
  return <DuodoshApp viewerName={user?.displayName ?? "Aziza Karimova"} />;
}
