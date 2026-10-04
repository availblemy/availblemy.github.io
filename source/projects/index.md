---
title: 开源项目
layout: page
comments: false
---

<style>
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin: 20px 0; }
.project-card { display: block; border: 1px solid var(--card-border, #e1e4e8); border-radius: var(--card-radius, 12px); padding: 20px; text-decoration: none; color: inherit; transition: all .3s ease; background: var(--card-bg, #fff); }
.project-card:hover { transform: translateY(-4px); box-shadow: var(--card-shadow-hover, 0 6px 24px rgba(0,0,0,.12)); border-color: var(--primary-color, #3572b0); }
.project-card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; font-size: 1.15em; font-weight: 600; color: var(--primary-color, #3572b0); }
.project-card-desc { color: var(--text-secondary, #7f8c8d); font-size: .92em; margin-bottom: 14px; line-height: 1.5; }
.project-card-meta { display: flex; align-items: center; gap: 12px; font-size: .82em; color: var(--text-secondary, #7f8c8d); }
.project-lang { background: var(--primary-dim, rgba(53,114,176,.08)); padding: 2px 8px; border-radius: 4px; font-weight: 500; }
.project-card-link { margin-top: 12px; font-size: .85em; color: var(--primary-color, #3572b0); }
html[data-theme="dark"] .project-card { --card-bg: #161b22; --card-border: #30363d; }
html[data-theme="dark"] .project-card:hover { --card-border: #58a6ff; }
</style>

<div class="projects-grid">
  <a class="project-card" href="https://github.com/availblemy/projects/tree/main/test" target="_blank" rel="noopener">
    <div class="project-card-header">
      <i class="fa fa-code"></i>
      <span>test</span>
    </div>
    <div class="project-card-desc">test</div>
    <div class="project-card-meta">
      <span class="project-lang">Unknown</span>
    </div>
    <div class="project-card-link">GitHub &rarr;</div>
  </a>
</div>
