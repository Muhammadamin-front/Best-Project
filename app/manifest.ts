import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Duodosh — duoda birgamiz",
    short_name: "Duodosh",
    description: "Bir-birimizni duoda eslaydigan mehrli musulmon hamjamiyati.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f5",
    theme_color: "#176b50",
    lang: "uz",
  };
}
