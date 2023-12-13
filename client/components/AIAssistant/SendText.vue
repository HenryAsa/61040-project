<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";

const text = ref("");
const emit = defineEmits(["refreshChatbox"]);

const sendText = async (decision: string) => {
  try {
    await fetchy("/api/aiagent/send", "PATCH", {
      body: { decision },
    });
  } catch (_) {
    return;
  }
  emit("refreshChatbox");
  emptyForm();
  try {
    await fetchy("/api/aiagent/receive", "PATCH", {
      body: { decision },
    });
  } catch (_) {
    return;
  }
  emit("refreshChatbox");
};

const emptyForm = () => {
  text.value = "";
};
</script>

<template>
  <form class="message-input" @submit.prevent="sendText(text)">
    <input type="text" v-model="text" placeholder="Type your message ..." required />
    <button type="submit"><i class="fa fa-send-o"></i></button>
  </form>
</template>

<style scoped>
.message-input {
  position: fixed;
  bottom: 0;
  left: 15%;
  width: 70%;
  display: block;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  padding: 8px;
}

.message-input input[type="text"] {
  display: inline;
  flex: 1;
  width: 80%;
  border: none;
  padding: 8px;
  border-radius: 4px;
  margin-right: 8px;
  outline: none;
}

.message-input button {
  display: inline;
  padding: 8px 16px;
  border: none;
  border-radius: 100px;
  background-color: #2979ff;
  color: #fff;
  cursor: pointer;
  outline: none;
}
</style>
