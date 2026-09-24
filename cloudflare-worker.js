export default {
  async fetch(request) {
    const cookie = request.headers.get("Cookie") || "";
    const hasLang = /(?:^|;\s*)site_lang=(ru|kk)\b/.test(cookie);

    // Country is available at Cloudflare edge.
    const country = request.cf?.country || "";
    const defaultLang = country === "KZ" ? "kk" : "ru";

    const response = await fetch(request);

    // Only set the default once. Manual RU/ҚАЗ choice is then preserved.
    if (!hasLang && (response.headers.get("content-type") || "").includes("text/html")) {
      const headers = new Headers(response.headers);
      headers.append(
        "Set-Cookie",
        `site_lang=${defaultLang}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
      );
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return response;
  }
};
