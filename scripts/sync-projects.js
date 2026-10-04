/**
 * sync-projects.js
 *
 * 从 availblemy/projects 仓库拉取各子目录的项目信息，
 * 直接生成 source/projects/index.md（含卡片网格）
 *
 * 环境变量：
 *   GITHUB_TOKEN — GitHub PAT（需 repo 权限）
 *
 * 用法：
 *   node scripts/sync-projects.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OWNER = 'availblemy';
const REPO = 'projects';

// ── GitHub API helper ──────────────────────────────────────
function api(path) {
  return new Promise((resolve, reject) => {
    const url = `https://api.github.com${path}`;
    const opts = {
      headers: {
        'User-Agent': 'sync-projects',
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    };
    https.get(url, opts, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`GitHub API ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
}

// ── 获取 README 内容 ────────────────────────────────────────
async function getReadme(repoPath) {
  try {
    // 使用 Contents API 获取 README.md 的 base64 编码内容
    const contents = await api(`/repos/${OWNER}/${REPO}/contents/${repoPath}/README.md`);
    if (contents.content) {
      return Buffer.from(contents.content, 'base64').toString('utf-8');
    }
  } catch (e) {
    console.warn(`  [warn] 无法获取 ${repoPath}/README.md: ${e.message}`);
  }
  return null;
}

// ── 主流程 ──────────────────────────────────────────────────
async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('[error] 缺少 GITHUB_TOKEN 环境变量');
    process.exit(1);
  }

  console.log(`[info] 正在从 ${OWNER}/${REPO} 拉取项目列表...`);

  // 获取仓库根目录，找出所有子目录（每个子目录 = 一个项目）
  let items;
  try {
    items = await api(`/repos/${OWNER}/${REPO}/contents/`);
  } catch (e) {
    console.error(`[error] 无法访问 ${OWNER}/${REPO} 仓库: ${e.message}`);
    process.exit(1);
  }

  // 过滤出目录类型的项目
  const projects = items.filter((item) => item.type === 'dir');
  console.log(`[info] 发现 ${projects.length} 个项目`);

  if (projects.length === 0) {
    console.warn('[warn] 未发现任何项目目录，生成空页面');
  }

  // 收集项目数据
  const projectData = [];
  for (const p of projects) {
    console.log(`[info] 处理: ${p.name}`);
    
    // 尝试获取语言信息（通过查看目录内容推断）
    let lang = 'Unknown';
    try {
      const files = await api(`/repos/${OWNER}/${REPO}/contents/${p.name}`);
      const extMap = {
        '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript',
        '.go': 'Go', '.rs': 'Rust', '.c': 'C', '.cpp': 'C++',
        '.java': 'Java', '.rb': 'Ruby', '.php': 'PHP',
        '.cs': 'C#', '.swift': 'Swift', '.kt': 'Kotlin',
      };
      // 找最常见的源码扩展名
      const srcFiles = files.filter(f => path.extname(f.name) in extMap);
      if (srcFiles.length > 0) {
        const extCounts = {};
        srcFiles.forEach(f => {
          const e = path.extname(f.name);
          extCounts[e] = (extCounts[e] || 0) + 1;
        });
        const topExt = Object.entries(extCounts).sort((a, b) => b[1] - a[1])[0][0];
        lang = extMap[topExt];
      }
    } catch (e) {
      // 忽略
    }

    // 获取 README 第一行作为描述
    let desc = p.name;
    const readme = await getReadme(p.name);
    if (readme) {
      // 取第一个非空、非标题行的内容
      const lines = readme.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      desc = lines[0]?.trim().slice(0, 120) || p.name;
    }

    projectData.push({
      name: p.name,
      desc: desc,
      lang: lang,
      url: `https://github.com/${OWNER}/${REPO}/tree/main/${p.name}`,
    });

    // 避免 API 限流
    await new Promise(r => setTimeout(r, 300));
  }

  // ── 生成 index.md ────────────────────────────────────────
  const cardsHtml = projectData.map(p => `  <a class="project-card" href="${p.url}" target="_blank" rel="noopener">
    <div class="project-card-header">
      <i class="fa fa-code"></i>
      <span>${p.name}</span>
    </div>
    <div class="project-card-desc">${p.desc}</div>
    <div class="project-card-meta">
      <span class="project-lang">${p.lang}</span>
    </div>
    <div class="project-card-link">GitHub →</div>
  </a>`).join('\n');

  const mdContent = `---
title: 开源项目
layout: page
comments: false
---

<style>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin: 20px 0;
}
.project-card {
  display: block;
  border: 1px solid var(--card-border, #e1e4e8);
  border-radius: var(--card-radius, 12px);
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all .3s ease;
  background: var(--card-bg, #fff);
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--card-shadow-hover, 0 6px 24px rgba(0,0,0,.12));
  border-color: var(--primary-color, #3572b0);
}
.project-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  font-size: 1.15em;
  font-weight: 600;
  color: var(--primary-color, #3572b0);
}
.project-card-desc {
  color: var(--text-secondary, #7f8c8d);
  font-size: .92em;
  margin-bottom: 14px;
  line-height: 1.5;
}
.project-card-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: .82em;
  color: var(--text-secondary, #7f8c8d);
}
.project-lang {
  background: var(--primary-dim, rgba(53,114,176,.08));
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.project-card-link {
  margin-top: 12px;
  font-size: .85em;
  color: var(--primary-color, #3572b0);
}
html[data-theme="dark"] .project-card {
  --card-bg: #161b22;
  --card-border: #30363d;
}
html[data-theme="dark"] .project-card:hover {
  --card-border: #58a6ff;
}
</style>

<div class="projects-grid">
${cardsHtml}
</div>
`;

  const outPath = path.join(__dirname, '..', 'source', 'projects', 'index.md');
  fs.writeFileSync(outPath, mdContent, 'utf-8');
  console.log(`\n[done] 已生成 ${outPath}，包含 ${projectData.length} 个项目`);
}

main().catch(e => {
  console.error('[fatal]', e.message);
  process.exit(1);
});
