const Baza = require("./baza.js");

class SerijaDAO {
  constructor() {
    this.baza = new Baza("RWA2023mvujica21.sqlite");
  }

  async dajSve(zahtjev) {
    this.baza.spojiSeNaBazu();
    try {
      let korisnik = zahtjev.session.korime;
      console.log(korisnik)
      console.log("korisnik")
      let kor = await this.baza.izvrsiUpit(
        "SELECT id_korisnik FROM korisnik WHERE korime = ?",
        [korisnik]
      );
      let userId = kor[0].id_korisnik;
      let sql = `
        SELECT favoriti.*, serija.*
        FROM favoriti
        JOIN serija ON favoriti.serija_id_serije = serija.id_serije
        WHERE favoriti.korisnik_id_korisnik = ?;`;
      return await this.baza.izvrsiUpit(sql, [userId]);
    } finally {
      this.baza.zatvoriVezu();
    }
  }

  async daj(korime) {
    this.baza.spojiSeNaBazu();
    try {
      let sql = "SELECT * FROM serija WHERE id=?";
      var podaci = await this.baza.izvrsiUpit(sql, [korime]);
      return podaci.length === 1 ? podaci[0] : null;
    } finally {
      this.baza.zatvoriVezu();
    }
  }

  async dodajSeriju(serija, zahtjev) {
    this.baza.spojiSeNaBazu();
    try {
      let result = await this.baza.izvrsiUpit(
        "SELECT COUNT(*) AS broj FROM serija WHERE serija.tmdb_id = ?",
        [serija.id]
      );

      if (result[0].broj === 0) {
        await this.unesiSeriju(serija);

        await this.unesiSezonu(serija);
      }
      await this.dodajUFavorite(serija, zahtjev);
      return true;
    } catch (error) {
      console.error("Greška prilikom dodavanja serije:", error);
      throw new Error(
        "Dodavanje serije nije uspjelo. Detalji greške: " + error.message
      );
    } finally {
      this.baza.zatvoriVezu();
    }
  }

  async obrisi(korime) {
    this.baza.spojiSeNaBazu();
    try {
      let sql = "DELETE FROM serija WHERE korime=?";
      await this.baza.izvrsiUpit(sql, [korime]);
      return true;
    } finally {
      this.baza.zatvoriVezu();
    }
  }

  async unesiSeriju(serija) {
    let sql = `
      INSERT INTO serija (naziv,opis,broj_sezona,broj_epizoda,popularnost,slika,godina,tmdb_id)
      VALUES (?,?,?,?,?,?,?,?)`;
    let podaci = [
      serija.name || '',
      serija.overview || '',
      serija.number_of_seasons || '',
      serija.number_of_episodes || '',
      serija.popularity || '',
      serija.poster_path || '',
      serija.first_air_date || '',
      serija.id || '',
    ];
    await this.baza.izvrsiUpit(sql, podaci);
  }

  async unesiSezonu(serija) {
    let ser = await this.baza.izvrsiUpit(
      "SELECT id_serije FROM serija WHERE tmdb_id =? ",
      [serija.id]
    );
    let idserije = ser[0].id_serije;
    let podaciSezone = serija.seasons;
    let brojSezona = serija.number_of_seasons;

    if (podaciSezone && brojSezona > 0) {
      for (let season of podaciSezone) {
        let sezonaZa1Povecana = season.season_number || '';
        let episodeCount = season.episode_count || 0;
        let name = season.name || '';
        let overview = season.overview || '';
        let posterPath = season.poster_path || '';
        let airDate = season.air_date || '';
        let tmdbIdSez = season.id || '';
        
        await this.baza.izvrsiUpit(
          "INSERT INTO serija_sezona (broj_sezone, broj_epizoda_u_sezoni, naziv, opis, slika, godina, serija_id_serije, tmdb_id_sez) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [
            sezonaZa1Povecana,
            episodeCount,
            name,
            overview,
            posterPath,
            airDate,
            idserije,
            tmdbIdSez,
          ]
        );
      }
    }
  }

  async dodajUFavorite(serija, zahtjev) {
    let korisnik = zahtjev.session.korime;
    let kor = await this.baza.izvrsiUpit(
      "SELECT id_korisnik FROM korisnik WHERE korime = ?",
      [korisnik]
    );
    let ser = await this.baza.izvrsiUpit(
      "SELECT id_serije FROM serija WHERE tmdb_id =? ",
      [serija.id]
    );
    let userId = kor[0].id_korisnik;
    let idserije = ser[0].id_serije;
    if (userId) {
      let favoriteResult = await this.baza.izvrsiUpit(
        "SELECT COUNT(*) AS broj FROM favoriti WHERE korisnik_id_korisnik = ? AND serija_id_serije = ?",
        [userId, idserije]
      );
      if (favoriteResult[0].broj === 0) {
        console.log("a malo sam i tu");
        let dodajUFavoriteSql = `
          INSERT INTO favoriti (korisnik_id_korisnik, serija_id_serije)
          VALUES (?, ?)`;
        let dodajUFavoriteData = [userId, idserije];
        await this.baza.izvrsiUpit(dodajUFavoriteSql, dodajUFavoriteData);
      }
    }
  }
  async dajFavorite(serija_id, osoba) {
    console.log(osoba);
    console.log("osoba");
    this.baza.spojiSeNaBazu();

    let kor = await this.baza.izvrsiUpit(
        "SELECT id_korisnik FROM korisnik WHERE korime = ?",
        [osoba]
    );

    try {
        if (!kor || !kor[0] || !kor[0].id_korisnik) {
            throw new Error("Greška");
        }

        let korisnik = kor[0].id_korisnik;

        const sql = `
            SELECT ss.*
            FROM serija_sezona ss
            JOIN serija s ON ss.serija_id_serije = s.id_serije
            JOIN favoriti f ON s.id_serije = f.serija_id_serije
            WHERE f.korisnik_id_korisnik = ? AND s.id_serije = ?;
        `;

        const favoriteSeries = await this.baza.izvrsiUpit(sql, [
            korisnik,
            serija_id,
        ]);

        return favoriteSeries;
    } catch (error) {
        console.error("Greška prilikom dohvata iz baze", error);
        throw { error: "Greška" };
    } finally {
        this.baza.zatvoriVezu();
    }
}
}

module.exports = SerijaDAO;
