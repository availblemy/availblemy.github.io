---
title: GitHub开源项目
layout: page
comments: false
sidebar: false
---


<style>
.projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
.project-card {
  display: flex; flex-direction: column;
  text-decoration: none; color: inherit;
  border: 1px solid #d0d7de;
  border-radius: 10px;
  padding: 20px 22px 18px;
  background: #fff;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}
.project-card:hover {
  border-color: #0969da;
  box-shadow: 0 4px 16px rgba(9,105,218,.12);
  transform: translateY(-2px);
}
.card-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
.card-icon {
  width: 40px; height: 40px; border-radius: 8px;
  background: #f6f8fa; display: flex; align-items: center; justify-content: center;
  font-size: 1.15em; color: #57606a; flex-shrink: 0;
}
.card-title { font-size: 1.08em; font-weight: 600; color: #0969da; margin: 0; line-height: 1.3; }
.project-card:hover .card-title { text-decoration: underline; }
.card-desc { font-size: .88em; color: #57606a; line-height: 1.6; margin: 0 0 14px; flex: 1; }
.card-footer { display: flex; align-items: center; gap: 6px; font-size: .82em; color: #57606a; }
.lang-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.card-arrow { margin-left: auto; opacity: .4; transition: opacity .2s, transform .2s; }
.project-card:hover .card-arrow { opacity: 1; transform: translateX(3px); }
html[data-theme="dark"] .project-card { background: #161b22; border-color: #30363d; color: #e6edf3; }
html[data-theme="dark"] .project-card:hover { border-color: #58a6ff; box-shadow: 0 4px 16px rgba(88,166,255,.12); }
html[data-theme="dark"] .card-icon { background: #21262d; color: #8b949e; }
html[data-theme="dark"] .card-title { color: #58a6ff; }
html[data-theme="dark"] .card-desc { color: #8b949e; }
html[data-theme="dark"] .card-footer { color: #8b949e; }
@media (max-width: 768px) {
  .projects-grid { grid-template-columns: 1fr; }
}
</style>
<div class="projects-grid">
  <a class="project-card" href="https://github.com/availblemy/projects/tree/main/test" target="_blank" rel="noopener">
    <div class="card-header">
      <div class="card-icon"><i class="fa-brands fa-python"></i></div>
      <h3 class="card-title">test</h3>
    </div>
    <p class="card-desc">No description.</p>
    <div class="card-footer">
      <span class="lang-dot" style="background:#3572A5"></span>
      <span class="lang-name">python</span>
      <span class="card-arrow"><i class="fa fa-arrow-right"></i></span>
    </div>
  </a>
  <a class="project-card" href="https://github.com/availblemy/projects/tree/main/test2" target="_blank" rel="noopener">
    <div class="card-header">
      <div class="card-icon"><i class="fa-solid fa-code"></i></div>
      <h3 class="card-title">test2</h3>
    </div>
    <p class="card-desc">这是一个测试项目，用于验证博客同步功能。</p>
    <div class="card-footer">
      <span class="lang-dot" style="background:#555555"></span>
      <span class="lang-name">c</span>
      <span class="card-arrow"><i class="fa fa-arrow-right"></i></span>
    </div>
  </a>
</div>