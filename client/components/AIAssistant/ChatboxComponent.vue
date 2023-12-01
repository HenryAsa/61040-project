<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import SendText from "./SendText.vue";
import TextComponent from "./TextComponent.vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
let messages = ref<Array<Record<string, string>>>([]);

async function getMessages() {
  let messageResults;
  try {
    messageResults = await fetchy("/api/chatbox", "GET", {});
  } catch (_) {
    return;
  }
  messages.value = messageResults;
}

onBeforeMount(async () => {
  await getMessages();
  loaded.value = true;
});
</script>

<template>
  <section v-if="isLoggedIn">
    <h2>Create a post:</h2>
    <SendText @refreshChatbox="getMessages" />
  </section>
  <section class="posts" v-if="loaded && messages.length !== 0">
    <article v-for="message in messages" :key="message._id">
      <TextComponent :message="message" @refreshPosts="getMessages" />
    </article>
  </section>
  <p v-else-if="loaded">No posts found</p>
  <p v-else>Loading...</p>
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

article {
  background-color: var(--base-bg);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  padding: 1em;
}

.posts {
  padding: 1em;
}

.row {
  display: flex;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 60em;
}
</style>
