const jwt = require("jsonwebtoken");
const Konfiguracija = require("../../konfiguracija");
let konf = new Konfiguracija();
konf.ucitajKonfiguraciju();

exports.kreirajToken = function (korisnik) {
  const tajniKljucJWT = konf.dajKonf().jwtTajniKljuc;
  const valjanostJWT = konf.dajKonf().jwtValjanost;
  console.log(tajniKljucJWT);
  console.log(valjanostJWT);
  console.log(korisnik);
  let token = jwt.sign(
    {
      korime: korisnik.korime,
    },
    tajniKljucJWT,
    { expiresIn: valjanostJWT + "s" }
  );
  return token;
};

exports.provjeriToken = function (zahtjev, tajniKljucJWT) {
  console.log("tajniKljucJWT");
  console.log(tajniKljucJWT);
  console.log("Provjera tokena: "+zahtjev.headers.authorization);
    if (zahtjev.headers.authorization != null) {
        console.log(zahtjev.headers.authorization);
        let token = zahtjev.headers.authorization.trim().split(' ')[1];
        try {
            let podaci = jwt.verify(token, tajniKljucJWT);
            console.log("JWT podaci: "+podaci);
			return true;
        } catch (e) {
            console.log(e)
            return false;
        }
    }
    return false;
};
exports.dajTijelo = function(token){
	let dijelovi = token.split(".");
	return JSON.parse(dekodirajBase64(dijelovi[1]));
}

