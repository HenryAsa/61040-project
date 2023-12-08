<script setup lang="ts">
import ChatboxComponent from "../components/AIAssistant/ChatboxComponent.vue";
</script>

<template>
  <main>
    <div class="header">
      I am an AI financial analyst and I'm here to help you. Please type in what you are thinking or what trading you want to do. I will look into the recent news and give you feedback.
    </div>
    <p>
      <ChatboxComponent />
    </p>
  </main>
</template>

<style scoped>
.header {
  width: 50%;
  position: relative;
  position: flex;
  top: 50%;

  left: 25%;
  /* transform: translate(-50%, -50%); */
  background-color: #e0e0e0;
  border-radius: 10px;
  padding: 5px;
  display: block;
}
</style>
