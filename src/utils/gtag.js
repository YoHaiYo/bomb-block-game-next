export const GA_ID = "G-P4K5RR52Z6"; // GA 측정 ID

export const pageview = (url) => {
  window.gtag("config", GA_ID, {
    page_path: url,
  });
};
