export const GA_ID = "G-VVEW7G623L";

export const pageview = (url) => {
  if (
    typeof window !== "undefined" &&
    typeof window.gtag === "function"
  ) {
    window.gtag("config", GA_ID, {
      page_path: url,
    });
  }
};