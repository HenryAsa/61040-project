<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const text = ref("");
const emit = defineEmits(["refreshChatbox"]);

const sendText = async (decision: string) => {
  try {
    await fetchy("/api/aiagent/:decision", "PATCH", {
      body: { decision },
    });
  } catch (_) {
    return;
  }
  emit("refreshChatbox");
  emptyForm();
};

const emptyForm = () => {
  text.value = "";
};
</script>

<template>
  <form @submit.prevent="sendText(text)">
    <textarea id="content" v-model="text" placeholder="Type your message!" required> </textarea>
    <button type="submit" class="pure-button-primary pure-button">Send</button>
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
