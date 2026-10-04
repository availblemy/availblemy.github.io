---
name: "hexo-blog-customization"
description: "Hexo NexT博客自定义指南——文件结构、卡片网格布局、样式修改、常见坑、文章分布，方便后续快速修改"
---

# Hexo 博客自定义 Skill

## 博客环境速览

| 项 | 值 |
|---|---|
| 博客根目录 | `E:\blog\` |
| URL | `https://woshinext.top` |
| 站点名 | Next的小站 |
| 副标题 | 恶意代码分析 & 逆向工程 |
| 主题 | NexT Pisces v8.27.0 |
| 自定义样式 | `E:\blog\source\_data\styles.styl` |
| 代码高亮 | highlight.js（非 prismjs） |
| 部署 | GitHub Pages → `availblemy/availblemy.github.io.git` → `main` 分支 |
| RSS | atom + rss2，20 篇 |
| Sitemap | sitemap.xml + baidusitemap.xml |
| 搜索 | local_search（已启用） |
| 文章数 | 19 篇（2026-09-15 核对） |

> **本技能有两份副本，改动要同步：**
> - `E:\agent\work\.dsh\skills\hexo-blog-customization\SKILL.md`（工作区，rank 100 项目根）
> - `E:\blog\.dsh\skills\hexo-blog-customization\SKILL.md`（博客项目，rank 100 项目根）
>
> 因为 `E:\blog` 及其上层**没有 `.git`**，博客那份只有会话工作目录正好是 `E:\blog` 时才会被扫到。
> 想要任何目录下都能用，得装到用户级 `C:\Users\Lenovo\.dsh\skills\`（rank 400）。

---

## 一、目录结构

```
E:\blog\
├── _config.yml                         # Hexo 站点配置
├── scaffolds/                          # hexo new 模板
├── scripts/                            # 自定义脚本
├── source/
│   ├── _data/
│   │   └── styles.styl                 # ★ 所有自定义 CSS 唯一切入点
│   ├── _posts/                         # 博客文章（19篇 .md）
│   ├── about/index.md                  # 关于页面
│   ├── categories/index.md             # 分类页
│   ├── tags/index.md                   # 标签页
│   └── search/index.md                 # 本地搜索页
├── themes/next/
│   ├── _config.yml                     # NexT 主题配置
│   ├── layout/
│   │   ├── index.njk                   # 首页模板
│   │   ├── archive.njk                 # 归档页模板
│   │   ├── _macro/
│   │   │   ├── post.njk                # 文章卡片宏
│   │   │   └── post-collapse.njk       # 归档/分类列表宏
│   │   └── _partials/                  # 各类局部模板
│   └── source/css/
│       ├── _schemes/Pisces/
│       │   ├── _layout.styl            # Pisces CSS 变量定义
│       │   └── index.styl              # ☠ 含第一个卡片 padding-top: 40px
│       └── _common/components/post/
│           └── post-header.styl        # 默认居中样式
└── public/                             # hexo generate 输出（不手动改）
```

---

## 二、站点配置 key 速查（_config.yml）

```yaml
# 站点信息
title: Next的小站
subtitle: '恶意代码分析 & 逆向工程'
author: Next
language: zh-CN
timezone: 'Asia/Shanghai'
url: https://woshinext.top

# 固定链接格式：年/月/日/标题/
permalink: :year/:month/:day/:title/

# 首页分页：每页9篇，按日期倒序
index_generator:
  path: ''
  per_page: 9
  order_by: -date

# 代码高亮：highlight.js（非 prismjs）
syntax_highlighter: highlight.js

# 部署
deploy:
  type: git
  repo: https://github.com/availblemy/availblemy.github.io.git
  branch: main

# RSS Feed
feed:
  enable: true
  type: [atom, rss2]
  path: [atom.xml, rss2.xml]
  limit: 20

# Sitemap
sitemap:
  path: sitemap.xml
baidusitemap:
  path: baidusitemap.xml
```

---

## 三、主题配置 key 速查（themes/next/_config.yml）

```yaml
# Scheme 和外观
scheme: Pisces
darkmode: true
lightdark:
  enable: true
  check_supports: true

# ★ 自定义样式路径（最关键）
custom_file_path:
  style: source/_data/styles.styl

# 菜单 — 10 项，图标必须兼容 Font Awesome 5
menu:
  首页: / || fa fa-home
  归档: /archives/ || fa fa-archive
  关于: /about/ || fa fa-user
  样本分析: /categories/样本分析/ || fa fa-bug
  流量分析: /categories/流量分析/ || fa fa-network-wired
  逆向基础: /categories/逆向基础/ || fa fa-microscope
  日志分析: /categories/日志分析/ || fa fa-clipboard-list
  Web安全: /categories/Web安全/ || fa fa-globe-americas   # ⚠️ 此链接当前 404，见坑9
  其他: /categories/其他/ || fa fa-ellipsis-h
  标签: /tags/ || fa fa-tags

# 侧边栏
sidebar:
  position: left
  width_expanded: 320
  display: post

# 社交链接
social:
  GitHub: https://github.com/availblemy || fab fa-github

# 文章设置
auto_excerpt:
  enable: true
  length: 250
post_meta:
  item_text: true
  created_at: true
  categories: true
  tags: true
symbols_count_time:
  separated_meta: true
  item_text_total: true

# Follow Me 链接
follow_me:
  个人博客: https://woshinext.top || fa fa-globe
  CSDN: https://blog.csdn.net/2401_86516690?type=blog || fa fa-pencil
  看雪论坛: https://bbs.kanxue.com/homepage-1081539.htm || fa fa-shield

# 相关文章
related_posts:
  enable: true
  icon: fa fa-signs-post
  title: 相关文章

# 文本对齐
text_align:
  desktop: justify
  mobile: left

# 代码块
codeblock:
  copy_button:
    enable: true
    style: mac
  theme:
    light: default
    dark: stackoverflow-dark

# 返回顶部
back2top:
  enable: true

# 阅读进度条
reading_progress:
  enable: true
  position: top
  color: "#37c6c0"
  height: 3px

# 动画
motion:
  enable: true

# 功能开关（已启用）
pjax: true           # 无刷新加载
mediumzoom: true     # 图片点击放大
lazyload: true       # 图片懒加载
pangu: true          # 中英文空格
quicklink: true      # 预加载链接
local_search:        # 本地搜索
  enable: true
  preload: true
mermaid:             # Mermaid 图表
  enable: true

# 评论系统 — 全部关闭
# (disqus/disqusjs/changyan/livere/gitalk/giscus/waline/utterances/iso 全部 enable: false)

# 统计 — 关闭
busuanzi_count:
  enable: false

# CDN — 本地加载
vendors:
  internal: local
  plugins: cdnjs
```

---

## 四、首页 HTML 结构（选择器关键）

```html
<!-- 三个类在同一个 div 上！ -->
<div class="main-inner index posts-expand">
  <div class="post-block">          <!-- 子元素 -->
    <div class="post-header">...</div>
    <div class="post-body">...</div>
    <div class="post-footer">
      <div class="post-meta">
        <span class="post-meta-item">日期</span>
        <span class="post-meta-item">分类</span>
        <span class="post-meta-item" title="阅读时长">...</span>
        <span class="post-meta-item" title="本文字数">...</span>
      </div>
      <div class="post-tags">...</div>
    </div>
  </div>
</div>
```

### ⚠️ 最重要的坑：选择器空格

| 选择器 | 匹配 | 说明 |
|--------|------|------|
| `.main-inner.index.posts-expand` | ✅ | **无空格**，三类在同一元素 |
| `.main-inner.index .posts-expand` | ❌ | 有空格 = 找子元素，不匹配 |
| `.main-inner.index .post-block` | ✅ | **有空格**，子元素 |
| `.main-inner.index .post-body` 等 | ✅ | **有空格**，后代元素 |

---

## 五、文章分布（19 篇，2026-09-15 核对）

> **一级分类全部是单层**。早期文档里写的 `样本分析 > 木马`、`脱壳 > UPX`、`CTF > STL` 等多级分类**与实际不符**，一律以文章 front-matter 为准。

| 分类 | 篇数 | 文件（★ = 已标记 featured） |
|------|------|------------------------------|
| 样本分析 | 7 | 5-13木马分析、5-27-银狐木马分析★、Lab07-1-2-3-笔记、QuasarRAT-2、RatonRAT、elf文件木马、勒索病毒 |
| 逆向基础 | 7 | pe加载器★、手脱upx、Keygen-Crackme-wp、SCUCTF-2020-fake-exe★、SCTF-2019-Crackme-wp★、ollvm混淆—模拟执行★、用调试器结构和替换iat表来对writefile函数来hook★ |
| 其他 | 2 | openclaw-deepseek-v4-doubao-1-8部署、总结和反思 |
| 流量分析 | 1 | Wireshark流量分析基础 |
| 日志分析 | 1 | windows日志-Sysmon |
| Web 安全 | 1 | DVWA靶场练习-soc视角 ⚠️ 分类名**带空格**，导致样式与菜单双双失配，见坑9 |

合计 **19 篇**，无未分类文章。

**⚠️ 早期文档里列过的 `Lab09-01-02-03.md` 在仓库中并不存在**，别再照着找。

### ⚠️ 分类机制
**Hexo 分类完全由文章 front-matter 驱动**。写 `categories:` 即自动分类，不需要手动注册。菜单图标在 `themes/next/_config.yml` `menu:` 中配置。

**分类名一旦用了空格，会同时踩两个坑**（详见坑9）：Hexo 把空格转成连字符写进 URL 和 slug，而 CSS 选择器和菜单链接通常按"无空格"写，两边就对不上。

---

## 六、当前首页布局样式

### 6.1 网格（同一元素，无空格）
```stylus
.main-inner.index.posts-expand {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  align-items: start;
}
```

### 6.2 卡片固定尺寸
```stylus
.main-inner.index .post-block {
  width: 100%;
  height: 320px;   // 固定高度
}

// ☠ 覆盖 Pisces 主题第一个卡片的 padding-top
.main-inner.index .post-block:first-of-type {
  padding-top: 0 !important;
}
```

### 6.3 内容比例（3:2）
| 区域 | flex | 占比 |
|------|------|------|
| post-content（标题+meta） | `flex: 3` | 60% |
| post-footer（标签行） | `flex: 2` | 40% |

### 6.4 Meta 每项独占一行 + 去竖线
```stylus
.main-inner.index .post-meta {
  display: flex;
  flex-direction: column;    // 纵向排列（flex容器内block无效，必须改方向）
  align-items: center;        // 居中
  .post-meta-item {
    margin: 2px 0;
    &::before { display: none !important; }  // 去掉 | 分隔符
  }
}
```
**⚠️ 关键坑：** `.post-meta` 是 `display: flex` 容器，子元素设 `display: block` 无效！必须用 `flex-direction: column` 改排列方向。

### 6.5 隐藏元素（仅首页卡片）
```stylus
.main-inner.index .post-body { display: none !important; }
.main-inner.index .post-button { display: none !important; }
// 阅读时长不隐藏（保留显示），但去掉圆角背景框
.main-inner.index .post-meta-item[title="阅读时长"] { /* 不再隐藏 */ }
```

### 6.6 分类色条

**⚠️ 这里有两条互不相干的机制，别混：**

| 效果 | 匹配方式 | 位置 |
|------|----------|------|
| 卡片顶部色条 + meta 分类徽章底色 | **`:has([itemprop="about"] a[href*="…"])`** —— 靠卡片内的分类链接 href 匹配 | `styles.styl` L315-400 附近 |
| featured 发光边框 | **`.post-featured.cat-xxx`** —— 靠模板注入的 class | `styles.styl` L225-313 |

色条用的是 `:has()`（不是 class），每种分类要写**两条**，一条 URL 编码、一条中文：

```stylus
// 样本分析 — 淡红
.main-inner.index .post-block:has([itemprop="about"] a[href*="%E6%A0%B7%E6%9C%AC%E5%88%86%E6%9E%90"])::before,
.main-inner.index .post-block:has([itemprop="about"] a[href*="/categories/样本分析/"])::before {
  background: var(--cat-sample);
}
```

完整的 CSS 变量（2026-09-15 核对原文）：

```stylus
:root {
  --cat-sample:   #fde8e8;   // 样本分析 — 淡红
  --cat-sample-text: #c0392b;
  --cat-traffic:  #e8f4fd;   // 流量分析 — 淡蓝
  --cat-traffic-text: #2471a3;
  --cat-reverse:  #eaf7ea;   // 逆向基础 — 淡绿
  --cat-reverse-text: #1e8449;
  --cat-log:      #fef9e7;   // 日志分析 — 淡金（原 EDR对抗）
  --cat-log-text: #b7950b;
  --cat-other:    #f4ecf7;   // 其他 — 淡紫
  --cat-other-text: #7d3c98;
  --cat-web:      #fef0e5;   // Web安全 — 淡橙
  --cat-web-text: #d35400;
  --cat-default:  #f5f5f5;   // 兜底/未分类 — 淡灰
  --cat-default-text: #7f8c8d;
}
```

> 暗色模式在文件后段（约 L632-644）整组覆盖这些变量，新增分类别忘了同步加一份暗色值。

> **分类重命名记录（2026-07-18）：** `EDR对抗` → `日志分析`，图标 `fa-shield-alt` → `fa-clipboard-list`，CSS变量 `--cat-edr-*` → `--cat-log-*`。菜单、样式、选择器全部同步修改。
>
> **分类新增记录：** `Web安全`（淡橙 `--cat-web`），菜单图标 `fa fa-globe-americas`。但文章里分类名写成了带空格的 `Web 安全`，导致色条和菜单都没生效——见坑9。

### 6.7 对齐
| 页面 | 区域 | 对齐 |
|------|------|------|
| 首页卡片 | title/meta/footer | `text-align: center` |
| 归档/分类列表 | header/title | `text-align: left !important` |
| 文章内页 | title/meta | 保持 theme 默认居中 |

### 6.8 推荐文章（Featured Card）— 发光边框

**用法：** 文章 front-matter 加 `featured: true`，首页卡片自动显示发光边框。

```yaml
---
title: xxx
date: 2026-xx-xx
categories: 样本分析
featured: true    # ← 加这一行
---
```

**实现原理：**
1. **模板层** — `themes/next/layout/_macro/post.njk` 的 `<div class="post-block">` 注入分类 class：
   ```html
   <div class="post-block{% if is_index and post.featured %} post-featured{% endif %}{% if is_index and post.categories.length %} cat-{{ post.categories.first().slug }}{% endif %}">
   ```
   输出示例：`class="post-block post-featured cat-样本分析"`
2. **样式层** — `source/_data/styles.styl` 中 `.post-featured.cat-xxx` 直接匹配 class，不用 `:has()`。

**效果：**
- 2px 实线边框 + 双层光晕（内圈强 + 外圈弱），柔和发光
- 卡片放大 1.03 倍，悬停时 1.05 倍 + 上浮
- 底部有细横线分隔（`border-top: 1px solid rgba(0,0,0,.05)`）
- 阅读时长无圆角背景框（已注释掉 background/border-radius/padding）

**颜色自动适配分类：**

| 分类 | class名 | 发光颜色 |
|------|---------|---------|
| 样本分析 | `.cat-样本分析` | 🔴 红光 (`rgba(192,57,43)`) |
| 流量分析 | `.cat-流量分析` | 🔵 蓝光 (`rgba(36,113,163)`) |
| 逆向基础 | `.cat-逆向基础` | 🟢 绿光 (`rgba(30,132,73)`) |
| 日志分析 | `.cat-日志分析` | 🟡 金光 (`rgba(183,149,11)`) |
| 其他 | `.cat-其他` | 🟣 紫光 (`rgba(125,60,152)`) |
| Web安全 | `.cat-Web安全` | 🟠 橙光 (`rgba(211,84,0)`) ⚠️ **当前匹配不上**，模板产出的是 `cat-Web-安全`，见坑9 |

- 所有颜色规则加 `!important` 确保覆盖基础蓝色默认值
- 暗色模式自动调暗发光颜色
- **class 名来自 `post.categories.first().slug`**：分类名里只要含空格，Hexo 就会把空格换成 `-`，选择器必须跟着写连字符版本

**当前已标记 featured 的文章（6篇，2026-09-15 核对）：**
| 文件名 | 分类 | 发光 |
|--------|------|------|
| 5-27-银狐木马分析.md | 样本分析 | 🔴 红光 |
| pe加载器.md | 逆向基础 | 🟢 绿光 |
| SCTF-2019-Crackme-wp.md | 逆向基础 | 🟢 绿光 |
| SCUCTF-2020-fake-exe.md | 逆向基础 | 🟢 绿光 |
| ollvm混淆—模拟执行.md | 逆向基础 | 🟢 绿光 |
| 用调试器结构和替换iat表来对writefile函数来hook.md | 逆向基础 | 🟢 绿光 |

---

## 七、已知坑 & 修复记录

### 坑1：选择器空格
`.main-inner.index .posts-expand` 永远不匹配，必须写成 `.main-inner.index.posts-expand`。

### 坑2：Pisces 第一个卡片 padding-top: 40px
`themes/next/source/css/_schemes/Pisces/index.styl` L22，用 `!important` 覆盖。

### 坑3：Stylus 编译失败
多余的 `}` 会导致整个 styles.styl 编译失败 → 全部样式丢失变成纯文本。

### 坑4：Stylus 的 class 名不能用 URL 编码
`.cat-%E6%A0%B7%E6%9C%AC...` 这种**类名**会直接导致 Stylus **ParseError**，整个后续区块全部丢失。
注意区分：写在**属性选择器值**里的 URL 编码是合法的，现有代码就大量这么用——
`:has([itemprop="about"] a[href*="%E6%A0%B7%E6%9C%AC%E5%88%86%E6%9E%90"])` 没问题。

### 坑5：`:has()` 中文 href 匹配 —— 只改了一半
浏览器对 `href*="样本分析"` 这类中文属性选择器的支持不一致（与 URL 编码有关）。
**现状（2026-09-15 核对）：这条只对 featured 生效，色条并没有改。**
- **featured 发光**：已改为模板注入 `cat-{{ slug }}` class，CSS 直接匹配 class，绕开了 `:has()`
- **分类色条 + meta 徽章**：**仍然用 `:has()`**，且每种分类都写了"URL 编码 + 中文"两条选择器兜底

所以新增分类时，色条那条 `:has()` 规则还是要老老实实补上，别以为已经全换成 class 了。

### 坑6：EBUSY 错误
`hexo clean` 报 `EBUSY` = 有进程锁 `public` 目录，关掉占用进程或直接 `Remove-Item public -Recurse -Force`。

### 坑7：Font Awesome 图标版本
NexT v8 用 **FA5**，不要用 FA6 图标名（如 `fa-shield-halved`）。

### 坑8：Hexo 缓存问题
修改 styles.styl 后如果 `hexo generate` 输出没变化，需要执行 `hexo clean` 清理缓存（删除 db.json 和 public 目录）。单纯删 public 不够。

### 坑9：⚠️ 分类名里带空格 —— class 和 URL 会双双失配
这是当前**真实存在、尚未修复**的 bug。

`DVWA靶场练习-soc视角.md` 的 front-matter 写的是 `categories: Web 安全`（Web 和 安全之间有空格），而菜单和 CSS 都按无空格的 `Web安全` 写，于是：

| 环节 | 期望 | Hexo 实际产出 | 结果 |
|------|------|----------------|------|
| 归档路径 | `/categories/Web安全/` | `/categories/Web-安全/` | **菜单链接 404** |
| 卡片 class | `cat-Web安全` | `cat-Web-安全` | **色条/发光规则匹配不上** |
| 分类链接 href | `Web%E5%AE%89%E5%85%A8` | `Web-%E5%AE%89%E5%85%A8` | **`:has()` 色条选择器匹配不上** |

**排查手法**（新分类样式不生效时照这个查）：
```powershell
# 1. 看实际生成的 class
Select-String -Path E:\blog\public\index.html -Pattern 'class="post-block[^"]*"'
# 2. 看实际生成的归档目录
Get-ChildItem E:\blog\public\categories -Directory | Select-Object -ExpandProperty Name
# 3. 看菜单指向哪
Select-String -Path E:\blog\themes\next\_config.yml -Pattern 'Web安全'
```
三者对不上就是这个问题。

**修法**：把文章的 `categories: Web 安全` 改成 `categories: Web安全`（去掉空格），
然后 `hexo clean` + `hexo generate`，菜单、slug、class、href 会一次性全部对齐。
**结论：分类名永远不要带空格。**

### 坑10：文章 .md 多为 UTF-8 with BOM
`source/_posts/` 下**大部分文章开头是 `EF BB BF`（UTF-8 BOM）**，只有少数后来新建的没有。
用脚本解析 front-matter 时如果用 `encoding="utf-8"`，正则会因为开头多了个 `\ufeff` 而
匹配不到 `^---`，结果是"文章列表读出来但标题/分类全是空"这种诡异现象。

```python
open(path, encoding="utf-8-sig").read()   # ← 必须用 utf-8-sig
```

### 坑11：flex 容器内 display: block 无效
`.post-meta` 是 `display: flex` **行方向**容器，子元素设 `display: block` 不会换行！
必须用 `flex-direction: column` 才能让每项独占一行（见 6.4）。

---

## 八、修改→生成→预览流程

```powershell
cd E:\blog

# 1. 备份
Copy-Item source\_data\styles.styl source\_data\styles.styl.bak

# 2. 修改 styles.styl 或 _config.yml

# 3. 清理 + 生成
Remove-Item public -Recurse -Force -ErrorAction SilentlyContinue
Start-Sleep 1
hexo generate

# 4. 浏览器 Ctrl+F5 强制刷新验证

# 5. 确认无误后发布
hexo deploy

# 6. 删备份（确认无误后）
```
