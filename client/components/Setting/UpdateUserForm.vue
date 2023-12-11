<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

let username = ref("");
let password = ref("");
let firstName = ref("");
let lastName = ref("");
let profilePicture = ref("");

const { updateUser, updateSession } = useUserStore();

async function updateName() {
  await updateUser({ firstName: firstName.value, lastName: lastName.value });
  await updateSession();
  firstName.value = "";
  lastName.value = "";
}

async function updateUsername() {
  await updateUser({ username: username.value });
  await updateSession();
  username.value = "";
}

async function updatePassword() {
  await updateUser({ password: password.value });
  await updateSession();
  password.value = "";
}

async function updatePicture() {
  await updateUser({ profilePhoto: profilePicture.value });
  await updateSession();
  profilePicture.value = "";
}

async function assignURL(url: string) {
  profilePicture.value = url;
}

function assignPassword(userPassword: string) {
  password.value = userPassword;
}
</script>

<template>
  <h2>Update user details</h2>
  <form @submit.prevent="updateName" class="pure-form">
    <fieldset>
      <legend>Change your name</legend>
      <input type="text" placeholder="New first name" v-model="firstName" required />
      <input type="text" placeholder="New last name" v-model="lastName" required />
      <button type="submit" class="pure-button pure-button-primary">Update name</button>
    </fieldset>
  </form>

  <form @submit.prevent="updateUsername" class="pure-form">
    <fieldset>
      <legend>Change your username</legend>
      <input type="text" placeholder="New username" v-model="username" required />
      <button type="submit" class="pure-button pure-button-primary">Update username</button>
    </fieldset>
  </form>

  <form @submit.prevent="updatePicture" class="pure-form">
    <UploadMedia @update:imageURL="assignURL" required></UploadMedia>
    <fieldset>
      <legend>Change your profile picture</legend>
      <button type="submit" class="pure-button pure-button-primary">Update profile picture</button>
    </fieldset>
  </form>

  <form @submit.prevent="updatePassword" class="pure-form">
    <fieldset>
      <legend>Change your password</legend>
      <PasswordValidation @userPassword="assignPassword" id="aligned-password" placeholder="Password" required></PasswordValidation>
      <button type="submit" class="pure-button pure-button-primary">Update password</button>
    </fieldset>
  </form>
</template>
