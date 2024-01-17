import { Component, OnInit } from '@angular/core';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-korisnici',
  templateUrl: './korisnici.component.html',
  styleUrl: './korisnici.component.scss'
})
export class KorisniciComponent implements OnInit {
  private url = environment.url;
  private port = environment.port;
  korime: string = '';
  korisnici: any[] | null = null;
  koris: string = '';

  constructor(private korisnikPodaciService: KorisnikPodaciService) { }

  ngOnInit(): void {
    this.korisnikPodaciService.korime$.subscribe(korime => this.korime = korime);
    this.ucitajKorisnike();
  }
  async ucitajKorisnike() {
    const jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);
    if (jwttoken !== null)
      this.korisnici = await sviKorisnici(jwttoken, this.url, this.port);
    else
      console.error("Greška prilikom dohvata jwttokena")
  }
  async onDelete(koris: string) {
    const jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);
    if (jwttoken  !== null) {
      const obrisan = await obrisiKorisnika(jwttoken, this.url, koris, this.port)
      if (obrisan) {
        this.ucitajKorisnike();
      }
      else
        console.error("Neuspješno brisanje korisnika");
    }
    else
      console.error("Greška prilikom dohvata jwttokena");
  }
}
async function sviKorisnici(token: string, url: string, port:string) {
  try {
    const odgovor = await fetch(`${url}${port}/baza/korisnici`, {
      method: "GET",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
        credentials: 'include',
      },
    });
    let podaci = await odgovor.json();
    return podaci;
  } catch (error) {
    console.error("greska prilikom dohvata korisnika", error);
    return null;
  }
}
async function obrisiKorisnika(token: string, url: string, koris: string, port:string) {
  try {
    const zahtjev = await fetch(`${url}${port}/baza/korisnici/${koris}`, {
      method: 'delete',
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ koris }),
    });
    if (zahtjev.ok) {
      console.log("Korisnik uspješno obrisan")
      return true;
    } else {
      console.log("Greška prilikom brisanja korisnika")
      return false;
    }
  } catch (error) {
    console.error("Greška prilikom brisanja korisnika", error);
    return null;
  }
}
