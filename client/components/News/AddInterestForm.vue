<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const interest = ref("");
const emit = defineEmits(["refreshArticles"]);

const addInterest = async (interest: string) => {
  try {
    await fetchy("/api/interests/:interest", "PATCH", {
      body: { interest },
    });
  } catch (_) {
    return;
  }
  emit("refreshArticles");
  emptyForm();
};

const emptyForm = () => {
  interest.value = "";
};
</script>

<template>
  <form @submit.prevent="addInterest(interest)">
    <label for="interest">Add interest:</label>
    <textarea id="interest" v-model="interest" placeholder="Topic" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Add</button>
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
