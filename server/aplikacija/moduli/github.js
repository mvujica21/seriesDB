githubId = "69a697589205748a0799";
githubTajniKljuc = "4163b02068b5d004a60d28c94330eb37f4c6ceb0";

exports.dajGithubAuthURL = function(povratniURL){
	let url = "https://github.com/login/oauth/authorize?client_id="+githubId+"&redirect_uri="+povratniURL;
	console.log("mjau")
	return url;
}

exports.dajAccessToken = async function(dobiveniKod){
	console.log("tu sam")
	let parametri = {method: "POST", headers: {Accept: "application/json"}}
	let urlParametri = "?client_id="+githubId+"&client_secret="+githubTajniKljuc+"&code="+dobiveniKod;
	let o = await fetch("https://github.com/login/oauth/access_token"+urlParametri,parametri);
	let podaci = await o.text();
	console.log(podaci);
	return  JSON.parse(podaci).access_token;
}

exports.provjeriToken = async function(token){
	console.log("ovdje sam")
	let parametri = {method: "GET", headers: {Authorization: "Bearer "+token}}
	let o = await fetch("https://api.github.com/user",parametri);
	let podaci = await o.text();
	return podaci;
}
