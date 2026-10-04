/**
 * sync-projects.js
 * 
 * 从 availblemy/projects 仓库拉取各子目录的项目信息，
 * 生成 source/_data/projects.yml 和 source/projects/*/index.md
 * 
 * 环境变量：
 *   GITHUB_TOKEN — GitHub PAT（需 repo 权限）
 * 
 * 项目仓库结构（单仓库多项目）：
 *   availblemy/projects/
 *     ├── pe-parser/
 *     │   ├── README.md
 *     │   └── ...
 *     ├── yara-rules/
 *     │   ├── README.md
 *     │   └── ...
 *     └── ...
 */

const https = require('https');
const fs   = require('fs');
const path = require('path');

const OWNER = 'availblemy';
const REPO  = 'projects';
const TOKEN = process.env.GITHUB_TOKEN;

if (!TOKEN) {
  console.error('❌ GITHUB_TOKEN 未设置');
  process.exit(1);
}

function apiRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'hexo-sync-projects',
        'Authorization': `token ${TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`Parse error: ${data.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
  });
}

async function getRepoTree() {
  // 获取 main 分支的目录树
  const data = await apiRequest(
    `https://api.github.com/repos/${OWNER}/${REPO}/git/trees/main?recursive=1`
  );
  return data.tree;
}

async function getFileContent(filePath) {
  const data = await apiRequest(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${filePath}`
  );
  if (data.content) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  return '';
}

async function getRepoInfo() {
  const data = await apiRequest(
    `https://api.github.com/repos/${OWNER}/${REPO}`
  );
  return {
    stars: data.stargazers_count || 0,
    updated: data.pushed_at ? data.pushed_at.slice(0, 10) : '',
  };
}

async function main() {
  console.log('📦 开始同步 availblemy/projects ...');

  // 1. 获取仓库树，找到所有项目子目录
  const tree = await getRepoTree();
  
  // 提取顶层目录名（排除根目录的文件如 README.md, .gitignore 等）
  const topDirs = new Set();
  for (const item of tree) {
    const parts = item.path.split('/');
    if (parts.length >= 1 && !item.path.startsWith('.') && item.type === 'tree') {
      topDirs.add(parts[0]);
    }
  }
  // 也检测包含 README.md 的顶层目录
  const readmeDirs = new Set();
  for (const item of tree) {
    const parts = item.path.split('/');
    if (parts.length === 2 && parts[1].toLowerCase() === 'readme.md') {
      readmeDirs.add(parts[0]);
    }
  }
  
  const projectDirs = [...new Set([...topDirs, ...readmeDirs])].sort();
  console.log(`找到 ${projectDirs.length} 个项目目录: ${projectDirs.join(', ')}`);

  // 2. 获取仓库整体信息
  const repoInfo = await getRepoInfo();

  // 3. 对每个项目目录，拉取 README.md 和推断语言
  const projects = [];
  for (const dir of projectDirs) {
    console.log(`  → 处理 ${dir} ...`);
    
    // 获取 README
    let readme = '';
    try {
      readme = await getFileContent(`${dir}/README.md`);
    } catch {
      // 没有 README 也行
    }

    // 获取目录内容推断语言
    let lang = '';
    try {
      const dirContent = await apiRequest(
        `https://api.github.com/repos/${OWNER}/${REPO}/contents/${dir}`
      );
      const files = Array.isArray(dirContent) ? dirContent : [];
      const extMap = {
        '.py': 'Python', '.js': 'JavaScript', '.ts': 'TypeScript',
        '.c': 'C', '.cpp': 'C++', '.go': 'Go', '.rs': 'Rust',
        '.yar': 'YARA', '.yara': 'YARA', '.rb': 'Ruby',
        '.java': 'Java', '.sh': 'Shell', '.ps1': 'PowerShell',
      };
      for (const f of files) {
        const ext = path.extname(f.name).toLowerCase();
        if (extMap[ext]) { lang = extMap[ext]; break; }
      }
    } catch {}

    // 从 README 第一行提取描述
    let desc = '';
    if (readme) {
      const firstLine = readme.split('\n').find(l => l.trim().startsWith('#'));
      if (firstLine) {
        desc = firstLine.replace(/^#+\s*/, '').trim();
      }
      // 如果第一行是标题，取第二行非空作为描述
      const lines = readme.split('\n').filter(l => l.trim());
      if (lines.length >= 2 && lines[0].startsWith('#')) {
        desc = lines[1].replace(/^[-–—]\s*/, '').trim() || desc;
      }
    }

    projects.push({
      name: dir,
      desc: desc || dir,
      lang: lang || '-',
      stars: 0,  // 单仓库内子目录无独立 star
      updated: repoInfo.updated,
      url: `https://github.com/${OWNER}/${REPO}/tree/main/${dir}`,
      readme: readme || '',
    });
  }

  // 4. 生成 source/_data/projects.yml
  const ymlLines = ['# 由 sync-projects.js 自动生成，请勿手动编辑', 'projects:'];
  for (const p of projects) {
    ymlLines.push(`  - name: "${p.name}"`);
    ymlLines.push(`    desc: "${p.desc.replace(/"/g, '\\"')}"`);
    ymlLines.push(`    lang: "${p.lang}"`);
    ymlLines.push(`    stars: ${p.stars}`);
    ymlLines.push(`    updated: "${p.updated}"`);
    ymlLines.push(`    url: "${p.url}"`);
    // README 用 | 块标量
    ymlLines.push('    readme: |');
    for (const line of p.readme.split('\n')) {
      ymlLines.push(`      ${line}`);
    }
    ymlLines.push('');
  }

  const ymlPath = path.join('source', '_data', 'projects.yml');
  fs.mkdirSync(path.dirname(ymlPath), { recursive: true });
  fs.writeFileSync(ymlPath, ymlLines.join('\n'), 'utf-8');
  console.log(`✅ 写入 ${ymlPath}`);

  // 5. 生成各项目详情页 source/projects/<name>/index.md
  for (const p of projects) {
    const dir = path.join('source', 'projects', p.name);
    fs.mkdirSync(dir, { recursive: true });

    const md = [
      '---',
      `title: ${p.name}`,
      'layout: page',
      'comments: false',
      '---',
      '',
      `<div class="project-detail-header" style="margin-bottom:1.5em">\`,
      `  <a href="${p.url}" target="_blank" rel="noopener" style="color:var(--primary-color)">\`,
      `    availblemy/projects/${p.name}`,
      `    · ${p.lang}`,
      `  </a>`,
      '</div>',
      '',
      p.readme || '(暂无 README)',
      '',
      `<p><a href="${p.url}" target="_blank" rel="noopener">🔗 查看完整源码 → GitHub</a></p>`,
    ].join('\n');

    fs.writeFileSync(path.join(dir, 'index.md'), md, 'utf-8');
    console.log(`✅ 写入 source/projects/${p.name}/index.md`);
  }

  console.log(`\n🎉 同步完成！${projects.length} 个项目已更新。`);
}

main().catch(e => {
  console.error('❌ 同步失败:', e.message);
  process.exit(1);
});
