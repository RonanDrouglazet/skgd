import { CountUp } from "countUp.js";

const countups = (goUp) =>
  [
    ["n1", 6],
    ["n2", 15],
    ["n3", 6],
    ["n4", 6],
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

window.initMap = () => {
  const coo = {
    lat: 48.8905084,
    lng: 2.3313485,
  };
  const map = new google.maps.Map(document.querySelector(".map"), {
    center: coo,
    zoom: 17,
    mapTypeControl: false,
    disableDefaultUI: true,
  });

  const marker = new google.maps.Marker({
    position: coo,
    map,
    title: "SKGD-creation",
    animation: google.maps.Animation.DROP,
  });
  marker.setMap(map);
};
