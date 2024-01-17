const KorisnikDAO = require("./korisnikDAO.js");
const jwt = require("./moduli/jwt.js");
const kodovi = require("./moduli/kodovi.js");
const Konfiguracija = require("../konfiguracija.js");
const totp = require("./moduli/totp.js");

const reCaptcha = require("./moduli/reCaptcha.js");
let konf = new Konfiguracija();
konf.ucitajKonfiguraciju();

exports.getKorisnici = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  const provjeriToken = jwt.provjeriToken(
    zahtjev,
    konf.dajKonf().jwtTajniKljuc
  );

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
  if (zahtjev.session.uloga !== 1) {
    odgovor.status(403);
    odgovor.send(
      JSON.stringify({
        error: "Korisnik ne može dohvatiti podatke korisnika jer nije admin.",
      })
    );
    return;
  }
  let kdao = new KorisnikDAO();
  kdao
    .dajSve()
    .then((korisnici) => {
      odgovor.status(200).send(JSON.stringify(korisnici));
    })
    .catch((error) => {
      console.error("Greška prilikom dohvata korisnika", error);
      odgovor.status(400).send(
        JSON.stringify({
          error: "Greška prilikom dohvata korisnika" + error.message,
        })
      );
    });
};

exports.postKorisnici = async function (zahtjev, odgovor) {
  odgovor.type("application/json");
  const provjeriToken = jwt.provjeriToken(
    zahtjev,
    konf.dajKonf().jwtTajniKljuc
  );

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
  const recaptchaToken = zahtjev.body.reCaptchaToken;
  const isRecaptchaValid = await reCaptcha.provjeriRecaptchu(recaptchaToken);

  if (!isRecaptchaValid) {
    return odgovor
      .status(400)
      .send(JSON.stringify({ greska: "ReCaptcha verification failed." }));
  }

  try {
    const { reCaptchaToken, ...podaci } = zahtjev.body;
    JSON.stringify(podaci);
    console.log(podaci)
    console.log("podaci")
    podaci.uloge_id_uloge = podaci.uloge_id_uloge || 2;
    console.log(podaci);
    if (zahtjev.session.uloga !== 1) {
      odgovor.status(403);
      odgovor.send(JSON.stringify({ error: "Korisnik ne može registrirati" }));
      return;
    }
    podaci.lozinka = kodovi.kreirajSHA256(podaci.lozinka, podaci.korime);

    let kdao = new KorisnikDAO();
    let poruka = await kdao.dodaj(podaci);
    odgovor.status(201);
    odgovor.send(JSON.stringify(poruka));
  } catch (error) {
    console.error("Greška prilikom dodavanja korisnika:", error);
    odgovor.status(400);
    odgovor.send(JSON.stringify({ error: "Pogrešan zahtjev" }));
  }
};
exports.putKorisnici = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  odgovor.status(501);
  let poruka = { greska: "metoda nije implementirana" };
  odgovor.send(JSON.stringify(poruka));
};
exports.deleteKorisnici = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  odgovor.status(501);
  let poruka = { greska: "metoda nije implementirana" };
  odgovor.send(JSON.stringify(poruka));
};

exports.getKorisnik = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  const provjeriToken = jwt.provjeriToken(
    zahtjev,
    konf.dajKonf().jwtTajniKljuc
  );

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
  let kdao = new KorisnikDAO();
  let korime = zahtjev.params.korime;
  kdao.daj(korime).then((korisnik) => {
    if (!korisnik) {
      odgovor
        .status(400)
        .send(JSON.stringify({ error: "Ne postoji taj korisnik" }));
    } else {
      odgovor.status(200).send(JSON.stringify(korisnik));
    }
  });
};

exports.postKorisnik = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  odgovor.status(405);
  let poruka = { greska: "Metoda nije dopuštena" };
  odgovor.send(JSON.stringify(poruka));
};

exports.putKorisnik = async function (zahtjev, odgovor) {
  odgovor.type("application/json");
  const provjeriToken = jwt.provjeriToken(
    zahtjev,
    konf.dajKonf().jwtTajniKljuc
  );
  const recaptchaToken = zahtjev.body.reCaptchaToken;
  const isRecaptchaValid = await reCaptcha.provjeriRecaptchu(recaptchaToken);

  if (!isRecaptchaValid) {
    return odgovor
      .status(400)
      .send(JSON.stringify({ greska: "ReCaptcha verification failed." }));
  }
  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
  let korime = zahtjev.session.korime;
  const { reCaptchaToken, ...podaci } = zahtjev.body;
  JSON.stringify(podaci);
  let kdao = new KorisnikDAO();

  if (podaci.totpPrijava !== null) {
    try {
      let korisnik = await kdao.daj(korime);

      if (!korisnik) {
        odgovor
          .status(400)
          .send(JSON.stringify({ error: "Ne postoji taj korisnik" }));
      } else {
        if (korisnik.totp !== null && korisnik.totp !== "") {
        } else {
          let kljuc = totp.kreirajTajniKljuc(korime);
          podaci.totp = kljuc;
        }
      }
    } catch (error) {
      console.error("Greška prilikom dohvaćanja korisnika", error);
      odgovor
        .status(500)
        .send(JSON.stringify({ error: "Internal Server Error" }));
      return;
    }
  }

  if (typeof podaci.lozinka === "string" && podaci.lozinka.trim() !== "") {
    podaci.lozinka = kodovi.kreirajSHA256(podaci.lozinka, podaci.korime);
  } else {
    console.error("Pogrešna šifra upisana");
    odgovor.status(400).json({ error: "Pogrešna šifra upisana" });
    return;
  }
  kdao
  .azuriraj(korime, podaci)
  .then((poruka) => {
    if (poruka.totp) {
      odgovor.status(201).send(JSON.stringify({poruka, totp: poruka.totp}));
    } else {
      odgovor.status(201).send(JSON.stringify({ poruka: "Izvršeno" }));
    }
  })
  .catch((error) => {
    console.error("Greška prilikom ažuriranja", error);
    odgovor
      .status(400)
      .send(
        JSON.stringify({ error: "Neuspješno ažuriranje. " + error.message })
      );
  });

};
exports.deleteKorisnik = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  const provjeriToken = jwt.provjeriToken(
    zahtjev,
    konf.dajKonf().jwtTajniKljuc
  );

  if (!provjeriToken) {
    odgovor.status(401).json({ opis: "Nevaljani token" });
    return;
  }
  if (zahtjev.session.uloga !== 1) {
    odgovor.status(403);
    odgovor.send(
      JSON.stringify({ error: "Korisnik ne može brisati jer nije admin" })
    );
    return;
  }
  let podaci = zahtjev.body;
  let korime = podaci.koris;
  let kdao = new KorisnikDAO();
  kdao
    .obrisi(korime)
    .then((poruka) => {
      odgovor.status(201);
      odgovor.send(JSON.stringify(poruka));
    })
    .catch((error) => {
      console.error("Greška prilikom brisanja korisnika:", error);

      let errorMessage;
      if (error === "Korisnik ne postoji") {
        errorMessage = "Korisnik ne postoji";
      } else {
        errorMessage = "Došlo je do pogreške prilikom brisanja korisnika";
      }

      odgovor.status(400).send(
        JSON.stringify({
          greska: errorMessage,
        })
      );
    });
};
exports.getKorisnikPrijava = function (zahtjev, odgovor) {
  odgovor.type("application/json");

  if (zahtjev.session && zahtjev.session.korime !== null) {
    const korisnik = zahtjev.params.korime;
    zahtjev.session.jwt = jwt.kreirajToken(korisnik, this.tajniKljucJWT);
    odgovor
      .status(201)
      .set("Authorization", zahtjev.session.jwt)
      .send(JSON.stringify({ message: "Poslan token u zaglavlju" }));
  } else {
    odgovor.status(401).send(JSON.stringify({ greska: "Sesija ne postoji!" }));
  }
};

exports.postKorisnikPrijava = async function (zahtjev, odgovor) {
  odgovor.type("application/json");

  try {
    if (!zahtjev.body || !zahtjev.body.korime || !zahtjev.body.lozinka) {
      throw new Error("Neispravno tijelo u zahtjevu");
    }

    const korime = zahtjev.body.korime;
    const lozinka = zahtjev.body.lozinka;
    const recaptchaToken = zahtjev.body.recaptchaToken;
    const totpKey = zahtjev.body.totpKey;

    const isRecaptchaValid = await reCaptcha.provjeriRecaptchu(recaptchaToken);

    if (!isRecaptchaValid) {
      return odgovor
        .status(400)
        .send(JSON.stringify({ greska: "ReCaptcha verification failed." }));
    }

    let kdao = new KorisnikDAO();
    kdao.daj(korime).then(async (korisnik) => {
      if (korisnik != null) {
        const sifra = kodovi.kreirajSHA256(lozinka, korime);
        if (korisnik.lozinka === sifra) {
          if (korisnik.totp_active) {
            if (totpKey) {
              if (totp.provjeriTOTP(totpKey, korisnik.totp)) {
                zahtjev.session.jwt = jwt.kreirajToken(
                  korisnik,
                  this.tajniKljucJWT
                );
                const token = jwt.kreirajToken(korisnik, this.tajniKljucJWT);
                zahtjev.session.korisnik =
                  korisnik.ime + " " + korisnik.prezime;
                zahtjev.session.korime = korisnik.korime;
                zahtjev.session.uloga = korisnik.uloge_id_uloge;
                let uloga = zahtjev.session.uloga;
                odgovor.status(201);
                odgovor.send(JSON.stringify({ token, korime, uloga }));
              } else {
                odgovor
                  .status(400)
                  .send(JSON.stringify({ greska: "Totp nije ispravan." }));
              }
            } else {
              odgovor
                .status(412)
                .send(JSON.stringify({ totp: "Treba mi totp" }));
            }
          } else {
            zahtjev.session.jwt = jwt.kreirajToken(
              korisnik,
              this.tajniKljucJWT
            );
            const token = jwt.kreirajToken(korisnik, this.tajniKljucJWT);
            zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
            zahtjev.session.korime = korisnik.korime;
            zahtjev.session.uloga = korisnik.uloge_id_uloge;
            let uloga = zahtjev.session.uloga;
            odgovor.status(201);
            odgovor.send(JSON.stringify({ token, korime, uloga }));
          }
        } else {
          odgovor
            .status(400)
            .send(JSON.stringify({ greska: "Lozinka nije ispravna." }));
        }
      } else {
        odgovor
          .status(404)
          .send(JSON.stringify({ greska: "Korisnik ne postoji." }));
      }
    });
  } catch (error) {
    odgovor.status(400).send(JSON.stringify({ greska: error.message }));
  }
};

exports.putKorisnikPrijava = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  odgovor.status(501);
  let poruka = { greska: "metoda nije implementirana" };
  odgovor.send(JSON.stringify(poruka));
};
exports.deleteKorisnikPrijava = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  odgovor.status(501);
  let poruka = { greska: "metoda nije implementirana" };
  odgovor.send(JSON.stringify(poruka));
};
exports.dohvatiKorisnikaIzSesije = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  let kdao = new KorisnikDAO();
  let korime = zahtjev.session.korime;
  console.log(korime);
  kdao.daj(korime).then((korisnik) => {
    if (!korisnik) {
      odgovor
        .status(400)
        .send(JSON.stringify({ error: "Ne postoji taj korisnik" }));
    } else {
      odgovor.status(200).send(JSON.stringify(korisnik));
    }
  });
};
exports.odjava = function (zahtjev, odgovor) {
  odgovor.type("application/json");
  zahtjev.session.jwt = null;
  zahtjev.session.korisnik = null;
  zahtjev.session.korime = null;
  zahtjev.session.uloga = null;
  odgovor.send("Uspješno odjavljen");
};
