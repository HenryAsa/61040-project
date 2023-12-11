<script setup lang="ts">
import { ref } from "vue";

const username = ref("");
const emit = defineEmits(["getUsersByName"]);
</script>

<template>
  <form @submit.prevent="emit('getUsersByName', username)" class="pure-form">
    <fieldset>
      <legend>Search by Username</legend>
      <input id="author" type="text" v-model="username" placeholder="Username" />
      <button type="submit" class="pure-button pure-button-primary">Search</button>
    </fieldset>
  </form>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
