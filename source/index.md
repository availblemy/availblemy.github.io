---
title: 首页
layout: page
comments: false
---

<style>
/* ===== Hero Section ===== */
.hero { text-align: center; padding: 50px 20px 40px; background: linear-gradient(135deg, rgba(53,114,176,.06), rgba(80,168,232,.04)); border-radius: 16px; margin-bottom: 36px; }
.hero-avatar { width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, #3572b0, #50a8e8); display: inline-flex; align-items: center; justify-content: center; font-size: 2.4em; color: #fff; margin-bottom: 16px; box-shadow: 0 4px 16px rgba(53,114,176,.25); }
.hero-name { font-size: 1.7em; font-weight: 700; margin-bottom: 6px; color: var(--text-color, #24292e); }
.hero-title { font-size: .95em; color: var(--text-secondary, #666); margin-bottom: 14px; }
.hero-bio { font-size: .9em; color: var(--text-secondary, #777); max-width: 520px; margin: 0 auto 18px; line-height: 1.65; }
.hero-links { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
.hero-links a { display: inline-flex; align-items: center; gap: 5px; padding: 7px 16px; border-radius: 8px; font-size: .85em; text-decoration: none; transition: all .25s; color: #3572b0; background: rgba(53,114,176,.07); border: 1px solid rgba(53,114,176,.15); }
.hero-links a:hover { background: #3572b0; color: #fff; transform: translateY(-2px); }

/* ===== Section Headers ===== */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; padding-bottom: 10px; border-bottom: 2px solid var(--divider, #eee); }
.section-header h2 { font-size: 1.35em; margin: 0; color: var(--text-color, #24292e); display: flex; align-items: center; gap: 8px; }
.section-header h2 i { color: #3572b0; }
.section-header a { font-size: .85em; color: #3572b0; text-decoration: none; }
.section-header a:hover { text-decoration: underline; }

/* ===== Recent Posts Grid ===== */
.recent-posts-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; margin-bottom: 40px; }
.post-card { border-radius: 12px; padding: 22px; border: 1px solid var(--card-border, #eaecef); text-decoration: none; color: inherit; transition: all .28s ease; background: var(--card-bg, #fff); display: block; }
.post-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(53,114,176,.12); border-color: transparent; }
.post-card-title { font-size: 1.05em; font-weight: 600; margin: 0 0 8px; color: var(--text-color, #24292e); line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.post-card-desc { font-size: .87em; color: var(--text-secondary, #666); line-height: 1.55; margin: 0 0 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.post-card-meta { display: flex; align-items: center; gap: 10px; font-size: .8em; color: var(--text-lighter, #999); }
.post-card-cat { background: rgba(53,114,176,.08); color: #3572b0; padding: 2px 8px; border-radius: 4px; font-weight: 500; }

/* ===== Two Column Layout ===== */
.home-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 36px; }
@media (max-width: 800px) { .home-sections { grid-template-columns: 1fr; } .recent-posts-grid { grid-template-columns: 1fr; } }

/* Dark mode */
html[data-theme="dark"] .hero { background: linear-gradient(135deg, rgba(88,166,255,.06), rgba(56,139,253,.03)); }
html[data-theme="dark"] .hero-name { color: #e6edf3; }
html[data-theme="dark"] .post-card { --card-bg: #161b22; --card-border: #30363d; }
html[data-theme="dark"] .post-card:hover { box-shadow: 0 8px 24px rgba(88,166,255,.1); }
html[data-theme="dark"] .section-header { border-bottom-color: #21262d; }
html[data-theme="dark"] .post-card-title { color: #e6edf3; }
</style>

<!-- Hero -->
<div class="hero">
  <div class="hero-avatar"><i class="fa fa-shield"></i></div>
  <div class="hero-name">MalCode</div>
  <div class="hero-title">威胁情报 &amp; 恶意软件分析</div>
  <div class="hero-bio">专注于恶意软件逆向工程、威胁情报研究。擅长 PE/ELF/.NET 分析、Shellcode 解密、OLLVM 去混淆，以及 C2 协议还原。</div>
  <div class="hero-links">
    <a href="/projects/"><i class="fa fa-code"></i> 开源项目</a>
    <a href="https://github.com/availblemy" target="_blank" rel="noopener"><i class="fab fa-github"></i> GitHub</a>
    <a href="/archives/"><i class="fa fa-book-open"></i> 技术文章</a>
  </div>
</div>

<!-- Recent Projects Preview -->
<div class="home-sections">
  <div>
    <div class="section-header">
      <h2><i class="fa fa-code"></i> 最近项目</h2>
      <a href="/projects/">查看全部 →</a>
    </div>
    <div id="projects-preview" style="display:grid;gap:14px;">
      <!-- Projects loaded by JS or static -->
      <div style="padding:20px;border:1px dashed #ddd;border-radius:10px;text-align:center;color:#999;font-size:.9em;">
        <i class="fa fa-folder-open-o" style="font-size:1.5em;display:block;margin-bottom:8px;"></i>
        项目数据同步中...<br><small style="color:#bbb;">前往 <a href="/projects/" style="color:#3572b0;">项目页</a> 查看</small>
      </div>
    </div>
  </div>

  <!-- Recent Posts -->
  <div>
    <div class="section-header">
      <h2><i class="fa fa-pencil"></i> 最近文章</h2>
      <a href="/archives/">查看全部 →</a>
    </div>
    <div class="recent-posts-grid">
      <!-- Post cards will be listed here - using static HTML for now -->
      <a href="/archives/" class="post-card" style="grid-column:1/-1;text-align:center;padding:30px;color:#999;border-style:dashed;">
        <i class="fa fa-book-open" style="font-size:1.8em;display:block;margin-bottom:10px;"></i>
        浏览全部技术文章 →
      </a>
    </div>
  </div>
</div>
