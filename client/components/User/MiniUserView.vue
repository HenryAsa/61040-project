<script setup lang="ts">
const props = defineProps(["user"]);
</script>

<template>
  <RouterLink :to="{ name: 'Profile', params: { username: props.user.username } }">
    <div class="base">
      <img v-bind:src="props.user.profilePhoto" />
      <div class="username-text">
        <p class="name">{{ props.user.firstName }} {{ $props.user.lastName }}</p>
        <p class="username">@{{ props.user.username }}</p>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
p {
  margin: 0em;
}

.name {
  font-weight: bold;
  font-size: 1.1em;
  margin-bottom: 0.2rem;
}

.username {
  text-align: right;
}

img {
  width: 5vw;
  height: 5vw;
  object-fit: cover;
  align-self: auto;
  border: 3px solid var(--deep-gold);
  border-radius: 16px;
  display: block;
  margin-right: 0.5rem;
  min-height: 4.5em;
  min-width: 4.5em;
  max-height: 4.5em;
  max-width: 4.5em;
}

.base {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 16px;
  border: 3px solid var(--deep-gold);
  padding-top: 0.2rem;
  padding-bottom: 0.2rem;
  padding-left: 0.2rem;
  padding-right: 0.45em;
  background-color: var(--light-orange-gold);
  min-height: 5em;
  max-height: 5em;
}
</style>
