<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const content = ref("");
const emit = defineEmits(["refreshPortfolios"]);

const createPortfolio = async (content: string) => {
  try {
    await fetchy(`/api/portfolios`, "POST", {
      body: { name: content, isPublic: true },
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
    <textarea id="content" v-model="content" placeholder="Portfolio Name" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Create a New Portfolio</button>
  </form>
</template>

<style scoped>
form {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  gap: 0.5em;
  padding: 1em;
  background-color: var(--light-orange-gold);
}

textarea {
  font-family: inherit;
  font-size: inherit;
  padding: 0.5em;
  border-radius: 4px;
  resize: none;
}
</style>
