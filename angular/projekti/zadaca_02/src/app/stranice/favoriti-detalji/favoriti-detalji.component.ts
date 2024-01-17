import { Component, OnInit } from '@angular/core';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { ActivatedRoute} from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-favoriti-detalji',
  templateUrl: './favoriti-detalji.component.html',
  styleUrl: './favoriti-detalji.component.scss'
})
export class FavoritiDetaljiComponent implements OnInit {
  private url = environment.url;
  private port = environment.port;
  korime: string = '';
  podaci: any[] | null = null; 
  currentUrl: string = '';


  constructor(private korisnikPodaciService:KorisnikPodaciService, 
    private router:ActivatedRoute,
    private location: Location
    ){}

  ngOnInit(): void {
    this.korisnikPodaciService.korime$.subscribe(korime => this.korime = korime);
    this.router.queryParams.subscribe(params => {
      const serijaId = params['serija_id'];
      if (!isNaN(serijaId)) {
        this.ucitajPodatkeSezone(Number(serijaId));
      }
    });
  }
  async ucitajPodatkeSezone(serijaId: number): Promise<any | null> {
    const jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);
    if(jwttoken !== null){
      this.podaci = await podaciSezone(serijaId, this.url, jwttoken, this.port);
    }else{
      console.error("Nisam uspjeo dohvatiti token");
    }
  }
 
}
async function podaciSezone(serijaId:number, url:string, token:string, port:string): Promise <any | null> {
  try{
    const odgovor = await fetch(`${url}${port}/baza/favoriti/${serijaId}`,{
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
