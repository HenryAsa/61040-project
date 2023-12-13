<script setup lang="ts">
import { ref } from "vue";

const username = ref("");
const emit = defineEmits(["getUsersByName"]);
</script>

<template>
  <form class="pure-form">
    <fieldset>
      <legend>Search by Username</legend>
      <input id="author" @input="emit('getUsersByName', username)" type="text" v-model="username" placeholder="Username" />
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
