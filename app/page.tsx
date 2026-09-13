import type { Metadata } from "next";
import DuodoshApp from "./components/DuodoshApp";

export const metadata: Metadata = {
  title: "Duodosh — duoda birgamiz",
  description: "Niyatingizni ulashing, boshqalarni duoda eslang va mehrli musulmon hamjamiyati bilan bog‘laning.",
};

export default function Home() {
  return <DuodoshApp />;
}
