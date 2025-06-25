---
layout: home
title: Welcome to My Blog
---

<div class="post-list">
{% for post in site.posts %}
  <div class="post-item">
    <h3 class="post-title">
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h3>
    <div class="post-meta">
      <span class="post-date">{{ post.date | date: "%b %d, %Y" }}</span>
    </div>
  </div>
{% endfor %}
</div>

<div class="archive-link">
  <a href="/archive">→ view archive</a>
</div>
