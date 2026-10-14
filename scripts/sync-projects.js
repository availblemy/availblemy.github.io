/**
 * sync-projects.js
 * 从 GitHub API 拉取用户仓库列表 → 生成 source/projects/index.md
 * 
 * 用法：
 *   本地：GITHUB_TOKEN=xxx node scripts/sync-projects.js
 *   Actions：自动从 secrets.HEXO_PROJECTS_SYNC 获取 token
 * 
 * 环境变量：
 *   GITHUB_TOKEN     — GitHub PAT（必须，用于认证提高速率限制）
 *   GITHUB_USER      — 用户名（默认 availblemy）
 *   PROJECTS_EXCLUDE — 排除的仓库（逗号分隔，默认 availblemy.github.io）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const USER = process.env.GITHUB_USER || 'availblemy';
const EXCLUDE = new Set((process.env.PROJECTS_EXCLUDE || `${USER}.github.io`).split(',').map(s => s.trim().toLowerCase()));

// 语言颜色映射（GitHub 风格）
const LANG_COLORS = {
  javascript: '#f1e05a', typescript: '#3178c6', python: '#3572A5',
  java: '#b07219', 'c++': '#f34b7d: #00ADD8', go: '#00ADD8',
  rust: '#dea584', c: '#555555', 'c#': '#239120', ruby: '#701516',
  php: '#4F5D95', swift: '#F05138', kotlin: '#A97BFF', dart: '#00B4AB',
  shell: '#89e051', vimscript: '#199f4b', lua: '#000080',
  html: '#e34c26', css: '#563d7c', json: '', markdown: '',
  default: '#8b949e'
};

// 图标映射
const LANG_ICONS = {
  javascript: 'fa-brands fa-js', typescript: 'fa-brands fa-js',
  python: 'fa-brands fa-python', java: 'fa-brands fa-java',
  'c++': 'fa-solid fa-code', go: 'fa-brands fa-golang',
  rust: 'fa-brands fa-rust', c: 'fa-solid fa-code',
  'c#': 'fa-brands fa-microsoft', ruby: 'fa-brands fa-ruby',
  php: 'fa-brands fa-php', swift: 'fa-brands fa-swift',
  kotlin: 'fa-brands fa-jetbrains', dart: 'fa-brands fa-dart',
  shell: 'fa-solid fa-terminal', lua: 'fa-solid fa-code',
  html: 'fa-brands fa-html5', css: 'fa-brands fa-css3-alt',
  default: 'fa fa-code'
};

function apiGet(url) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: url,
      headers: {
        'User-Agent': 'hexo-blog-sync/1.0',
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    if (TOKEN) opts.headers['Authorization'] = `token ${TOKEN}`;

    https.get(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try { resolve(JSON.parse(data)); }
          catch(e) { reject(new Error(`JSON parse error: ${e.message}`)); }
        } else {
          reject(new Error(`GitHub API ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

async function fetchRepos() {
  const allRepos = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const repos = await apiGet(`/users/${USER}/repos?page=${page}&per_page=${perPage}&sort=updated&type=public`);
    if (!repos.length || !Array.isArray(repos)) break;
    allRepos.push(...repos);
    if (repos.length < perPage) break;
    page++;
  }

  return allRepos
    .filter(r => !r.fork && !EXCLUDE.has(r.name.toLowerCase()))
    .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at));
}

function generateHTML(repos) {
  if (!repos.length) {
    return '<div class="projects-grid"><p style="text-align:center;color:#999;grid-column:1/-1;">暂无项目</p></div>';
  }

  const cards = repos.map(repo => {
    const lang = repo.language || 'Unknown';
    const langLower = lang.toLowerCase();
    const color = LANG_COLORS[langLower] || LANG_COLORS.default;
    const icon = LANG_ICONS[langLower] || LANG_ICONS.default;
    const desc = repo.description || 'No description.';
    // 截断描述避免过长
    const shortDesc = desc.length > 120 ? desc.substring(0, 117) + '...' : desc;

    return `<a class="project-card" href="${repo.html_url}" target="_blank" rel="noopener">
    <div class="card-top">
      <div class="card-icon"><i class="${icon}"></i></div>
      <h3 class="card-title">${escapeHtml(repo.name)}</h3>
      <p class="card-desc">${escapeHtml(shortDesc)}</p>
    </div>
    <div class="card-footer">
      <span class="lang-dot" style="background:${color}"></span>
      <span class="lang-name">${escapeHtml(lang)}</span>
      <span class="card-arrow"><i class="fa fa-angle-right"></i></span>
    </div>
  </a>`;
  }).join('\n  ');

  return `<div class="projects-grid">\n  ${cards}\n</div>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  if (!TOKEN) {
    console.warn('[WARN] GITHUB_TOKEN not set. Skipping project sync.');
    process.exit(0);
  }

  console.log(`[1/3] Fetching repos for ${USER}...`);
  const repos = await fetchRepos();
  console.log(`       Found ${repos.length} repos (forks & ${Array.from(EXCLUDE).join(',')} excluded)`);

  console.log('[2/3] Generating projects/index.md...');
  const html = generateHTML(repos);

  const frontMatter = `---
title: GitHub开源项目
layout: page
comments: false
sidebar: false
---

`;

  const outputPath = path.join(__dirname, '..', 'source', 'projects', 'index.md');
  fs.writeFileSync(outputPath, frontMatter + html, 'utf-8');
  console.log(`       Written: ${outputPath}`);

  console.log('[3/3] Done!');
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
