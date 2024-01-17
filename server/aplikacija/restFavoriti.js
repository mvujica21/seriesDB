const favoritiDAO = require("./favoritiDAO.js");
const Konfiguracija = require("../konfiguracija.js");
const jwt = require("./moduli/jwt.js");

let konf = new Konfiguracija();
konf.ucitajKonfiguraciju();

exports.getFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    const provjeriToken = jwt.provjeriToken(zahtjev, konf.dajKonf().jwtTajniKljuc);

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
    let fdao = new favoritiDAO();
    console.log(zahtjev.session);
    console.log("zahtjev");
    fdao.dajSve(zahtjev).then((favoriti) => {
        console.log(favoriti);
        odgovor.status(200);
        odgovor.send(JSON.stringify(favoriti));
    });
}
exports.postFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    const provjeriToken = jwt.provjeriToken(zahtjev, konf.dajKonf().jwtTajniKljuc);

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
    let podaci = zahtjev.body;
    console.log(podaci);
    JSON.stringify(podaci);
    let fdao = new favoritiDAO();
    fdao.dodajSeriju(podaci, zahtjev).then((poruka) => {
        odgovor.status(201);
        odgovor.send(JSON.stringify(poruka));
    });
}
exports.putFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}
exports.deleteFavoriti = function (zahtjev, odgovor) {
    odgovor.type("application/json")
    odgovor.status(501);
    let poruka = { greska: "metoda nije implementirana" }
    odgovor.send(JSON.stringify(poruka));
}
exports.getFavorit = function(zahtjev, odgovor){
    odgovor.type("application/json")
    const provjeriToken = jwt.provjeriToken(zahtjev, konf.dajKonf().jwtTajniKljuc);

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
    let fdao = new favoritiDAO();
    let serijaId = zahtjev.params.id;
    let osoba = zahtjev.session.korime
    fdao.dajFavorite(serijaId, osoba).then((greska) => {
        console.log(greska);
        odgovor.send(JSON.stringify(greska));
    });
}
exports.postFavorit = function(zahtjev, odgovor){
    
    odgovor.type("application/json")
    odgovor.status(405);
    let poruka = { greska: "Metoda nije dopuštena" }
    odgovor.send(JSON.stringify(poruka));
}
exports.putFavorit = function(zahtjev, odgovor){
    odgovor.type("application/json")
    odgovor.status(405);
    let poruka = { greska: "Metoda nije dopuštena" }
    odgovor.send(JSON.stringify(poruka));
}
exports.deleteFavorit = function(zahtjev, odgovor){
    odgovor.type("application/json")
    const provjeriToken = jwt.provjeriToken(zahtjev, konf.dajKonf().jwtTajniKljuc);

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
    let fdao = new favoritiDAO();
    let serija_id = zahtjev.params.serija_id;
    let korisnik_id = zahtjev.params.korisnik_id;
    fdao.obrisiFavorita(serija_id, korisnik_id)
    .then((rezultat) => {
        console.log(rezultat);
        odgovor.status(201).send(JSON.stringify(rezultat));
    })
    .catch((greska) => {
        console.error("Greška prilikom brisanja:", greska);
        odgovor.status(400).send(JSON.stringify({ error: "Greška prilikom brisanja " + greska.message }));
    });
}