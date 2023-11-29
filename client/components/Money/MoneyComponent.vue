<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { fetchy } from "@/utils/fetchy";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";

const { isLoggedIn } = storeToRefs(useUserStore());

const loaded = ref(false);
const showDepositInput = ref(false);
const showWithdrawInput = ref(false);
const depositAmount = ref(0);
const withdrawAmount = ref(0);
let balance = ref<number>(0);

async function deposit() {
  try {
    balance.value = await fetchy(`/api/balance/deposit/${depositAmount.value}`, "PATCH");
  } catch (_) {
    return;
  }
  showDepositInput.value = false;
  depositAmount.value = 0;
}

async function withdraw() {
  try {
    balance.value = await fetchy(`/api/balance/withdraw/${withdrawAmount.value}`, "PATCH");
  } catch (_) {
    return;
  }
  showWithdrawInput.value = false;
  withdrawAmount.value = 0;
}

async function getBalance() {
  try {
    balance.value = await fetchy("/api/balance", "GET");
  } catch (_) {
    return;
  }
}

onBeforeMount(async () => {
  if (isLoggedIn) {
    await getBalance();
  }
  loaded.value = true;
});
</script>

<template>
  <div class="flex-container">
    <div class="flex-text" id="balance">Balance: ${{ balance }}</div>
    <div class="flex-item">
      <button v-if="!showDepositInput" @click="showDepositInput = !showDepositInput" type="submit" class="pure-button-primary pure-button">Deposit</button>
      <button v-else @click="showDepositInput = !showDepositInput" type="submit" class="pure-button-primary pure-button">Cancel</button>
    </div>
    <div class="flex-item">
      <button v-if="!showWithdrawInput" @click="showWithdrawInput = !showWithdrawInput" type="submit" class="pure-button-primary pure-button">Withdraw</button>
      <button v-else @click="showWithdrawInput = !showWithdrawInput" type="submit" class="pure-button-primary pure-button">Cancel</button>
    </div>
  </div>
  <div v-if="showDepositInput" class="flex-container">
    <input type="number" v-model="depositAmount" />
    <button @click="deposit" type="submit" class="pure-button-primary pure-button">Deposit</button>
  </div>
  <div v-if="showWithdrawInput" class="flex-container">
    <input type="number" v-model="withdrawAmount" />
    <button @click="withdraw" type="submit" class="pure-button-primary pure-button">Withdraw</button>
  </div>
</template>

<style scoped>
.flex-container {
  display: flex;
  justify-content: center;
}
.flex-text {
  margin-right: 50px;
}
.flex-item {
  margin-right: 5px;
}
.pure-button {
  background-color: black;
}
</style>
