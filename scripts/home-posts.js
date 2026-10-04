// Inject recent posts HTML into custom homepage via locals
hexo.extend.filter.register('template_locals', function(locals) {
  const posts = locals.site.posts.sort('date', -1).limit(4);
  const items = posts.map(post => {
    const title = post.title || '(无标题)';
    const url = hexo.config.root + post.path;
    const excerpt = (post.excerpt || post.content || '')
      .replace(/<[^>]+>/g, '').trim().substring(0, 80);
    const date = post.date ? post.date.format('YYYY-MM-DD') : '';
    const cat = post.categories.length ? post.categories.first().name : '';
    
    return `<a href="${url}" class="post-card">
        <h3 class="post-card-title">${title}</h3>
        <p class="post-card-desc">${excerpt}</p>
        <div class="post-card-meta">
          ${cat ? `<span class="post-card-cat">${cat}</span>` : ''}
          <span>${date}</span>
        </div>
      </a>`;
  }).join('\n      ');
  
  locals.recent_posts_html = items;
});
