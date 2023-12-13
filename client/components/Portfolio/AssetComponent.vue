<script setup lang="ts">
import { formatDate } from "@/utils/formatDate";
import { defineEmits, defineProps } from "vue";
import { fetchy } from "../../utils/fetchy";

const props = defineProps(["asset", "portfolio"]);
const emit = defineEmits(["refreshPortfolio"]);

async function sellAsset() {
  try {
    await fetchy(`/api/sell/${props.portfolio._id}/${props.asset._id}`, "PATCH");
  } catch (_) {
    return;
  }
  emit("refreshPortfolio");
}
</script>

<template>
  <div class="asset-card">
    <p class="ticker">{{ props.asset.ticker }}</p>
    <div class="base">
      <article class="timestamp">
        <p>Bought {{ props.asset.quantity }} shares at {{ formatDate(props.asset.dateCreated) }} at price ${{ props.asset.pricePurchased }}</p>
        <button @click="sellAsset" class="sell-button">Sell</button>
      </article>
    </div>
  </div>
</template>

<style scoped>
/* Placeholder styles, replace with your preferred design */
.asset-card {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 15px;
}

.ticker {
  font-size: 1.5em;
  color: #333;
  margin-bottom: 10px;
}

.timestamp {
  font-size: 0.9em;
  color: #666;
}

.sell-button {
  padding: 8px 16px;
  font-size: 0.9em;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #ff6347;
  color: #fff;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.sell-button:hover {
  background-color: #d9534f;
}
</style>
