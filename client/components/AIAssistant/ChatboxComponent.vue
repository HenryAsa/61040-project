<script setup lang="ts">
import { fetchy } from "@/utils/fetchy";
import { onBeforeMount, onUpdated, ref } from "vue";
import SendText from "./SendText.vue";
import TextComponent from "./TextComponent.vue";

const loaded = ref(false);
let messages = ref<Array<Record<string, string>>>([]);

async function getMessages() {
  let messageResults;
  try {
    messageResults = await fetchy("/api/chatbox", "GET", {});
  } catch (_) {
    return;
  }
  messages.value = messageResults.messages;
}

onUpdated(() => {
  const messageContainer = document.getElementById("messageContainer");
  if (messageContainer?.scrollTop) {
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }
});

onBeforeMount(async () => {
  await getMessages();
  loaded.value = true;
});
</script>

<template>
  <section id="messageContainer" class="messages" v-if="loaded && messages.length !== 0">
    <article v-for="message in messages" :key="message._id">
      <TextComponent :message="message" @refreshPosts="getMessages" />
    </article>
  </section>
  <p v-else-if="!loaded">Loading...</p>
  <section>
    <SendText @refreshChatbox="getMessages" />
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

section,
p,
.row {
  margin: 0 auto;
  max-width: 60em;
}

.messages {
  padding: 1em;
  padding-bottom: 10px;
  max-height: 400px;
  overflow-y: auto;
}
</style>
