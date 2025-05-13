import CONFIG from "../config";

export { transitionHelper } from "./transition-helper";

export function showFormattedDate(date, locale = CONFIG.DEFAULT_LOCALE) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function showFormattedTime(date, locale = CONFIG.DEFAULT_LOCALE) {
  return new Date(date).toLocaleTimeString(locale, {
    hour: "numeric",
    minute: "numeric",
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function createUrlWithQuery(url, params = {}) {
  const urlObj = new URL(url);

  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null) {
      urlObj.searchParams.append(key, params[key]);
    }
  });

  return urlObj.toString();
}

export function stripHtml(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
