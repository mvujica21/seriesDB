const github = require("./github.js");
exports.githubPrijava =  function(zahtjev,odgovor)  {
	let url = github.dajGithubAuthURL("http://localhost:12000/githubPovratno");
	console.log("mrnjaaaaao")
	odgovor.redirect(url);
}

exports.githubPovratno = async function(zahtjev,odgovor){
	console.log("mrnjao")
	console.log(zahtjev.query);
	let token = await github.dajAccessToken(zahtjev.query.code);
	zahtjev.session.githubToken = token;
	odgovor.redirect("/githubZasticeno");
}

exports.githubZasticeno =  async function(zahtjev,odgovor)  {
	console.log("sui")
	odgovor.send(await github.provjeriToken(zahtjev.session.githubToken));
}