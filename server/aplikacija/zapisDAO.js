const Baza = require("./baza.js");

class ZapisDAO {
  constructor() {
    this.baza = new Baza("RWA2023mvujica21.sqlite");
  }

  pohraniZapis = async function (zahtjev) {
    try {
      this.baza.spojiSeNaBazu();

      const sql = `INSERT INTO logs (datum, vrijeme, vrsta_zahtjeva, trazeni_resurs, tijelo, korisnik_id_korisnika) VALUES (?, ?, ?, ?, ?, ?)`;
      const podaci = [
        new Date(),
        new Date(),
        zahtjev.method,
        zahtjev.url,
        zahtjev.body ? JSON.stringify(zahtjev.body) : null,
        zahtjev.session && zahtjev.session.user ? zahtjev.session.user.id_korisnik : null,
      ];

      const rezultat = await this.baza.izvrsiUpit(sql, podaci);

      this.baza.zatvoriVezu();

      return rezultat;
    } catch (error) {
      console.error("Greška prilikom pohranjivanja:", error);
      throw error;
    }
  };
}

module.exports = ZapisDAO;
