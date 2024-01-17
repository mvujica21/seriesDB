import { Component, OnInit } from '@angular/core';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

//dohvati svaki put post prijavu da ne istekne token
@Component({
  selector: 'app-favoriti',
  templateUrl: './favoriti.component.html',
  styleUrl: './favoriti.component.scss'
})
export class FavoritiComponent implements OnInit{

  private url = environment.url;
  private port = environment.port;
  korime: string = '';
  favoriti: any[] | null = null;
  
  constructor(private korisnikPodaciService:KorisnikPodaciService, private router: Router){}

  ngOnInit(): void {
    this.korisnikPodaciService.korime$.subscribe(korime => this.korime = korime);
    this.ucitajFavorite();
  }
  async ucitajFavorite() {
    const jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);

    if (jwttoken !== null) {
      this.favoriti = await SviFavoriti(jwttoken, this.port, this.url);
    } else {
      console.error('Nisam uspjeo dohvatiti token.');
    }
  }
  detaljiFavorita(idSerije: number){
    this.router.navigate(['/favoriti-detalji'], { queryParams: { serija_id: idSerije } });
  }
}

async function SviFavoriti(token:string, port:string, url:string): Promise<any | null>{
  try{
    const odgovor = await fetch(`${url}${port}/baza/favoriti`,{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer "+ token,
        credentials: 'include', //obrisi kad posluzis
      },
    });
    let podaci = await odgovor.json();
    return podaci;
  }catch(error){
    console.error("Greška prilikom dohvata favorita", error);
    return null;
  }
}
