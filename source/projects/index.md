---
title: GitHub开源项目
layout: page
comments: false
---

<style>
/* Grid */
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 24px; margin: 20px 0 40px; }
/* Card */
.project-card { display: block; border-radius: 14px; padding: 28px 26px; text-decoration: none; color: inherit; transition: all .32s cubic-bezier(.25,.46,.45,.94); background: var(--card-bg, #fff); border: 1px solid var(--card-border, #eaecef); position: relative; overflow: hidden; }
.project-card::before { content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #3572b0, #50a8e8, #6ec6ff); opacity: 0; transition: opacity .3s; }
.project-card:hover { transform: translateY(-6px); box-shadow: 0 12px 36px rgba(53,114,176,.18), 0 4px 12px rgba(0,0,0,.06); border-color: transparent; }
.project-card:hover::before { opacity: 1; }
/* Card top area */
.card-top { margin-bottom: 20px; }
.card-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, rgba(53,114,176,.1), rgba(80,168,232,.08)); display: flex; align-items: center; justify-content: center; margin-bottom: 16px; font-size: 1.3em; color: #3572b0; transition: all .3s; }
.project-card:hover .card-icon { background: linear-gradient(135deg, #3572b0, #50a8e8); color: #fff; transform: scale(1.08); }
.card-title { font-size: 1.2em; font-weight: 700; margin: 0 0 8px; color: var(--text-color, #24292e); line-height: 1.3; }
.card-desc { color: var(--text-secondary, #666); font-size: .91em; line-height: 1.65; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
/* Card footer */
.card-footer { display: flex; align-items: center; gap: 8px; padding-top: 16px; border-top: 1px solid var(--divider, #eee); font-size: .84em; }
.lang-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; }
.lang-name { color: var(--text-secondary, #777); font-weight: 500; }
.card-arrow { margin-left: auto; color: var(--text-lighter, #aaa); font-size: 1.1em; transition: all .3s; }
.project-card:hover .card-arrow { color: #3572b0; transform: translateX(4px); }
/* Dark mode */
html[data-theme="dark"] .project-card { --card-bg: #161b22; --card-border: #30363d; }
html[data-theme="dark"] .project-card:hover { box-shadow: 0 12px 36px rgba(88,166,255,.12), 0 4px 12px rgba(0,0,0,.3); }
html[data-theme="dark"] .card-title { color: #e6edf3; }
html[data-theme="dark"] .card-desc { color: #8b949e; }
html[data-theme="dark"] .card-icon { background: linear-gradient(135deg, rgba(88,166,255,.12), rgba(56,139,253,.08)); color: #58a6ff; }
html[data-theme="dark"] .project-card:hover .card-icon { background: linear-gradient(135deg, #388bfd, #58a6ff); color: #fff; }
html[data-theme="dark"] .card-footer { border-top-color: #21262d; }
html[data-theme="dark"] .lang-name { color: #8b949e; }
/* Responsive */
@media (max-width: 480px) { .projects-grid { grid-template-columns: 1fr; } .project-card { padding: 22px 20px; } }
</style>

<div class="projects-grid">
  <a class="project-card" href="https://github.com/availblemy/projects/tree/main/test" target="_blank" rel="noopener">
    <div class="card-top">
      <div class="card-icon"><i class="fa fa-code"></i></div>
      <h3 class="card-title">test</h3>
      <p class="card-desc">test</p>
    </div>
    <div class="card-footer">
      <span class="lang-dot" style="background:#8b949e"></span>
      <span class="lang-name">Unknown</span>
      <span class="card-arrow"><i class="fa fa-angle-right"></i></span>
    </div>
  </a>
</div>
