<script setup lang="ts">
import { ref } from "vue";
const props = defineProps(["article"]);
const url = ref(props.article?.url);
</script>

<template>
  <div class="title">
    <a :href="props.article.url" target="_blank" style="text-decoration: none">{{ props.article.title }}</a>
  </div>
  <img :src="props.article.banner_image" style="width: 200px; height: auto" />
  <p>{{ props.article.summary }}</p>
  <div class="base">
    <article class="timestamp">
      <p>{{ props.article.time_published }}</p>
    </article>
  </div>
</template>

<style scoped>
p {
  margin: 0em;
}

/* Example styles for news article titles */
.title {
  font-size: 24px; /* Adjust the font size */
  font-weight: bold; /* Bold font */
  color: #333; /* Text color */
  margin-bottom: 10px; /* Optional: Spacing below the title */
  /* Other styles such as text-align, font-family, etc. */
}

/* Hover effect example */
.title:hover {
  color: #ff6600; /* Change color on hover */
  /* Other hover effects if desired */
}
menu {
  list-style-type: none;
  display: flex;
  flex-direction: row;
  gap: 1em;
  padding: 0;
  margin: 0;
}

.timestamp {
  display: flex;
  justify-content: flex-end;
  font-size: 0.9em;
  font-style: italic;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.base article:only-child {
  margin-left: auto;
}
</style>
