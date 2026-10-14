---
title: GitHub开源项目
layout: page
comments: false
sidebar: false
---


<style>
.projects-grid { display: flex; flex-direction: column; }
.project-card { border-bottom: 1px dashed #d0d7de; padding-bottom: 24px; margin-bottom: 24px; display: block; text-decoration: none; color: inherit; transition: opacity .2s; }
.project-card:last-child { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
.project-card:hover { opacity: .8; }
html[data-theme="dark"] .project-card { border-bottom-color: #30363d; }
</style>
<div class="projects-grid">
  <a class="project-card" href="https://github.com/availblemy/projects/tree/main/test" target="_blank" rel="noopener">
    <div class="card-top">
      <div class="card-icon"><i class="fa-brands fa-python"></i></div>
      <h3 class="card-title">test</h3>
      <p class="card-desc">这里写项目简介，会自动显示在博客卡片上123。666!!!</p>
    </div>
    <div class="card-footer">
      <span class="lang-dot" style="background:#3572A5"></span>
      <span class="lang-name">python</span>
      <span class="card-arrow"><i class="fa fa-angle-right"></i></span>
    </div>
  </a>
  <a class="project-card" href="https://github.com/availblemy/projects/tree/main/test2" target="_blank" rel="noopener">
    <div class="card-top">
      <div class="card-icon"><i class="fa-solid fa-code"></i></div>
      <h3 class="card-title">test2</h3>
      <p class="card-desc">这是一个测试项目，用于验证博客同步功能。</p>
    </div>
    <div class="card-footer">
      <span class="lang-dot" style="background:#555555"></span>
      <span class="lang-name">c</span>
      <span class="card-arrow"><i class="fa fa-angle-right"></i></span>
    </div>
  </a>
</div>