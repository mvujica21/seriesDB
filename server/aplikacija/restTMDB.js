const TMDBklijent = require("./klijentTMDB.js");

class RestTMDB {

    constructor(api_kljuc) {
        this.tmdbKlijent = new TMDBklijent(api_kljuc);
        console.log(api_kljuc);

        //this.tmdbKlijent.dohvatiFilm(500).then(console.log).catch(console.log);
    }

    getZanr(zahtjev, odgovor) {
        console.log(this);
        this.tmdbKlijent.dohvatiZanrove().then((zanrovi) => {
            odgovor.type("application/json")
            odgovor.send(zanrovi);
        }).catch((greska) => {
            odgovor.json(greska);
        });
    }

    getTvSerije(zahtjev, odgovor) {
        console.log(this);
        odgovor.type("application/json")
        let stranica = zahtjev.query.stranica;
        let trazi = zahtjev.query.trazi;

        if(stranica == null || trazi==null){
            odgovor.status("417");
            odgovor.send({greska: "neocekivani podaci"});
            return;
        }

        this.tmdbKlijent.pretraziTvSerijePoNazivu(trazi,stranica).then((tvSerije) => {
            odgovor.send(tvSerije);
        }).catch((greska) => {
            odgovor.json(greska);
        });
    }
    filmoviPretrazivanje = async function (zahtjev, odgovor) {
			let str = zahtjev.query.str;
			let filter = zahtjev.query.filter;
			odgovor.json(await this.fp.dohvatiFilmove(str, filter));
	};
    async pronadiTvSeriju(zahtjev, odgovor) {
        try {
            let id = zahtjev.query.id;
            let tvSerija = await this.tmdbKlijent.dohvatiTvSeriju(id);

            odgovor.type("application/json");
            odgovor.send(tvSerija);
        } catch (error) {
            console.error(error);
            odgovor.status(500).json({ greska: "Internal Server Error" });
        }
    }

}

module.exports = RestTMDB;
