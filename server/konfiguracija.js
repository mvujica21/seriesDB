const ds = require("fs/promises");
const path = require("path");

class Konfiguracija {
	constructor() {
		this.konf = {};
	}
	dajKonf() {
		return this.konf;
	}
	dajJWTTajniKljuc() {
		return this.konf.jwtTajniKljuc;
	  }
	async ucitajKonfiguraciju() {
		let podaci = await ds.readFile(process.argv[2], "UTF-8");
		this.konf = pretvoriJSONkonfig(podaci);
		let data = this.konf;
		provjeriKljuceve(data)
		console.log(data);
	}
}
function provjeriKljuceve(data){
	const kljucevi = ["jwtValjanost", "jwtTajniKljuc", "tajniKljucSesija", "appStranicenje", "tmdb.apikey.v3", "tmdb.apikey.v4"];
	const nedostaju = kljucevi.filter(kljuc => !(kljuc in data));
	if(nedostaju.length === 0){
		const jwtValjanost = parseInt(data.jwtValjanost, 10);
    	if (isNaN(jwtValjanost) || jwtValjanost < 15 || jwtValjanost > 3600) {
        	throw new Error("jwtValjanost mora biti broj između 15-3600");
   		}
		const jwtTajniKljucRegex = /^[a-zA-Z0-9]{50,100}$/;
		let rezultat = !jwtTajniKljucRegex.test(data.jwtTajniKljuc);
		if (rezultat == true) {
			throw new Error("jwtTajniKljuc mora biti kombinacija velikih i malih slova te brojeva izmedu 50-100 znakova");
		}
		const tajniKljucSesijaRegex = /^[a-zA-Z0-9]{50,100}$/;
		if (!tajniKljucSesijaRegex.test(data.tajniKljucSesija)) {
			throw new Error("tajniKljucSesija mora biti kombinacija velikih i malih slova te brojeva izmedu 50-100 znakova");
		}
		const appStranicenje = parseInt(data.appStranicenje, 10);
		if (isNaN(appStranicenje) || appStranicenje < 5 || appStranicenje > 100) {
			throw new Error("appStranicenje mora biti broj izmedu 5 i 100");
		}

	}else{
		throw new Error(`Kljucevi koji nedostaju su: ${nedostaju.join(", ")}`);
	}

}

function pretvoriJSONkonfig(podaci) {
	let konf = {};
	var nizPodataka = podaci.split("\n");
	for (let podatak of nizPodataka) {
		var podatakNiz = podatak.split(":");
		var naziv = podatakNiz[0];
		var vrijednost = podatakNiz[1].replace(/\r$/, '');
		konf[naziv] = vrijednost;
	}
	return konf;
}

module.exports = Konfiguracija;
