#!/usr/bin/env python3
"""把 chapters/ch01..24.md 装配成单文件 manuscript.md（供 Pandoc 构建 PDF/EPUB）。

装配规则（对齐《白话软件架构设计》的 export 管线思路，针对小说的扁平章节结构简化）：
- 开头生成扉页：书名（Pandoc 不编号标记 {-}）+ 作者 + 一句话题引。
- 每卷之前插入卷名页（H1），卷在目录中为一级。
- 章节正文拼接时整体降一级：章题 H1→H2、章内小节顺移（H2→H3），
  使目录里卷、章分层（--toc-depth=2 显示卷+章）；EPUB 用 --split-level=2 按章切分。
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


def demote_headings(body):
    """标题整体降一级（围栏代码块内不动）。"""
    out = []
    in_fence = False
    for ln in body.split("\n"):
        if ln.lstrip().startswith("```"):
            in_fence = not in_fence
        elif not in_fence and re.match(r"^#{1,5}\s", ln):
            ln = "#" + ln
        out.append(ln)
    return "\n".join(out)


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
                parts.append(demote_headings(body) + "\n")

    OUT.write_text("\n".join(parts), encoding="utf-8")
    han = len(re.findall(r"[一-鿿]", OUT.read_text(encoding="utf-8")))
    print(f"assembled -> {OUT} （{len(files)} 章，汉字约 {han}）")


if __name__ == "__main__":
    main()
