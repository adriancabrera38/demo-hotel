(function () {
  "use strict";
  /* Datos del hotel (FICTICIOS: web de demostración). */
  window.__BRAND__ = {
    name: "Mas de l'Alzina · Hotel rural",
    address: "Camí de l'Alzina, s/n · 17800 La Garrotxa, Girona (ficticia)",
    phone: "+34 000 000 000",
    email: "hola@masalzina.example",

    /* Habitaciones: precio por noche (entre semana / viernes-sábado), capacidad y cuántas hay */
    rooms: [
      { id: "roure",  name: "El Roure",  img: "assets/img/hab-roure.webp",  size: 22, max: 2, units: 3, week: 115, weekend: 135, note: "Doble · vistas al huerto" },
      { id: "fageda", name: "La Fageda", img: "assets/img/hab-fageda.webp", size: 26, max: 3, units: 2, week: 135, weekend: 160, note: "Doble o triple · balcón" },
      { id: "alzina", name: "L'Alzina",  img: "assets/img/hab-alzina.webp", size: 34, max: 4, units: 2, week: 165, weekend: 195, note: "Buhardilla familiar · vigas vistas" },
      { id: "volca",  name: "El Volcà",  img: "assets/img/hab-volca.webp",  size: 40, max: 2, units: 1, week: 210, weekend: 250, note: "Suite · bañera exenta y chimenea" }
    ],
    breakfast: 14,       // por persona y noche
    dinner: 32,          // cena de temporada, por persona (una vez)
    pet: 15,             // por estancia
    minNights: 2,        // viernes y sábado
    closedMonths: [0],   // enero cerrado
    touristTax: 1.1      // por adulto y noche
  };
})();
