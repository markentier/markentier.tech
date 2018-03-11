layout: default.liquid
title: home
published_date: 2018-03-10 23:42:00 +0000
---
{% for post in collections.posts.pages %}
<article class="index_listing_post">
  <a href="{{ post.permalink }}">
    <h1>{{ post.title }}</h1>
    {{ post.excerpt }}
  </a>
</article>
{% endfor %}
