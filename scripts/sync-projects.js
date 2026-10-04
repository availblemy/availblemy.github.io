/**
 * sync-projects.js
 * 从 availblemy/projects 仓库拉取各子目录的项目信息，
 * 直接生成 source/projects/index.md（含卡片网格）
 *
 * 环境变量：GITHUB_TOKEN — GitHub PAT（需 repo 权限）
 */

const https = require('https');
const fs2 = require('fs');
const path2 = require('path');

const OWNER = 'availblemy';
const REPO = 'projects';

function api(urlPath) {
  return new Promise((resolve, reject) => {
    const url = 'https://api.github.com' + urlPath;
    const opts = {
      headers: {
        'User-Agent': 'sync-projects',
        Accept: 'application/vnd.github.v3+json',
        Authorization: 'Bearer ' + process.env.GITHUB_TOKEN,
      },
    };
    https.get(url, opts, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error('GitHub API ' + res.statusCode + ': ' + data.slice(0, 200)));
        }
      });
    }).on('error', reject);
  });
}

async function getReadme(repoPath) {
  try {
    const contents = await api('/repos/' + OWNER + '/' + REPO + '/contents/' + repoPath + '/README.md');
    if (contents.content) {
      return Buffer.from(contents.content, 'base64').toString('utf-8');
    }
  } catch (e) {
    console.warn('  [warn] cannot get ' + repoPath + '/README.md: ' + e.message);
  }
  return null;
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('[error] GITHUB_TOKEN not set');
    process.exit(1);
  }

  console.log('[info] fetching from ' + OWNER + '/' + REPO + '...');

  let items;
  try {
    items = await api('/repos/' + OWNER + '/' + REPO + '/contents/');
  } catch (e) {
    console.error('[error] cannot access ' + OWNER + '/' + REPO + ': ' + e.message);
    process.exit(1);
  }

  const projects = items.filter(function (item) { return item.type === 'dir'; });
  console.log('[info] found ' + projects.length + ' projects');

  const projectData = [];
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    console.log('[info] processing: ' + p.name);

    let lang = 'Unknown';
    try {
      const files = await api('/repos/' + OWNER + '/' + REPO + '/contents/' + p.name);
      const extMap = {
        '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript',
        '.go': 'Go', '.rs': 'Rust', '.c': 'C', '.cpp': 'C++',
        '.java': 'Java', '.rb': 'Ruby', '.php': 'PHP',
        '.cs': 'C#', '.swift': 'Swift', '.kt': 'Kotlin',
      };
      const srcFiles = files.filter(function (f) { return Object.keys(extMap).indexOf(path2.extname(f.name)) !== -1; });
      if (srcFiles.length > 0) {
        const extCounts = {};
        srcFiles.forEach(function (f) {
          const e = path2.extname(f.name);
          extCounts[e] = (extCounts[e] || 0) + 1;
        });
        const entries = Object.entries(extCounts).sort(function (a, b) { return b[1] - a[1]; });
        lang = extMap[entries[0][0]];
      }
    } catch (e) { /* ignore */ }

    let desc = p.name;
    const readme = await getReadme(p.name);
    if (readme) {
      const lines = readme.split('\n').filter(function (l) { return l.trim() && !l.startsWith('#'); });
      desc = (lines[0] || '').trim().slice(0, 120) || p.name;
    }

    projectData.push({
      name: p.name,
      desc: desc,
      lang: lang,
      url: 'https://github.com/' + OWNER + '/' + REPO + '/tree/main/' + p.name,
    });

    await new Promise(function (r) { setTimeout(r, 300); });
  }

  // Generate index.md with embedded card HTML
  var cardsHtml = projectData.map(function (p) {
    return '  <a class="project-card" href="' + p.url + '" target="_blank" rel="noopener">\n' +
      '    <div class="project-card-header">\n' +
      '      <i class="fa fa-code"></i>\n' +
      '      <span>' + p.name + '</span>\n' +
      '    </div>\n' +
      '    <div class="project-card-desc">' + p.desc + '</div>\n' +
      '    <div class="project-card-meta">\n' +
      '      <span class="project-lang">' + p.lang + '</span>\n' +
      '    </div>\n' +
      '    <div class="project-card-link">GitHub &rarr;</div>\n' +
      '  </a>';
  }).join('\n');

  var mdContent = '---\ntitle: 开源项目\nlayout: page\ncomments: false\n---\n\n' +
    '<style>\n.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin: 20px 0; }\n' +
    '.project-card { display: block; border: 1px solid var(--card-border, #e1e4e8); border-radius: var(--card-radius, 12px); padding: 20px; text-decoration: none; color: inherit; transition: all .3s ease; background: var(--card-bg, #fff); }\n' +
    '.project-card:hover { transform: translateY(-4px); box-shadow: var(--card-shadow-hover, 0 6px 24px rgba(0,0,0,.12)); border-color: var(--primary-color, #3572b0); }\n' +
    '.project-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 1.15em; font-weight: 600; color: var(--primary-color, #3572b0); }\n' +
    '.project-card-desc { color: var(--text-secondary, #7f8c8d); font-size: .92em; margin-bottom: 14px; line-height: 1.5; }\n' +
    '.project-card-meta { display: flex; align-items: center; gap: 12px; font-size: .82em; color: var(--text-secondary, #7f8c8d); }\n' +
    '.project-lang { background: var(--primary-dim, rgba(53,114,176,.08)); padding: 2px 8px; border-radius: 4px; font-weight: 500; }\n' +
    '.project-card-link { margin-top: 12px; font-size: .85em; color: var(--primary-color, #3572b0); }\n' +
    'html[data-theme="dark"] .project-card { --card-bg: #161b22; --card-border: #30363d; }\n' +
    'html[data-theme="dark"] .project-card:hover { --card-border: #58a6ff; }\n' +
    '</style>\n\n' +
    '<div class="projects-grid">\n' + cardsHtml + '\n</div>\n';

  var outPath = path.join(__dirname, '..', 'source', 'projects', 'index.md');
  fs2.writeFileSync(outPath, mdContent, 'utf-8');
  console.log('[done] generated ' + outPath + ' with ' + projectData.length + ' projects');
}

main().catch(function (e) {
  console.error('[fatal]', e.message);
  process.exit(1);
});
