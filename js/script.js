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

const manageReaOpening = (dom) =>
  dom.addEventListener(
    "click",
    ({ currentTarget }) => {
      currentTarget.classList.add("activated");
    },
    { capture: true }
  );

const manageReaClosing = (dom) =>
  dom.addEventListener("click", ({ currentTarget }) => {
    currentTarget.parentElement.parentElement.classList.remove("activated");
  });

const initObservers = () => {
  observerCountsUp.observe(document.querySelector("#n1"));
  observerFixMenuPainting.observe(document.querySelector("section#accueil"));
  document
    .querySelectorAll("section")
    .forEach((section) => observerSections.observe(section));
};

let grid;
const initRealisations = () => {
  window.grid = grid = new Isotope(".grid-rea", {
    itemSelector: ".grid-element",
    layoutMode: "fitRows",
    stagger: 100,
    filter: ".init",
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

  document.querySelectorAll(".grid-element").forEach(manageReaOpening);
  document.querySelectorAll(".opened .close").forEach(manageReaClosing);
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

window.sabo_plugins = [
  {
    name: "Ajouter / modifier un projet",
    icon: "mdi-account-multiple-plus",
    type: "formList",
    listForms() {
      const elements = Array.from(
        document.querySelectorAll(".grid-rea .grid-element")
      );
      return elements.map((element) => {
        const title = element.querySelector("h3").innerText.trim();
        const image = element.querySelector("img").src;
        const opened = element
          .querySelector(".opened")
          ?.style.backgroundImage?.match(/url\("(.+)"\)/i)?.[1];
        const categorie = element.querySelector(".categorie").innerText.trim();
        const isHome = element.classList.contains("init");

        return {
          title,
          image,
          dom: element,
          fields: {
            accueil: {
              type: "checkbox",
              value: isHome,
              label: "afficher cette réalisation sur la page d'accueil",
              order: 0,
            },
            categorie: {
              type: "select",
              value: categorie,
              items: ["Édition", "Communication", "Identité visuelle"],
              order: 1,
            },
            titre: {
              type: "input",
              value: title,
              order: 2,
            },
            vignette: {
              type: "image",
              multiple: false,
              value: [image],
              order: 3,
            },
            image_HD: {
              type: "image",
              multiple: false,
              value: opened ? [opened] : [],
              order: 4,
            },
          },
        };
      });
    },
    removeForm(form) {
      form.dom.remove();
      return [form.dom.getAttribute("data-sabo-id")];
    },
    addForm(form) {
      const el = document.createElement("div");
      document.querySelector(".grid-rea").prepend(el);
      el.outerHTML = `
      <div class="grid-element">
        <img src="" />
        <div class="overlay">
          <h3></h3>
          <div class="divider"></div>
          <div class="categorie"></div>
        </div>
      </div>
      `;
      form.dom = document.querySelectorAll(".grid-rea .grid-element")[0];
      manageReaOpening(form.dom);
      grid.prepended(form.dom);
      grid.layout();
      return [form.dom];
    },
    updateField(form, key, value) {
      /**
       * @type HTMLElement
       */
      const dom = form.dom;
      dom.classList.remove("activated");
      const categories = {
        Édition: "ed",
        Communication: "co",
        "Identité visuelle": "id",
      };
      const arrange = () =>
        grid.arrange({
          filter: ".init",
          transitionDuration: 0,
        });

      switch (key) {
        case "titre":
          dom.querySelector("h3").innerHTML = value;
          return [dom.querySelector("h3").getAttribute("data-sabo-id")];

        case "vignette":
          dom.querySelector("img").src = value;
          return [dom.querySelector("img").getAttribute("data-sabo-id")];

        case "image_HD":
          let opened = dom.querySelector(".opened");
          let id;
          if (value) {
            if (!opened) {
              dom.innerHTML += `
            <div class="opened">
              <div class="close">X</div>
            </div>
            `;
              opened = dom.querySelector(".opened");
              manageReaClosing(opened.querySelector(".close"));
              id = dom.getAttribute("data-sabo-id");
            } else {
              id = opened.getAttribute("data-sabo-id");
            }

            opened.style.backgroundImage = `url("${value}")`;
          } else if (opened) {
            opened.remove();
            id = opened.getAttribute("data-sabo-id");
          }

          return id ? [id] : [];

        case "categorie":
          dom.querySelector(".categorie").innerHTML = value;
          dom.classList.forEach(
            (_) =>
              !["grid-element", "init"].includes(_) && dom.classList.remove(_)
          );
          dom.classList.add(categories[value]);
          return [dom.getAttribute("data-sabo-id")];

        case "accueil":
          if (value) {
            dom.classList.add("init");
          } else {
            dom.classList.remove("init");
          }

          setTimeout(arrange, 100);
          arrange();
          return [dom.getAttribute("data-sabo-id")];
      }
    },
  },
];
