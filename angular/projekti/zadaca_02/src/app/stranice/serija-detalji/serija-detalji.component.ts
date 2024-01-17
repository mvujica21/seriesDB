import { Component, OnInit } from '@angular/core';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-serija-detalji',
  templateUrl: './serija-detalji.component.html',
  styleUrl: './serija-detalji.component.scss'
})
export class SerijaDetaljiComponent implements OnInit {
  private url = environment.url;
  private port = environment.port;
  korime: string = '';
  serijaDetalji: any;
  uloga: number = 3;
  constructor(private korisnikPodaciService:KorisnikPodaciService){}
  

  ngOnInit(): void {
    this.korisnikPodaciService.uloga$.subscribe(uloga => this.uloga = +uloga);
    this.korisnikPodaciService.korime$.subscribe(korime => this.korime = korime);
    const serijaId = sessionStorage.getItem('currentSerijaId');
    if(serijaId){
      this.dohvatiPodatkeSerije(parseInt(serijaId, 10));
    }
  }
  async dohvatiPodatkeSerije(id:number){
    try{
      const odgovor = await fetch(`${this.url}${this.port}/api/tmdb/id?id=${id}`);
      if (!odgovor.ok) {
        console.error(`Grepka prilikom dohvata serija: ${odgovor.status}`);
        return;
      }
      this.serijaDetalji = await odgovor.json();
    }catch(error){
      console.error("Greška prilkom dohvata detalja o seriji", error);
    }
  }
  async dodajFavorit(){
    const serijaId = sessionStorage.getItem('currentSerijaId');
    if (!serijaId) {
      console.error("Serija se ne nalazi u spremištu.");
      return;
    }
    const jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);
    if(jwttoken !== null)
      await dodajUFavorite(this.url, parseInt(serijaId, 10),jwttoken, this.serijaDetalji, this.port, this.korime, this.korisnikPodaciService);
    else
      console.error("Greška prilikom dohvata jwttokena")
  }
}
async function dodajUFavorite(url:string,serijaId:number, token:string, serijaDetalji:any, port:string, korime:string, korisnikPodaciService:KorisnikPodaciService) {
  if(!serijaId){
    console.error("Serija se ne nalazi u spremištu.");
    return;
  }
  const jwttoken = await korisnikPodaciService.dohvatiToken(korime);
  if(jwttoken == null){
    console.error("Greška prilikom dohvata jwttokena");
    return;
  }

 try{ 
  const zahtjev = await fetch(`${url}${port}/baza/favoriti`, {
    method:"post",
    headers:{
      "content-type" : "application/json",
      authorization: "Bearer "+ token,
    },
    body:JSON.stringify({
      seriesId: serijaId,
      name: serijaDetalji.name,
      overview: serijaDetalji.overview,
      number_of_seasons: serijaDetalji.number_of_seasons,
      number_of_episodes: serijaDetalji.number_of_episodes,
      popularity: serijaDetalji.popularity,
      poster_path: serijaDetalji.poster_path,
      first_air_date: serijaDetalji.first_air_date,
      id: serijaDetalji.id,
      seasons: serijaDetalji.seasons,
    })
  });
  if(zahtjev.ok){
    console.log("Uspješno dodano u favorite")
  }else{
    console.error("Greška prilikom dodavanja u favorite");
    return;
  }
  }catch(error){
    console.error("Greška");
  }
}

