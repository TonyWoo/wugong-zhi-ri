#!/usr/bin/env python3
"""把 chapters/ch01..24.md 装配成单文件 manuscript.md（供 Pandoc 构建 PDF/EPUB）。

装配规则（对齐《白话软件架构设计》的 export 管线思路，针对小说的扁平章节结构简化）：
- 开头生成扉页：书名（Pandoc 不编号标记 {-}）+ 作者 + 一句话题引。
- 每卷之前插入卷名页（H1），Pandoc EPUB 按 H1 切分，卷名页即分卷扉页。
- 章节正文原样拼接：章节首行 `# 第X章 ……` 即 H1，章内小节为 H2，
  与 --toc-depth=2 对齐。
- frontmatter（title 行）在装配时剥离，标题以正文首行 H1 为准。

用法：python3 tools/assemble_manuscript.py [输出文件]
默认输出仓库根 manuscript.md。
"""
import re
import sys
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHAPTERS = ROOT / "chapters"
OUT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "manuscript.md"

VOLUMES = [
    (1, 8, "第一卷 无咎"),
    (9, 16, "第二卷 耦合"),
    (17, 24, "第三卷 留白"),
]


def parse_chapter(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", text, re.S)
    if not m:
        raise ValueError(f"bad frontmatter: {path}")
    meta = {}
    for line in m.group(1).split("\n"):
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip().strip('"')
    return meta, m.group(2).strip("\n")


def main():
    files = sorted(CHAPTERS.glob("ch*.md"))
    if len(files) != 24:
        raise SystemExit(f"期望 24 章，实际 {len(files)} 章")

    parts = []
    parts.append("# 无工之日 {-}\n\nTony Wu\n\n> 如果没人错、没机器错，这 43 个人是怎么死的？\n")

    for lo, hi, vol_title in VOLUMES:
        parts.append(f"# {vol_title}\n")
        for f in files:
            num = int(f.stem[2:])
            if lo <= num <= hi:
                meta, body = parse_chapter(f)
                if not body.startswith("# "):
                    raise SystemExit(f"{f.name} 正文首行应为 H1 章标题，实际：{body[:30]!r}")
                parts.append(body + "\n")

    OUT.write_text("\n".join(parts), encoding="utf-8")
    han = len(re.findall(r"[一-鿿]", OUT.read_text(encoding="utf-8")))
    print(f"assembled -> {OUT} （{len(files)} 章，汉字约 {han}）")


if __name__ == "__main__":
    main()
