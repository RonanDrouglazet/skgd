import { CountUp } from "countUp.js";

const countups = (goUp) =>
  [
    ["n1", 6],
    ["n2", 10],
    ["n3", 5],
    ["n4", 50],
  ].map(
    ([el, n]) =>
      new CountUp(el, goUp ? n : 0, {
        duration: 1,
        startVal: goUp ? 0 : n,
      })
  );

const observer = new IntersectionObserver(
  ([{ isIntersecting }]) => countups(isIntersecting).forEach((c) => c.start()),
  {
    threshold: 1,
  }
);

const initNumbers = () => {
  observer.observe(document.querySelector("#n1"));
};

addEventListener("load", () => {
  initNumbers();
});
