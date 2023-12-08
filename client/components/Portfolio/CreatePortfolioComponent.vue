<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPortfolios"]);

const createPortfolio = async (content: string) => {
  try {
    await fetchy(`/api/portfolio/${content}`, "POST", {
      body: { content },
    });
  } catch (_) {
    return;
  }
  emit("refreshPortfolios");
  emptyForm();
};

const emptyForm = () => {
  content.value = "";
};
</script>

<template>
  <form @submit.prevent="createPortfolio(content)">
    <label for="content">Create a Portfolio</label>
    <textarea id="content" v-model="content" placeholder="Portfolio Name" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create Post</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

textarea {
  font-family: inherit;
  font-size: inherit;
  height: 6em;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
