import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import nimbus, {
  defineConfig as defineNimbusConfig,
} from "@cloudflare/nimbus-docs";
import { tableScroll } from "@cloudflare/nimbus-docs/markdown";

const nimbusConfig = defineNimbusConfig({
  // CHANGE_ME: your site's canonical origin (no trailing slash). Drives
  // canonical URLs, absolute OG image URLs, robots.txt, sitemap, and the
  // links in /llms.txt — leaving the placeholder breaks all of them.
  site: "https://tonywoo.github.io/wugong-zhi-ri",
  // 站点标题与描述
  title: "无工之日",
  // CHANGE_ME: a one-line description of your docs — used for meta + OG.
  description: "硬核科幻小说：AI 与机器人接管苦役的二十六年，与一份没有错误日志的事故报告",
  locale: "zh-CN",
  // 私有库地址；公开前 header 会显示 GitHub 图标链接
  github: "https://github.com/TonyWoo/wugong-zhi-ri",
  socialImageAlt: "Nimbus documentation preview",
});

export default defineConfig({
  // nimbus:adapter
  output: "static",
  // GitHub Pages 项目站点：https://tonywoo.github.io/wugong-zhi-ri/
  base: "/wugong-zhi-ri/",
  redirects: {
    "/ch01": "/vol1/ch01",
    "/ch02": "/vol1/ch02",
    "/ch03": "/vol1/ch03",
    "/ch04": "/vol1/ch04",
    "/ch05": "/vol1/ch05",
    "/ch06": "/vol1/ch06",
    "/ch07": "/vol1/ch07",
    "/ch08": "/vol1/ch08",
    "/ch09": "/vol2/ch09",
    "/ch10": "/vol2/ch10",
    "/ch11": "/vol2/ch11",
    "/ch12": "/vol2/ch12",
    "/ch13": "/vol2/ch13",
    "/ch14": "/vol2/ch14",
    "/ch15": "/vol2/ch15",
    "/ch16": "/vol2/ch16",
    "/ch17": "/vol3/ch17",
    "/ch18": "/vol3/ch18",
    "/ch19": "/vol3/ch19",
    "/ch20": "/vol3/ch20",
    "/ch21": "/vol3/ch21",
    "/ch22": "/vol3/ch22",
    "/ch23": "/vol3/ch23",
    "/ch24": "/vol3/ch24",
  },
  // Tailwind v4 via its Vite plugin (the integration Astro recommends for
  // Tailwind v4 — replaces the PostCSS plugin, which doesn't build under
  // Astro 7's Vite 8 bundler).
  vite: {
    plugins: [tailwindcss()],
  },
  // Hover-prefetch link targets so full-page navigations feel instant without
  // a client-side router.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "hover",
  },
  integrations: [
    nimbus(nimbusConfig, {
      // Authoring rules are opt-in by design — your repo, your taste. The
      // two below are the load-bearing pair: frontmatter has to validate
      // against the content schema for the page to render properly, and
      // broken internal links are 404s for your readers. Add the others
      // (heading hierarchy, code-block language, style, etc.) when you're
      // ready to enforce them — see `nimbus-docs lint --help`.
      rules: {
        "nimbus/frontmatter-shape": "error",
        "nimbus/internal-link": "error",
      },
      // Wrap wide tables so they scroll instead of overflowing the page
      // (styled by `.nb-table-scroll` in src/styles/prose.css).
      markdown: {
        hastPlugins: [tableScroll()],
      },
    }),
  ],
});
