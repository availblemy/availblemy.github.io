/**
 * sync-projects.js
 * 从 GitHub API 读取 projects 仓库的子文件夹 → 生成 source/projects/index.md
 * 
 * 数据源：https://github.com/availblemy/projects 下的子目录（每个子目录 = 一个项目）
 * 
 * 用法：
 *   本地：GITHUB_TOKEN=xxx node scripts/sync-projects.js
 *   Actions：自动从 secrets.HEXO_PROJECTS_SYNC 获取 token
 * 
 * 环境变量：
 *   GITHUB_TOKEN     — GitHub PAT（必须）
 *   GITHUB_USER      — 用户名（默认 availblemy）
 *   PROJECTS_REPO    — 项目仓库名（默认 projects）
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const USER = process.env.GITHUB_USER || 'availblemy';
const REPO = process.env.PROJECTS_REPO || 'projects';

// 图标映射（按文件夹名/语言）
const ICON_MAP = {
  python: 'fa-brands fa-python', py: 'fa-brands fa-python',
  javascript: 'fa-brands fa-js', js: 'fa-brands fa-js',
  typescript: 'fa-brands fa-js', ts: 'fa-brands fa-ts',
  go: 'fa-brands fa-golang', golang: 'fa-brands fa-golang',
  rust: 'fa-brands fa-rust', rs: 'fa-brands fa-rust',
  java: 'fa-brands fa-java', kotlin: 'fa-brands fa-jetbrains',
  c: 'fa-solid fa-code', cpp: 'fa-solid fa-code',
  'c#': 'fa-brands fa-microsoft', cs: 'fa-brands fa-microsoft',
  php: 'fa-brands fa-php', ruby: 'fa-brands fa-ruby',
  shell: 'fa-solid fa-terminal', bash: 'fa-solid fa-terminal',
  html: 'fa-brands fa-html5', css: 'fa-brands fa-css3-alt',
  lua: 'fa-solid fa-code', dart: 'fa-brands fa-dart',
  default: 'fa fa-code'
};

// 颜色映射
const COLOR_MAP = {
  python: '#3572A5', javascript: '#f1e05a', typescript: '#3178c6',
  go: '#00ADD8', rust: '#dea584', java: '#b07219',
  'c++': '#f34b7d', c: '#555555', 'c#': '#239120',
  php: '#4F5D95', ruby: '#701516', swift: '#F05138',
  shell: '#89e051', html: '#e34c26', css: '#563d7c',
  default: '#8b949e'
};

function apiGet(apiPath) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.github.com',
      path: apiPath,
      headers: {
        'User-Agent': 'hexo-blog-sync/2.0',
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
          reject(new Error(`GitHub API ${res.statusCode}: ${data.substring(0, 300)}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * 获取 projects 仓库根目录下的所有子文件夹（排除 README 等文件）
 */
async function fetchProjectDirs() {
  const items = await apiGet(`/repos/${USER}/${REPO}/contents/`);
  return items
    .filter(item => item.type === 'dir')
    .map(item => ({
      name: item.name,
      url: item.html_url,
      path: item.path
    }));
}

/**
 * 尝试读取每个子文件夹中的 README.md 作为描述
 */
async function enrichWithReadme(projects) {
  for (const p of projects) {
    try {
      const files = await apiGet(`/repos/${USER}/${REPO}/contents/${p.path}`);
      // 查找 README（不区分大小写）
      const readme = files.find(f =>
        f.name.toLowerCase().startsWith('readme') && f.name.endsWith('.md')
      );
      if (readme && readme.download_url) {
        // 下载 README 内容取第一段作为描述
        const desc = await fetchText(readme.download_url);
        p.description = extractFirstParagraph(desc);
      }
      // 检测主要语言（根据文件扩展名统计）
      p.language = detectLanguage(files.map(f => f.name));
    } catch (e) {
      // 读取失败就跳过，用默认值
      p.description = '';
      p.language = null;
    }
  }
  return projects;
}

function fetchText(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'hexo-blog-sync/2.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

/**
 * 从 Markdown 内容中提取第一段非标题文字作为描述
 */
function extractFirstParagraph(md) {
  // 去掉 front-matter (--- ... ---)
  md = md.replace(/^---[\s\S]*?---\s*/, '');
  // 去掉标题行 (# ...)
  md = md.replace(/^#+\s+.+$/gm, '');
  // 取第一个非空段落
  const lines = md.split('\n').filter(l => l.trim());
  for (const line of lines) {
    const text = line.trim();
    if (text.length > 10 && !text.startsWith('<') && !text.startsWith('!')) {
      return text.replace(/[*_`#]/g, '').substring(0, 150);
    }
  }
  return '';
}

/**
 * 根据文件名列表检测主要语言
 */
function detectLanguage(fileNames) {
  const extCount = {};
  for (const name of fileNames) {
    const ext = name.split('.').pop().toLowerCase();
    if (ext && ext !== 'md' && ext !== 'yml' && ext !== 'yaml' &&
        ext !== 'json' && ext !== 'txt' && ext !== 'lock' &&
        ext !== 'gitignore' && ext !== 'gitattributes' && name !== '.gitignore') {
      extCount[ext] = (extCount[ext] || 0) + 1;
    }
  }
  if (!Object.keys(extCount).length) return null;
  // 返回出现最多的扩展名对应的语言名
  const topExt = Object.entries(extCount).sort((a, b) => b[1] - a[1])[0][0];
  const langMap = { py: 'python', js: 'javascript', ts: 'typescript', go: 'go',
                   rs: 'rust', java: 'java', cpp: 'c++', c: 'c', cs: 'c#',
                   php: 'php', rb: 'ruby', sh: 'shell', html: 'html',
                   css: 'css', lua: 'lua', dart: 'dart', kt: 'kotlin',
                   swift: 'swift' };
  return langMap[topExt] || topExt;
}

function generateHTML(projects) {
  if (!projects.length) {
    return '<div class="projects-grid"><p style="text-align:center;color:#999;grid-column:1/-1;">No projects yet.</p></div>';
  }

  const sepStyle = `
<style>
.project-card-sep { border-bottom: 1px dashed var(--card-border, #eaecef); padding-bottom: 24px; margin-bottom: 24px; border-radius: 14px 14px 0 0; }
html[data-theme="dark"] .project-card-sep { border-bottom-color: #30363d; }
</style>`;

  const cards = projects.map(p => {
    const lang = p.language || 'Unknown';
    const langLower = (lang || '').toLowerCase();
    const color = COLOR_MAP[langLower] || COLOR_MAP.default;
    const icon = ICON_MAP[langLower] || ICON_MAP.default;
    const desc = p.description || 'No description.';
    const shortDesc = desc.length > 120 ? desc.substring(0, 117) + '...' : desc;

    const isLast = projects.indexOf(p) === projects.length - 1;
    const sepClass = isLast ? '' : ' project-card-sep';

    return `<a class="project-card${sepClass}" href="${p.url}" target="_blank" rel="noopener">
    <div class="card-top">
      <div class="card-icon"><i class="${icon}"></i></div>
      <h3 class="card-title">${escapeHtml(p.name)}</h3>
      <p class="card-desc">${escapeHtml(shortDesc)}</p>
    </div>
    <div class="card-footer">
      <span class="lang-dot" style="background:${color}"></span>
      <span class="lang-name">${escapeHtml(lang)}</span>
      <span class="card-arrow"><i class="fa fa-angle-right"></i></span>
    </div>
  </a>`;
  }).join('\n  ');

  return `${sepStyle}\n<div class="projects-grid">\n  ${cards}\n</div>`;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

async function main() {
  if (!TOKEN) {
    console.warn('[WARN] GITHUB_TOKEN not set. Skipping project sync.');
    process.exit(0);
  }

  console.log(`[1/3] Fetching project dirs from ${USER}/${REPO}...`);
  let projects = await fetchProjectDirs();
  console.log(`       Found ${projects.length} project folders`);

  console.log('[2/3] Reading README descriptions...');
  projects = await enrichWithReadme(projects);
  for (const p of projects) {
    console.log(`       - ${p.name}: lang=${p.language || '?'} desc=${(p.description || '(empty)').substring(0, 40)}...`);
  }

  console.log('[3/3] Generating projects/index.md...');
  const html = generateHTML(projects);

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
  console.log('[Done]');
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
