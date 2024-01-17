tajniKljucCaptcha = '6LcLPkApAAAAAJrAoP0t2nlmuIM5y6RrCfufzSuO';
exports.provjeriRecaptchu = async function (token){
	//console.log(token);
	let parametri = {method: 'POST'}
	let o = await fetch("https://www.google.com/recaptcha/api/siteverify?secret="+tajniKljucCaptcha+"&response="+token,parametri);
	let recaptchaStatus = JSON.parse(await o.text());
	console.log(recaptchaStatus);
	if(recaptchaStatus.success && recaptchaStatus.score > 0.5)
		return true;
	return false;
}
