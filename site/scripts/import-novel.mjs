// ============================================================
// import-novel.mjs ， 把 chapters/ 的小说书稿导入为 nimbus 站点页面
// 用法：site/ 目录下 node scripts/import-novel.mjs
// 由 `prebuild` 自动调用，保证构建永远用最新书稿
// 输出 28 页：落地页 1 + 卷页 3 + 24 章（每章一页）
// 章节按卷分文件夹（vol1/vol2/vol3），Nimbus 侧边栏按文件夹生成卷分组，卷、章分层。
// ============================================================
import { readdirSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(ROOT, '..', 'chapters');
const OUT_DIR = join(ROOT, 'src', 'content', 'docs');

// ---- 极简 YAML 头解析（字段都是单行 key: value，值可能带引号） ----
function parseHead(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { head: {}, body: text };
  const head = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i < 0) continue;
    let v = line.slice(i + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'");
    }
    head[line.slice(0, i).trim()] = v;
  }
  return { head, body: text.slice(m[0].length) };
}

// 正文标题处理：书稿第一行 `# 第X章 ……` 与 frontmatter 标题重复，导入时去掉；
// 其余一级标题降为二级，避免一页两个 H1
const stripTitleH1 = (body) => body.replace(/^\s*# .*\r?\n/, '');
const demoteH1 = (body) => body.replace(/^# /gm, '## ');

function frontmatter({ title, description, order, label, group }) {
  const esc = (s) => `"${String(s ?? '').replace(/"/g, '\\"')}"`;
  return [
    '---',
    `title: ${esc(title)}`,
    `description: ${esc(description)}`,
    'sidebar:',
    `  order: ${order}`,
    `  label: ${esc(label || title)}`,
    '  group:',
    `    label: ${esc(group)}`,
    '---',
    '',
  ].join('\n');
}

// 卷定义：文件夹、卷名、章号范围、侧边栏分组顺序
const VOLUMES = [
  { dir: 'vol1', label: '第一卷 无咎', lo: 1, hi: 8, order: 100, intro: '2026 到 2032。代码先行，机器人进厂又进家。每一份事故报告都写着同一句话：无责任方。' },
  { dir: 'vol2', label: '第二卷 耦合', lo: 9, hi: 16, order: 200, intro: '2033 到 2039。系统入医，四张网彼此相连。单系统可证、双系统可控、三系以上，原理上不可预测。' },
  { dir: 'vol3', label: '第三卷 留白', lo: 17, hi: 24, order: 300, intro: '2039 台风夜到 2052。43 条人命之后，人类与机器重签契约：接管苦役，不接管主权。' },
];
const volumeOf = (n) => VOLUMES.find((v) => n >= v.lo && n <= v.hi);

function main() {
  rmSync(OUT_DIR, { recursive: true, force: true });
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(CONTENT_DIR)
    .filter((f) => /^ch\d+\.md$/.test(f))
    .sort();

  let order = 0;
  let pages = 0;
  const chapters = [];

  const write = (relPath, fm, body) => {
    const full = join(OUT_DIR, relPath);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, fm + demoteH1(stripTitleH1(body)).replace(/\s+$/, '') + '\n');
    pages++;
  };

  for (const f of files) {
    const slug = f.replace(/\.md$/, '');
    const num = parseInt(slug.slice(2), 10);
    const { head, body } = parseHead(readFileSync(join(CONTENT_DIR, f), 'utf8'));
    if (!body.trim()) {
      console.log(`skip 空页面: ${f}`);
      continue;
    }
    const title = head.title || slug;
    const vol = volumeOf(num);
    chapters.push({ slug, title, num, vol });
    write(
      `${vol.dir}/${slug}/index.md`,
      frontmatter({
        title,
        description: `《无工之日》${title}`,
        order: num * 10,
        group: vol.label,
      }),
      body,
    );
  }

  // 卷页：文件夹 index 即侧边栏分组头（label 取 sidebar.group.label），正文列本卷章节
  for (const vol of VOLUMES) {
    const items = chapters
      .filter((c) => c.vol === vol)
      .map((c) => `- [${c.title}](./${c.slug}/)`)
      .join('\n');
    write(
      `${vol.dir}/index.md`,
      frontmatter({
        title: vol.label,
        description: `《无工之日》${vol.label}`,
        order: vol.order,
        label: vol.label,
        group: vol.label,
      }),
      [vol.intro, '', items, ''].join('\n'),
    );
  }

  // 落地页 index.md（order 最小，排最前）
  const volList = (vol) => {
    const items = chapters
      .filter((c) => c.vol === vol)
      .map((c) => `- [${c.title}](./${vol.dir}/${c.slug}/)`)
      .join('\n');
    return [`## ${vol.label}`, '', items, ''].join('\n');
  };
  write(
    'index.md',
    frontmatter({
      title: '无工之日',
      description: '硬核科幻小说：AI 与机器人接管苦役的二十六年，与一份没有错误日志的事故报告',
      order: -100,
      label: '全书导读',
      group: '开篇',
    }),
    [
      '> 如果没人错、没机器错，这 43 个人是怎么死的？',
      '',
      '作者：Tony Wu。硬核科幻小说，三卷 24 章。故事发生在深圳，中国的机器人与人工智能之城。',
      '',
      '2026 年，AI 写代码已是日常。此后二十六年，人形机器人接管不人道的流水线，智能体接管基础编程，照护机器人走进千家万户，AI 药物把绝症一个个拖回慢性病，人类一步步把苦役交出去。',
      '',
      '代价藏在事故里：每一份事故报告的结论都是「无责任方」。单个系统可证、两个系统可控、三个以上的正确系统耦合在一起时，结果原理上不可预测，调查组把它叫作**三系问题**。',
      '',
      '2039 年台风夜，交通、医疗、照护、能源四张网各自做出了最优决策，合在一起死了 43 个人，日志里没有一行错误。距离四张网的最终决策权移交机器的「大接管日」只剩 87 天，调查必须在那之前回答：错的到底是什么？',
      '',
      '终局不是停下机器。是改约，机器接管苦役，不接管主权。此约名为**留白计划**。',
      '',
      volList(VOLUMES[0]),
      volList(VOLUMES[1]),
      volList(VOLUMES[2]),
    ].join('\n'),
  );

  console.log(`import-novel: 导入完成，${chapters.length} 章，共 ${pages} 页`);
}

main();
