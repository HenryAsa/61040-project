<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
</script>

<template>
  <main class="column">
    <h1>
      Welcome to
      <span class="logo-text">Sharefolio</span>, the Community Investment Platform!
    </h1>
    <h2>Please login or register!</h2>
    <LoginForm />
    <RegisterForm />
  </main>
</template>

<style scoped>
.h1 {
  font-size: 1px;
}
</style>
