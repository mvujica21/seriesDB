const totp = require("totp-generator")
const crypto = require('crypto');
const base32  = require('base32-encoding')

exports.kreirajTajniKljuc = function(korime){
	let tekst = korime + new Date() + dajNasumceBroj(10000000,90000000);
	let hash = kreirajSHA256(tekst);
	let tajniKljuc = base32.stringify(hash,"ABCDEFGHIJKLMNOPRSTQRYWXZ234567");
	return tajniKljuc.toUpperCase();
}

exports.provjeriTOTP = function(uneseniKod,tajniKljuc){
	const kod = totp(tajniKljuc, {
		digits: 6,
		algorithm: "SHA-512",
		period: 60
	});
	console.log(kod);
	console.log("kod");
	console.log(uneseniKod);
	console.log("uneseniKod");
	if(uneseniKod == kod)
		return true;
		
    return false;
}
function kreirajSHA256 (tekst){
	const hash = crypto.createHash('sha256');
	hash.write(tekst);
	var izlaz = hash.digest('hex');
	hash.end();
	return izlaz;
}
function dajNasumceBroj(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); 
  }