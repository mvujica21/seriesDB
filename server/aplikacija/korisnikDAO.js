const Baza = require("./baza.js");

class KorisnikDAO {
  constructor() {
    this.baza = new Baza("RWA2023mvujica21.sqlite");
  }

  dajSve = async function () {
    this.baza.spojiSeNaBazu();
    let sql = "SELECT * FROM korisnik";
    var podaci = await this.baza.izvrsiUpit(sql, []);
    this.baza.zatvoriVezu();
    return podaci;
  };

  daj = async function (korime) {
    this.baza.spojiSeNaBazu();
    let sql = "SELECT * FROM korisnik WHERE korime=?";
    var podaci = await this.baza.izvrsiUpit(sql, [korime]);
    this.baza.zatvoriVezu();
    if (podaci.length == 1) return podaci[0];
    else return null;
  };

  dodaj = async function (korisnik) {
    try {
      this.baza.spojiSeNaBazu();

      let result = await this.baza.izvrsiUpit(
        "SELECT COUNT(*) AS broj FROM korisnik WHERE korime = ?",
        [korisnik.korime]
      );
      if (result[0].broj > 0) {
        console.error("Korisničko ime već postoji.");
        return false;
      }

      result = await this.baza.izvrsiUpit(
        "SELECT COUNT(*) AS broj FROM korisnik WHERE email = ?",
        [korisnik.email]
      );
      if (result[0].broj > 0) {
        console.error("Email već postoji.");
        return false;
      }
      let sql = `INSERT INTO korisnik (ime,prezime,korime,lozinka,email,telefon,grad,drzava,uloge_id_uloge) VALUES (?,?,?,?,?,?,?,?,?)`;
      let podaci = [
        korisnik.ime,
        korisnik.prezime,
        korisnik.korime,
        korisnik.lozinka,
        korisnik.email,
        korisnik.telefon,
        korisnik.grad,
        korisnik.drzava,
        korisnik.uloge_id_uloge,
      ];
      await this.baza.izvrsiUpit(sql, podaci);
      return "Izvršeno";
    } catch (error) {
      console.error("Greška prilikom dodavanja korisnika:", error);
      throw new Error(
        "Dodavanje korisnika nije uspjelo. Detalji greške: " + error.message
      );
    } finally {
      this.baza.zatvoriVezu();
    }
  };

  obrisi = async function (korime) {
    this.baza.spojiSeNaBazu();
    let sql = "SELECT * FROM korisnik WHERE korime=?";
    var podaci = await this.baza.izvrsiUpit(sql, [korime]);
    if (podaci.length == 1) {
      let sql = "DELETE FROM korisnik WHERE korime=?";
      await this.baza.izvrsiUpit(sql, [korime]);
      this.baza.zatvoriVezu();
      return "Izvršeno";
    } else {
      this.baza.zatvoriVezu();
      return Promise.reject("Korisnik ne postoji");
    }
  };

  azuriraj = async function (korime, korisnik) {
    this.baza.spojiSeNaBazu();
    let currentTotp = await this.baza.izvrsiUpit(
      "SELECT totp FROM korisnik WHERE korime = ?",
      [korime]
    );

    if (!currentTotp || !currentTotp[0].totp) {
      let sql = `UPDATE korisnik SET ime=?, prezime=?, lozinka=?, telefon=?, grad=?, drzava=?, totp=?, totp_active=? WHERE korime=?`;
      let podaci = [
        korisnik.ime,
        korisnik.prezime,
        korisnik.lozinka,
        korisnik.telefon,
        korisnik.grad,
        korisnik.drzava,
        korisnik.totp,
        korisnik.totpPrijava,
        korime,
      ];
      await this.baza.izvrsiUpit(sql, podaci);
      this.baza.zatvoriVezu();
	  return {
		poruka: "Izvršeno",
		totp: korisnik.totp
	  };
    } else {
      let sql = `UPDATE korisnik SET ime=?, prezime=?, lozinka=?, telefon=?, grad=?, drzava=?, totp_active=? WHERE korime=?`;
      let podaci = [
        korisnik.ime,
        korisnik.prezime,
        korisnik.lozinka,
        korisnik.telefon,
        korisnik.grad,
        korisnik.drzava,
        korisnik.totpPrijava,
        korime,
      ];
      await this.baza.izvrsiUpit(sql, podaci);
      this.baza.zatvoriVezu();
      return "Izvršeno";
    }
  };
}

module.exports = KorisnikDAO;
