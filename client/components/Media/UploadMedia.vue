<script setup lang="ts">
// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { ref as firebaseRef, getDownloadURL, uploadBytes } from "firebase/storage";
import { defineEmits, ref } from "vue";
import { firebaseConfig, storage } from "../../../server/firebase";
import { fetchy } from "../../utils/fetchy";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const imageUpload = ref();
const imageURL = ref();

const props = defineProps(["target"]);
const emit = defineEmits(["update:imageURL"]);

const createMedia = async (media_url: string) => {
  let query: Record<string, string> = props.target !== undefined ? { media_url: media_url, target: props.target } : { media_url: media_url };
  try {
    await fetchy("/api/media", "POST", {
      body: query,
    });
  } catch (_) {
    return;
  }
  emit("update:imageURL");
};

async function handleFileChange(event: Event) {
  if (event.target) {
    const target = event.target as HTMLInputElement;
    if (target?.files?.length) {
      imageUpload.value = target.files[0];
      await uploadImage();
    }
  }
}

const uploadImage = async () => {
  const file = imageUpload.value as File;
  const imageRef = firebaseRef(storage, `images/${file.name}`);

  await uploadBytes(imageRef, imageUpload.value).then(async (response) => {
    console.log(response);
    await getDownloadURL(firebaseRef(storage, response.ref.fullPath)).then(async (url) => {
      console.log(`GOT THE URL ${url}`);
      imageURL.value = url;
      await createMedia(url);
      emit("update:imageURL", url);
    });
  });
};
</script>

<template>
  <div id="media_uploader">
    <h3 v-if="!imageURL">Please Upload a Profile Picture!</h3>
    <h3 v-if="imageURL">Here is a preview of what your profile picture will look like</h3>
    <input type="file" @change="handleFileChange" />
    <img class="profile_photo" v-if="imageURL" :src="imageURL" alt="Image that was just uploaded" />
    <br />
  </div>
</template>

<style scoped>
.profile_photo {
  width: 20vw;
  height: 20vw;
  object-fit: cover;
  align-self: auto;
  border: 3px solid var(--subtle-gray);
  border-radius: 16px;
  display: block;
  margin: 1rem auto;
  max-width: 100%;
}
#media_uploader {
  border: 3px solid var(--subtle-gray);
  border-radius: 16px;
  display: block;
  margin: 1rem auto;
  padding: 1em;
}
.h3 {
  text-align: center;
  text: center;
}
</style>
