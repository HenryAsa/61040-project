// import { fetchy } from "@/utils/fetchy";

// async function getPriceHistory() {
//   let results;
//   try {
//     results = await fetchy("/api/assets/history", "GET", {});
//   } catch (_) {
//     return;
//   }
//   return results;
// }

// const responce = await getPriceHistory();
// export const data = {
//   labels: responce.dates,
//   datasets: [
//     {
//       label: "Last 24 hours price history",
//       backgroundColor: "#f87979",
//       data: responce.prices,
//     },
//   ],
// };

// export const options = {
//   responsive: true,
//   maintainAspectRatio: false,
// };
