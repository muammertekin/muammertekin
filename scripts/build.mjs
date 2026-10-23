// Builds the SVGs the profile README shows, in a dark and a light version each:
//   assets/header-*.svg   name card
//   assets/projects/*.svg one card per project
//   assets/stats-*.svg    last 12 months of activity, from the GitHub API
//
// The stats need a token that can read private repositories (GH_TOKEN), because almost
// all of the work lives in them. Without one, only the header and the project cards are rebuilt.
//
//   GH_TOKEN=$(gh auth token) node scripts/build.mjs

import { mkdir, writeFile } from 'node:fs/promises';

const LOGIN = 'muammertekin';
const OUT = new URL('../assets/', import.meta.url);

// Same palette as muammertekin.com.
const THEMES = {
  dark: {
    bg: '#0a0a0c', panel: '#131418', chip: '#1b1c21', edge: '#24252b', edgeTop: '#33343b',
    text: '#f3f3f5', soft: '#b1b3bb', muted: '#7d808a', dot: '#ffffff', dotOpacity: 0.09,
    halo: '#ffffff', haloOpacity: 0.06, accent: '#ffb547', track: '#202126',
  },
  light: {
    bg: '#f4f4f6', panel: '#ffffff', chip: '#f0f0f3', edge: '#e2e2e7', edgeTop: '#ffffff',
    text: '#111216', soft: '#474a53', muted: '#6f727c', dot: '#111216', dotOpacity: 0.13,
    halo: '#ffffff', haloOpacity: 1, accent: '#b86e00', track: '#e6e6ea',
  },
};

const SANS = `ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace`;

// Flutter projects carry generated iOS/Android/desktop runner code; it says nothing about
// what was written by hand, so it stays out of the language breakdown.
const SCAFFOLD = new Set(['C++', 'CMake', 'C', 'Swift', 'Objective-C', 'Kotlin', 'Ruby', 'HTML']);
const LANG_COLORS = {
  Dart: '#00B4AB', TypeScript: '#3178C6', JavaScript: '#F1E05A', Python: '#3572A5',
  CSS: '#663399', Shell: '#89E051', PHP: '#4F5D95', PLpgSQL: '#336790',
};

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function frame(t, { width, height, title, body, extraStyle = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(title)}">
<title>${esc(title)}</title>
<style>
  .sans{font-family:${SANS}} .mono{font-family:${MONO}}
  .rise{animation:rise .8s cubic-bezier(.2,.75,.2,1) backwards}
  @keyframes rise{from{opacity:0;transform:translateY(8px)}}
  ${extraStyle}
  @media (prefers-reduced-motion: reduce){*{animation:none!important}}
</style>
<defs>
  <pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse">
    <circle cx="11" cy="11" r="1.1" fill="${t.dot}" fill-opacity="${t.dotOpacity}"/>
  </pattern>
  <radialGradient id="fade" cx="50%" cy="38%" r="65%">
    <stop offset="35%" stop-color="#fff"/><stop offset="100%" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="dotmask"><rect width="100%" height="100%" fill="url(#fade)"/></mask>
  <radialGradient id="halo" cx="50%" cy="0%" r="60%">
    <stop offset="0%" stop-color="${t.halo}" stop-opacity="${t.haloOpacity}"/><stop offset="100%" stop-color="${t.halo}" stop-opacity="0"/>
  </radialGradient>
  <clipPath id="card"><rect width="${width}" height="${height}" rx="24"/></clipPath>
</defs>
<g clip-path="url(#card)">
  <rect width="${width}" height="${height}" fill="${t.bg}"/>
  <rect width="${width}" height="${height}" fill="url(#halo)"/>
  <rect width="${width}" height="${height}" fill="url(#dots)" mask="url(#dotmask)"/>
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="23.5" fill="none" stroke="${t.edge}"/>
${body}
</svg>
`;
}

function header(t) {
  const caretLine = 'shipping labellingo';
  const caretX = 196 + 20 + caretLine.length * 8.45 + 4;
  const body = `
<g class="rise">
  <rect x="150" y="44" width="900" height="292" rx="20" fill="${t.panel}" fill-opacity=".9" stroke="${t.edge}"/>
  <path d="M170 44.5 H1030" stroke="${t.edgeTop}"/>
  <circle cx="178" cy="66" r="6" fill="#ff5f57"/><circle cx="198" cy="66" r="6" fill="#febc2e"/><circle cx="218" cy="66" r="6" fill="#28c840"/>
  <text x="600" y="70.5" text-anchor="middle" class="mono" font-size="13" fill="${t.muted}">hello.md</text>
  <path d="M150 88 H1050" stroke="${t.edge}"/>
</g>
<text x="196" y="138" class="mono rise" style="animation-delay:.15s" font-size="13.5" letter-spacing="2.2" fill="${t.accent}">MOBILE &amp; BACKEND DEVELOPER</text>
<text x="193" y="200" class="sans rise" style="animation-delay:.25s" font-size="60" font-weight="600" letter-spacing="-1.8" fill="${t.text}">Muammer Tekin</text>
<text x="196" y="244" class="sans rise" style="animation-delay:.35s" font-size="22" fill="${t.soft}">I build mobile apps, and the systems behind them.</text>
<g class="rise" style="animation-delay:.45s">
  <text x="196" y="298" class="mono" font-size="14" fill="${t.muted}"><tspan fill="${t.accent}">›</tspan>  ${caretLine}</text>
  <rect class="caret" x="${caretX.toFixed(1)}" y="285" width="8.5" height="17" rx="1.5" fill="${t.accent}"/>
</g>
<g class="rise" style="animation-delay:.55s">
  <rect x="806" y="112" width="208" height="70" rx="15" fill="${t.chip}" stroke="${t.edge}"/>
  <circle class="pulse" cx="830" cy="136" r="9" fill="${t.accent}" fill-opacity=".25"/>
  <circle cx="830" cy="136" r="4" fill="${t.accent}"/>
  <text x="846" y="140.5" class="mono" font-size="12" fill="${t.muted}">now building</text>
  <text x="824" y="166" class="sans" font-size="19" font-weight="600" letter-spacing="-.3" fill="${t.text}">Labellingo</text>
</g>
<text x="1014" y="298" text-anchor="end" class="mono rise" style="animation-delay:.6s" font-size="13" fill="${t.muted}">konya, turkey</text>`;
  return frame(t, {
    width: 1200, height: 380, title: 'Muammer Tekin — mobile & backend developer. I build mobile apps, and the systems behind them.', body,
    extraStyle: `.caret{animation:blink 1.1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
  .pulse{transform-box:fill-box;transform-origin:center;animation:pulse 2.4s ease-out infinite}
  @keyframes pulse{0%{transform:scale(.6);opacity:1}100%{transform:scale(1.9);opacity:0}}`,
  });
}

// The projects shown as cards in the README, in this order.
const PROJECTS = [
  {
    slug: 'labellingo', name: 'Labellingo', label: 'AI · FOOD & COSMETICS', meta: 'labellingo.com',
    lines: ['Snap any ingredients label, in any language, and read it', 'in yours: allergens flagged, every additive explained.'],
    stack: ['Flutter', 'NestJS', 'MongoDB', 'Claude API'],
  },
  {
    slug: 'vibesager', name: 'Vibesager', label: 'AI · CHAT ANALYSIS', meta: 'ios · android · web',
    lines: ['Upload a chat screenshot and see the red and green flags,', 'with three replies written in the vibe you pick.'],
    stack: ['Flutter', 'Supabase', 'Firebase', 'Next.js'],
  },
];

function card(t, p) {
  let cx = 40;
  const chips = p.stack.map((s) => {
    const w = 24 + s.length * 7.9;
    const g = `<rect x="${cx}" y="184" width="${w.toFixed(1)}" height="28" rx="14" fill="${t.chip}" stroke="${t.edge}"/>
  <text x="${(cx + w / 2).toFixed(1)}" y="202.5" text-anchor="middle" class="mono" font-size="13" fill="${t.soft}">${esc(s)}</text>`;
    cx += w + 8;
    return g;
  }).join('\n  ');
  const body = `
<g class="rise">
  <text x="40" y="52" class="mono" font-size="12" letter-spacing="1.8" fill="${t.accent}">${esc(p.label)}</text>
  <text x="560" y="52" text-anchor="end" class="mono" font-size="12" fill="${t.muted}">${esc(p.meta)}</text>
  <text x="38" y="100" class="sans" font-size="36" font-weight="600" letter-spacing="-.9" fill="${t.text}">${esc(p.name)}</text>
  ${p.lines.map((l, i) => `<text x="40" y="${136 + i * 24}" class="sans" font-size="17" fill="${t.soft}">${esc(l)}</text>`).join('\n  ')}
</g>
<g class="rise" style="animation-delay:.15s">
  ${chips}
</g>`;
  return frame(t, { width: 600, height: 240, title: `${p.name}: ${p.lines.join(' ')} Built with ${p.stack.join(', ')}.`, body });
}

function stats(t, s) {
  const metrics = [
    [s.commits.toLocaleString('en-US'), 'commits'],
    [s.prs.toLocaleString('en-US'), 'pull requests'],
    [String(s.repos), 'active repositories'],
    [`${s.langs[0]?.pct ?? 0}%`, `of the code is ${(s.langs[0]?.name ?? '').toLowerCase()}`],
  ];
  const max = Math.max(1, ...s.months.map((m) => m.count));
  const barW = 30, gap = 14, baseY = 212, barMax = 118, x0 = 1152 - s.months.length * (barW + gap) + gap;
  let lx = 48;
  const legend = s.langs.map((l) => {
    const g = `<circle cx="${lx + 5}" cy="291" r="5" fill="${l.color}"/><text x="${lx + 16}" y="295.5" class="mono" font-size="12.5" fill="${t.soft}">${esc(l.name)} <tspan fill="${t.muted}">${l.pct}%</tspan></text>`;
    lx += 34 + (l.name.length + String(l.pct).length + 2) * 7.6;
    return g;
  }).join('\n');
  let bx = 48;
  const bar = s.langs.map((l) => {
    const w = Math.max(3, (l.pct / 100) * 1104);
    const r = `<rect x="${bx.toFixed(1)}" y="252" width="${w.toFixed(1)}" height="10" fill="${l.color}"/>`;
    bx += w;
    return r;
  }).join('');

  const body = `
<text x="48" y="62" class="mono" font-size="13.5" letter-spacing="2.2" fill="${t.accent}">LAST 12 MONTHS</text>
<text x="1152" y="62" text-anchor="end" class="mono" font-size="12" fill="${t.muted}">mostly private repositories · updated ${s.updated}</text>
${metrics.map(([v, label], i) => {
  const x = 48 + (i % 2) * 250, y = 128 + Math.floor(i / 2) * 82;
  return `<g class="rise" style="animation-delay:${(i * 0.08).toFixed(2)}s"><text x="${x}" y="${y}" class="sans" font-size="40" font-weight="600" letter-spacing="-1.2" fill="${t.text}">${esc(v)}</text>
<text x="${x + 2}" y="${y + 24}" class="mono" font-size="12.5" fill="${t.muted}">${esc(label)}</text></g>`;
}).join('\n')}
${s.months.map((m, i) => {
  const h = Math.max(3, (m.count / max) * barMax), x = x0 + i * (barW + gap), last = i === s.months.length - 1;
  return `<g class="rise" style="animation-delay:${(0.2 + i * 0.04).toFixed(2)}s">
  <rect x="${x}" y="${baseY - barMax}" width="${barW}" height="${barMax}" rx="6" fill="${t.track}" fill-opacity=".55"/>
  <rect x="${x}" y="${(baseY - h).toFixed(1)}" width="${barW}" height="${h.toFixed(1)}" rx="6" fill="${t.accent}" fill-opacity="${last ? 1 : (0.35 + 0.55 * (m.count / max)).toFixed(2)}"/>
  <text x="${x + barW / 2}" y="${baseY + 20}" text-anchor="middle" class="mono" font-size="11" fill="${last ? t.accent : t.muted}">${m.label}</text>
</g>`;
}).join('\n')}
<clipPath id="langbar"><rect x="48" y="252" width="1104" height="10" rx="5"/></clipPath>
<g clip-path="url(#langbar)">${bar}</g>
${legend}`;
  return frame(t, {
    width: 1200, height: 330,
    title: `Last 12 months: ${s.commits} commits, ${s.prs} pull requests, ${s.repos} active repositories. Languages: ${s.langs.map((l) => `${l.name} ${l.pct}%`).join(', ')}`,
    body,
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gh(path, attempt = 1) {
  // The search API has a tight secondary rate limit; spacing the calls out avoids most hits.
  if (path.startsWith('search/')) await sleep(2500);
  const res = await fetch(`https://api.github.com/${path}`, {
    headers: { Authorization: `Bearer ${process.env.GH_TOKEN}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
  });
  if ((res.status === 403 || res.status === 429) && attempt < 4) {
    await sleep(Number(res.headers.get('retry-after') ?? 60) * 1000);
    return gh(path, attempt + 1);
  }
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function collectStats() {
  const now = new Date();
  const day = (d) => d.toISOString().slice(0, 10);
  const yearAgo = new Date(now); yearAgo.setUTCFullYear(now.getUTCFullYear() - 1);

  // One search per month: the search API caps results at 1000 items, but total_count is exact.
  const months = [];
  for (let i = 11; i >= 0; i--) {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const to = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 0));
    const { total_count } = await gh(`search/commits?q=author:${LOGIN}+committer-date:${day(from)}..${day(to)}&per_page=1`);
    months.push({ label: from.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }).toLowerCase(), count: total_count });
  }
  const { total_count: commits } = await gh(`search/commits?q=author:${LOGIN}+committer-date:>${day(yearAgo)}&per_page=1`);
  const { total_count: prs } = await gh(`search/issues?q=author:${LOGIN}+type:pr+created:>${day(yearAgo)}&per_page=1`);

  const repos = [];
  for (let page = 1; ; page++) {
    const batch = await gh(`user/repos?affiliation=owner&per_page=100&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }
  const active = repos.filter((r) => !r.fork && r.size > 0 && new Date(r.pushed_at) > yearAgo);

  const bytes = {};
  for (const r of active) {
    for (const [lang, n] of Object.entries(await gh(`repos/${r.full_name}/languages`))) {
      if (!SCAFFOLD.has(lang)) bytes[lang] = (bytes[lang] ?? 0) + n;
    }
  }
  const total = Object.values(bytes).reduce((a, b) => a + b, 0) || 1;
  const sorted = Object.entries(bytes).sort((a, b) => b[1] - a[1]);
  const top = sorted.slice(0, 5).map(([name, n]) => ({ name, pct: Math.round((100 * n) / total), color: LANG_COLORS[name] ?? '#8b8d96' }));
  const rest = 100 - top.reduce((a, l) => a + l.pct, 0);
  if (rest > 0) top.push({ name: 'Other', pct: rest, color: '#8b8d96' });

  return { commits, prs, repos: active.length, months, langs: top.filter((l) => l.pct > 0), updated: day(now) };
}

await mkdir(new URL('projects/', OUT), { recursive: true });
// A failed stats run keeps yesterday's card instead of failing the whole build.
const data = process.env.GH_TOKEN ? await collectStats().catch((e) => (console.error(e.message), null)) : null;
for (const [name, t] of Object.entries(THEMES)) {
  await writeFile(new URL(`header-${name}.svg`, OUT), header(t));
  for (const p of PROJECTS) await writeFile(new URL(`projects/${p.slug}-${name}.svg`, OUT), card(t, p));
  if (data) await writeFile(new URL(`stats-${name}.svg`, OUT), stats(t, data));
}
console.log(data ? `stats: ${JSON.stringify(data)}` : 'stats skipped, the existing card is kept');
