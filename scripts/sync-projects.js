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

  // Language colors (GitHub style)
  var langColors = {
    'Python': '#3572A5', 'JavaScript': '#f1e05a', 'TypeScript': '#2b7489',
    'Go': '#00ADD8', 'Rust': '#dea584', 'C': '#555555', 'C++': '#f34b7d',
    'Java': '#b07219', 'Ruby': '#701516', 'PHP': '#4F5D95',
    'C#': '#178600', 'Swift': '#F05138', 'Kotlin': '#A97BFF',
    'Unknown': '#8b949e'
  };

  // Category icons mapping (by name keywords)
  function getIcon(name) {
    var n = name.toLowerCase();
    if (/pe|parse|bin|file|format/.test(n)) return 'fa-file-code-o';
    if (/malware|analys|scan|detect|threat|security/.test(n)) return 'fa-shield';
    if (/web|site|blog|page|frontend/.test(n)) return 'fa-globe';
    if (/tool|util|cli|helper/.test(n)) return 'fa-wrench';
    if (/bot|auto|sync|workflow/.test(n)) return 'fa-cogs';
    if (/game|gui|visual/.test(n)) return 'fa-gamepad';
    return 'fa-code';
  }

  // Generate index.md with enhanced card HTML
  var cardsHtml = projectData.map(function (p) {
    var icon = getIcon(p.name);
    var langColor = langColors[p.lang] || langColors['Unknown'];
    return '  <a class="project-card" href="' + p.url + '" target="_blank" rel="noopener">\n' +
      '    <div class="card-top">\n' +
      '      <div class="card-icon"><i class="fa ' + icon + '"></i></div>\n' +
      '      <h3 class="card-title">' + p.name + '</h3>\n' +
      '      <p class="card-desc">' + p.desc + '</p>\n' +
      '    </div>\n' +
      '    <div class="card-footer">\n' +
      '      <span class="lang-dot" style="background:' + langColor + '"></span>\n' +
      '      <span class="lang-name">' + p.lang + '</span>\n' +
      '      <span class="card-arrow"><i class="fa fa-angle-right"></i></span>\n' +
      '    </div>\n' +
      '  </a>';
  }).join('\n');

  var mdContent = '---\ntitle: GitHub开源项目\nlayout: page\ncomments: false\n---\n\n' +
    '<style>\n' +
    '/* Grid */\n' +
    '.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin: 20px 0 40px; }\n' +
    '/* Card */\n' +
    '.project-card { display: block; border-radius: 14px; padding: 28px 26px; text-decoration: none; color: inherit; transition: all .32s cubic-bezier(.25,.46,.45,.94); background: var(--card-bg, #fff); border: 1px solid var(--card-border, #eaecef); position: relative; overflow: hidden; }\n' +
    '.project-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #3572b0, #50a8e8, #6ec6ff); opacity: 0; transition: opacity .3s; }\n' +
    '.project-card:hover { transform: translateY(-6px); box-shadow: 0 12px 36px rgba(53,114,176,.18), 0 4px 12px rgba(0,0,0,.06); border-color: transparent; }\n' +
    '.project-card:hover::before { opacity: 1; }\n' +
    '/* Card top area */\n' +
    '.card-top { margin-bottom: 20px; }\n' +
    '.card-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, rgba(53,114,176,.1), rgba(80,168,232,.08)); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 1.3em; color: #3572b0; transition: all .3s; }\n' +
    '.project-card:hover .card-icon { background: linear-gradient(135deg, #3572b0, #50a8e8); color: #fff; transform: scale(1.08); }\n' +
    '.card-title { font-size: 1.2em; font-weight: 700; margin: 0 0 8px; color: var(--text-color, #24292e); line-height: 1.3; }\n' +
    '.card-desc { color: var(--text-secondary, #666); font-size: .91em; line-height: 1.65; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }\n' +
    '/* Card footer */\n' +
    '.card-footer { display: flex; align-items: center; gap: 8px; padding-top: 16px; border-top: 1px solid var(--divider, #eee); font-size: .84em; }\n' +
    '.lang-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }\n' +
    '.lang-name { color: var(--text-secondary, #777); font-weight: 500; }\n' +
    '.card-arrow { margin-left: auto; color: var(--text-lighter, #aaa); font-size: 1.1em; transition: all .3s; }\n' +
    '.project-card:hover .card-arrow { color: #3572b0; transform: translateX(4px); }\n' +
    '/* Dark mode */\n' +
    'html[data-theme="dark"] .project-card { --card-bg: #161b22; --card-border: #30363d; }\n' +
    'html[data-theme="dark"] .project-card:hover { box-shadow: 0 12px 36px rgba(88,166,255,.12), 0 4px 12px rgba(0,0,0,.3); }\n' +
    'html[data-theme="dark"] .card-title { color: #e6edf3; }\n' +
    'html[data-theme="dark"] .card-desc { color: #8b949e; }\n' +
    'html[data-theme="dark"] .card-icon { background: linear-gradient(135deg, rgba(88,166,255,.12), rgba(56,139,253,.08)); color: #58a6ff; }\n' +
    'html[data-theme="dark"] .project-card:hover .card-icon { background: linear-gradient(135deg, #388bfd, #58a6ff); color: #fff; }\n' +
    'html[data-theme="dark"] .card-footer { border-top-color: #21262d; }\n' +
    'html[data-theme="dark"] .lang-name { color: #8b949e; }\n' +
    '/* Responsive */\n' +
    '@media (max-width: 480px) { .projects-grid { grid-template-columns: 1fr; } .project-card { padding: 22px 20px; } }\n' +
    '</style>\n\n' +
    '<div class="projects-grid">\n' + cardsHtml + '\n</div>\n';

  var outPath = path2.join(__dirname, '..', 'source', 'projects', 'index.md');
  fs2.writeFileSync(outPath, mdContent, 'utf-8');
  console.log('[done] generated ' + outPath + ' with ' + projectData.length + ' projects');
}

main().catch(function (e) {
  console.error('[fatal]', e.message);
  process.exit(1);
});
