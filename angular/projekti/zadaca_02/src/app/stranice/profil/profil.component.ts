import { Component, OnInit } from '@angular/core';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  styleUrl: './profil.component.scss'
})
export class ProfilComponent implements OnInit {
  private url = environment.url;
  private port = environment.port;
  korime: string = '';
  podaci: any = {};
  returnMessage: string = '';

  constructor(private korisnikPodaciService: KorisnikPodaciService, private recaptchaV3Service: ReCaptchaV3Service) { }
  ngOnInit(): void {
    this.korisnikPodaciService.korime$.subscribe(korime => this.korime = korime)
    this.popuniPodatke();
  }
  async popuniPodatke() {
    let jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);
    if (jwttoken){
      this.podaci = await dohvatiPodatkeOKorisniku(this.korime, this.url, this.port, jwttoken);
    }
    else
      console.error("Neuspješno dohvacanje jwttokena");
  }
  async onSubmit() {
    let jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);
    if (jwttoken)
      await azurirajKorisnika(this.recaptchaV3Service, this.url, this.port, this.korime, jwttoken, this.podaci, this.returnMessage);
    else
      console.error("Neuspješno dohvacanje jwttokena");
  }
}
async function azurirajKorisnika(recaptchaV3Service: ReCaptchaV3Service, url: string, port: string, korime: string, jwttoken: string, podaci: any, returnMessage:string) {
  try {
    const reCaptchaToken = await lastValueFrom(recaptchaV3Service.execute('azuriranje'));
    if (!reCaptchaToken) {
      console.error('reCaptcha verification failed');
      return;
    }
    podaci.reCaptchaToken = reCaptchaToken;
    console.log(podaci);
    console.log("podaci");
    const odgovor = await fetch(`${url}${port}/baza/korisnici/${korime}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwttoken,
      },
      body: JSON.stringify(podaci),
    });

    if (odgovor.ok) {
      const response = await odgovor.json();
      if (response.totp) {
        returnMessage = `Korisnik uspješno ažuriran. Novi TOTP: ${response.totp}`;
      } else {
        returnMessage = 'Korisnik uspješno ažuriran';
      }
    } else {
      console.error("Greška prilikom ažuriranja korisnika");
      returnMessage = 'Greška prilikom ažuriranja korisnika';
    }
  } catch (error) {
    console.error("Greška prilikom ažuriranja korisnika", error);
    returnMessage = 'Greška prilikom ažuriranja korisnika';
  }
}
async function dohvatiPodatkeOKorisniku(korime: string, url: string, port: string, jwttoken: string) {
  try {
    const odgovor = await fetch(`${url}${port}/baza/korisnici/${korime}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + jwttoken,
      },
    });

    if (odgovor.ok) {
      console.log("Podaci uspješno dohvaćeni");
      return await odgovor.json();
    } else {
      console.error("Greška prilikom dohvaćanja podataka o korisniku");
      return null;
    }
  } catch (error) {
    console.error("Greška prilikom dohvaćanja podataka o korisniku", error);
    return null;
  }
}
