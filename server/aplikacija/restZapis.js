const zapisDAO = require("./zapisDAO.js");
const Konfiguracija = require("../konfiguracija.js");
let konf = new Konfiguracija();
konf.ucitajKonfiguraciju();
exports.getZapis = function (zahtjev, odgovor){
    odgovor.type("application/json")
    const provjeriToken = jwt.provjeriToken(zahtjev, konf.dajKonf().jwtTajniKljuc);

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
    let podaci = zahtjev.body;
    JSON.stringify(podaci);
    let zdao = new zapisDAO();
    zdao.pohraniZapis(podaci).then((poruka) => {
        odgovor.status(201);
        odgovor.send(JSON.stringify(poruka));
    });
}
exports.postZapis = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}
exports.putZapis = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}
exports.deleteZapis = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}