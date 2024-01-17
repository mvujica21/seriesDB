import express from "express";
import session from "express-session";
import kolacici from "cookie-parser";
import Konfiguracija from "./konfiguracija.js";
import restKorisnik from "./aplikacija/restKorisnik.js"
import RestTMDB from "./aplikacija/restTMDB.js";
import restZapis from "./aplikacija/restZapis.js"
import restFavoriti from "./aplikacija/restFavoriti.js"
import cors from "cors"
import { join, dirname} from 'path';
import path from 'path';
import { fileURLToPath } from 'url';
import autentikacijaAPI from './aplikacija/moduli/autentifikacijaAPI.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


//import portovi from "/var/www/RWA/2023/portovi.js";
//const port = portovi.mvujica21;
const port = 12000;
const server = express();

let konf = new Konfiguracija();
konf
	.ucitajKonfiguraciju()
	.then(pokreniServer)
	.catch((greska) => {
		console.log(greska);
		if (process.argv.length == 2) {
			throw new Error("Niste naveli naziv konf datoteke!");
		} else if(greska.code === 'ENOENT') {
      throw new Error("Datoteka ne postoji: " + greska.path);
  }
	});

function pokreniServer() {
  const corsOptions = {
    origin: 'http://localhost:4200', 
    credentials: true,
  };
  server.use(express.static(join(__dirname, './angular/')));


  server.use(cors(corsOptions));
  server.use(express.urlencoded({ extended: true }));
  server.use(express.json());
  server.use("/js" , express.static("./aplikacija/js"));
  server.use("/dokumentacija", express.static("./aplikacija/dokumentacija"));
  server.use("/css", express.static("./aplikacija/css"))
  server.use(kolacici());
  server.use(
    session({
      secret: konf.dajKonf().tajniKljucSesija,
      saveUninitialized: true,
      cookie: {maxAge: 1000 * 60 * 60 * 3},
      resave: false,
    })
  );

  pripremiPutanjeKorisnik();
  pripremiPutanjeTMDB();
  pripremiPutanjeFavoriti();
  //pripremiPutanjeZapis();
  server.get('/githubPrijava',autentikacijaAPI.githubPrijava);
	server.get('/githubPovratno',autentikacijaAPI.githubPovratno);
	server.get('/githubZasticeno',autentikacijaAPI.githubZasticeno);

  server.get("*", (zahtjev, odgovor) => {
    odgovor.sendFile(__dirname + '/angular/');
  });



  server.use((zahtjev,odgovor) => {
    odgovor.status(404);
    odgovor.json({opis: "Nema resursa"});
  })
  server.listen(port, () => {
    console.log(`Server pokrenut na portu: ${port}`);
  });
}

function pripremiPutanjeKorisnik(){
  server.get("/baza/korisnici", restKorisnik.getKorisnici);
  server.post("/baza/korisnici", restKorisnik.postKorisnici);
  server.put("/baza/korisnici", restKorisnik.putKorisnici);
  server.delete("/baza/korisnici", restKorisnik.deleteKorisnici);

  server.get("/baza/korisnici/:korime", restKorisnik.getKorisnik);
  server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);
  server.put("/baza/korisnici/:korime", restKorisnik.putKorisnik);
  server.delete("/baza/korisnici/:korime", restKorisnik.deleteKorisnik);

  server.get("/baza/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava);
  server.post("/baza/korisnici/:korime/prijava", restKorisnik.postKorisnikPrijava);
  server.put("/baza/korisnici/:korime/prijava", restKorisnik.putKorisnikPrijava);
  server.delete("/baza/korisnici/:korime/prijava", restKorisnik.deleteKorisnikPrijava);

  server.get("/getKorisnik", restKorisnik.dohvatiKorisnikaIzSesije);
  server.get("/odjava", restKorisnik.odjava);
}
function pripremiPutanjeFavoriti(){
  server.get("/baza/favoriti", restFavoriti.getFavoriti);
  server.post("/baza/favoriti", restFavoriti.postFavoriti);
  server.put("/baza/favoriti", restFavoriti.putFavoriti);
  server.delete("/baza/favoriti", restFavoriti.deleteFavoriti);
  server.get("/baza/favoriti/:id", restFavoriti.getFavorit);
  server.post("/baza/favoriti/:id", restFavoriti.postFavorit);
  server.put("/baza/favoriti/:id", restFavoriti.putFavorit);
  server.delete("/baza/favoriti/:id", restFavoriti.deleteFavorit);
}

function pripremiPutanjeTMDB() {
	let restTMDB = new RestTMDB(konf.dajKonf()["tmdb.apikey.v3"]);
	server.get("/api/tmdb/zanr", restTMDB.getZanr.bind(restTMDB));
	server.get("/api/tmdb/tv", restTMDB.getTvSerije.bind(restTMDB));
	server.get("/api/tmdb/id", restTMDB.pronadiTvSeriju.bind(restTMDB));
}
/*
function pripremiPutanjeZapis() {
	server.get("/baza/dnevnik", restZapis.getZapis);
	server.post("/baza/dnevnik", restZapis.postZapis);
	server.put("/baza/dnevnik", restZapis.postZapis);
	server.delete("/baza/dnevnik", restZapis.deleteZapis);
}*/
function pripremiPutanjeHTML(){
  let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc);
  server.get("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
  server.get("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
  server.get("/korisnici", htmlUpravitelj.korisnici.bind(htmlUpravitelj));
  server.get("/profil", htmlUpravitelj.profil.bind(htmlUpravitelj));
  server.get("/pocetna", htmlUpravitelj.pocetna.bind(htmlUpravitelj));
  server.get("/serijaDetalji", htmlUpravitelj.serijaDetalji.bind(htmlUpravitelj));
  server.get("/dokumentacija", htmlUpravitelj.dokumentacija.bind(htmlUpravitelj));
  server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
  server.get("/serijaDetalji", htmlUpravitelj.serijaDetalji.bind(htmlUpravitelj));
  server.get("/favoriti", htmlUpravitelj.favoriti.bind(htmlUpravitelj));
  server.get("/favoritiDetalji", htmlUpravitelj.favoritiDetalji.bind(htmlUpravitelj));
  server.get("/", htmlUpravitelj.pocetna.bind(htmlUpravitelj));
}
