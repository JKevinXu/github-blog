---
layout: home
title: Welcome to My Blog
---

# Welcome to My GitHub Blog

This is where I share my thoughts on technology, programming, and other topics that interest me.

## Recent Posts

{% for post in site.posts limit:5 %}
  <div class="post-preview">
    <h2>
      <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
    </h2>
    <span class="post-date">{{ post.date | date: "%B %d, %Y" }}</span>
    {{ post.excerpt }}
    <a href="{{ post.url | relative_url }}">Read more...</a>
  </div>
  <hr>
{% endfor %}

[View all posts](/archive)
