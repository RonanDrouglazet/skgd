import { CountUp } from "countUp.js";
import Isotope from "isotope-layout";

const countups = (goUp) =>
  [
    ["n1", new Date().getFullYear() - 2014],
    ["n2", 15],
    ["n3", 6],
    ["n4", 6],
  ].map(
    ([el, n]) =>
      new CountUp(el, goUp ? n : 0, {
        duration: 2,
        startVal: goUp ? 0 : n,
      })
  );

const observerCountsUp = new IntersectionObserver(
  ([{ isIntersecting }]) => {
    countups(isIntersecting).forEach((c) => c.start());
    if (isIntersecting) {
      triggerBarOn(document.querySelector("section#agence"));
    }
  },
  {
    threshold: 1,
  }
);

const showBarOn = (menu) => menu.forEach((_) => _.classList.add("activated"));

const hideBarOn = (menu) =>
  menu.forEach((_) => _.classList.remove("activated"));

const triggerBarOn = (target) => {
  const targetedMenu = document.querySelectorAll(
    `header a[href="#${target.id}"] .menu`
  );
  showBarOn(targetedMenu);
  if (targetedMenu.length) {
    hideBarOn(
      document.querySelectorAll(`header a:not([href="#${target.id}"]) .menu`)
    );
  }
};

const observerSections = new IntersectionObserver(
  ([{ isIntersecting, target }]) => {
    if (isIntersecting) {
      triggerBarOn(target);
    }
  },
  {
    threshold: 0.5,
  }
);

const observerFixMenuPainting = new IntersectionObserver(
  ([{ isIntersecting, target }]) => {
    if (isIntersecting) {
      const header = document.querySelector("body > header");
      header.style.visibility = "hidden";
      setTimeout(() => (header.style.visibility = "visible"), 0);
    }
  },
  {
    threshold: 0.1,
  }
);

const initObservers = () => {
  observerCountsUp.observe(document.querySelector("#n1"));
  observerFixMenuPainting.observe(document.querySelector("section#accueil"));
  document
    .querySelectorAll("section")
    .forEach((section) => observerSections.observe(section));
};

const initRealisations = () => {
  const grid = new Isotope(".grid-rea", {
    itemSelector: ".grid-element",
    layoutMode: "fitRows",
    stagger: 100,
    filter: ".all",
  });

  document.querySelectorAll("#realisations header .menu").forEach((menu) => {
    menu.addEventListener("click", ({ target }) => {
      const filter = target.getAttribute("data-filter");
      document
        .querySelectorAll("#realisations header .menu.activated")
        .forEach((_) => _.classList.remove("activated"));
      target.classList.add("activated");
      grid.arrange({
        filter,
      });
    });
  });

  document.querySelectorAll(".grid-element").forEach((_) =>
    _.addEventListener(
      "click",
      ({ currentTarget }) => {
        currentTarget.classList.add("activated");
      },
      { capture: true }
    )
  );

  document.querySelectorAll(".opened .close").forEach((_) =>
    _.addEventListener("click", ({ currentTarget }) => {
      console.log(currentTarget.parentElement.parentElement.classList.remove);
      currentTarget.parentElement.parentElement.classList.remove("activated");
    })
  );
};

addEventListener("load", () => {
  initObservers();
  initRealisations();
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
