<script setup lang="ts">
const props = defineProps(["message"]);
const isAI = props.message.author === "ai";
</script>

<template>
  <section :class="{ 'bubble right': isAI, 'bubble left': !isAI }">
    <p markdown="block">{{ props.message.text }}</p>
    <!-- <VueMarkdown :source="src"></VueMarkdown> -->
  </section>
</template>

<style scoped>
.message {
  width: 50%; /* Adjust as needed */
  margin-bottom: 10px; /* Optional: Adds space between messages */
  padding: 10px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  clear: both;
  overflow: hidden;
}

.ai {
  left: 0px;
  right: auto;
  color: var(--white);
  background-color: blue;
  justify-content: flex-start;
}

.self {
  right: 0px;
  left: auto;
  color: var(--dark);
  background-color: #eceff1;
  justify-content: flex-end;
}

.bubble {
  --r: 25px; /* the radius */
  --t: 30px; /* the size of the tail */

  max-width: 300px;
  padding: calc(2 * var(--r) / 3);
  background: linear-gradient(135deg, #fe6d00, #1384c5) border-box;
  border-radius: 45px;
  color: #fff;
}
.left {
  --_d: 0%;
  border-left: var(--t) solid #0000;
  margin-right: var(--t);
  place-self: start;
}
.right {
  --_d: 100%;
  border-right: var(--t) solid #0000;
  margin-left: var(--t);
  place-self: end;
}
</style>
