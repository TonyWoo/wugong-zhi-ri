# 无工之日

硬核科幻小说 · Tony Wu

📖 在线阅读：https://tonywoo.github.io/wugong-zhi-ri/

> 如果没人错、没机器错，这 43 个人是怎么死的？

2026 年，AI 写代码已是日常。此后二十六年，人形机器人接管不人道的流水线，智能体接管基础编程，照护机器人走进千家万户，AI 药物把绝症一个个拖回慢性病——人类一步步把苦役交出去。

代价藏在事故里：每一份事故报告的结论都是「无责任方」。单个系统可证、两个系统可控、三个以上的正确系统耦合在一起时，结果原理上不可预测——调查组把它叫作**三系问题**。

2039 年台风夜，交通、医疗、照护、能源四张网各自做出了最优决策，合在一起死了 43 个人，日志里没有一行错误。距离四张网的最终决策权移交机器的「大接管日」只剩 87 天，调查必须在那之前回答：错的到底是什么？

终局不是停下机器。是改约——机器接管苦役，不接管主权。此约名为**留白计划**。

## 结构

三卷 24 章：第一卷《无咎》、第二卷《耦合》、第三卷《留白》。
现在时调查（2039–2040）与事故档案闪回（2026–2038）交错，尾声至 2052 年。

- `WRITING.md` — 写作口径圣经（人物 / 时间线 / 技术口径 / 禁用设定）
- `outline/OUTLINE.md` — 24 章细纲
- `outline/fact-anchors-2026.md` — 2026 年现实事实锚点（推演起点坐标）
- `chapters/` — 正文

## 构建（对齐《白话软件架构设计》的管线）

- **网页版**：Astro + Nimbus Docs 开源库，源码在 `site/`，push 到 main 后 GitHub Actions 自动构建并部署到上面的在线阅读地址。本地预览：`cd site && npm ci && npm run dev`（prebuild 会从 `chapters/` 自动导入最新书稿）。
- **PDF / EPUB**：同一条 Actions 管线的 `build-books` job：`tools/assemble_manuscript.py` 把 24 章装配为 `manuscript.md`，再用 Pandoc + XeLaTeX（Noto Sans CJK）构建 PDF、用 `epub-meta.yaml` + `epub-style.css`（正文首行缩进 2em）构建 EPUB，产物以 artifact `books-pdf-epub` 形式保留 90 天，在 Actions 运行页面下载。
- **封面**：尚未定稿。定稿后把 `images/cover.jpg` 与 `cover.tex` 放入仓库，并在 workflow 的 build-books 步骤启用注释里预留的 `--include-before-body` / `--epub-cover-image` 参数即可。
