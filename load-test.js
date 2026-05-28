import http from "k6/http";
import { sleep, check } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
};

const pages = [
  "https://www.golanwiki.com/en",
  "https://www.golanwiki.com/en/places",
  "https://www.golanwiki.com/ar",
  "https://www.golanwiki.com/he",
];

export default function () {
  const url = pages[Math.floor(Math.random() * pages.length)];

  const res = http.get(url);

  check(res, {
    "status is 200": function (r) {
      return r.status === 200;
    },
    "under 2 seconds": function (r) {
      return r.timings.duration < 2000;
    },
  });

  sleep(1);
}