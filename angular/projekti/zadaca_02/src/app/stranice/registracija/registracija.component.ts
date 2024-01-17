import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { lastValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-registracija',
  templateUrl: './registracija.component.html',
  styleUrls: ['./registracija.component.scss']
})
export class RegistracijaComponent implements OnInit {
  private url = environment.url;
  private port = environment.port;
  korime: string = '';
  podaciZaRegistraciju: FormGroup;

  constructor(private fb: FormBuilder, private korisnikPodaciService: KorisnikPodaciService, private recaptchaV3Service: ReCaptchaV3Service) {
    this.podaciZaRegistraciju = this.fb.group({
      ime: ['', Validators.required],
      prezime: ['', Validators.required],
      korime: ['', Validators.required],
      lozinka: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefon: [''],
      grad: [''],
      drzava: [''],
      uloge_id_uloge: [2 , Validators.required]
    });
  }

  ngOnInit(): void {
    this.korisnikPodaciService.korime$.subscribe(korime => this.korime = korime);
  }

  async onSubmit() {
    const jwttoken = await this.korisnikPodaciService.dohvatiToken(this.korime);
    if (jwttoken !== null) {
      const registriran = await registrirajKorisnika(this.url, jwttoken, this.podaciZaRegistraciju, this.recaptchaV3Service, this.port);
      if (registriran) {
        console.log("Korisnik je uspješno registriran");
      } else {
        console.error("Korisnik nije registriran");
      }
    } else {
      console.error("Neuspješno dohvacanje tokena")
    }

  }
}

async function registrirajKorisnika(url: string, token: string, podaciZaRegistraciju: FormGroup, recaptchaV3Service: ReCaptchaV3Service, port: string) {
  try {
    const podaci = podaciZaRegistraciju.value;
    const reCaptchaToken = await lastValueFrom(recaptchaV3Service.execute('registracija'));
    if (!reCaptchaToken) {
      console.error('reCaptcha verification failed');
      return;
    }
    podaci.reCaptchaToken = reCaptchaToken;
    

    const odgovor = await fetch(`${url}${port}/baza/korisnici`, {
      method: "post",
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
        credentials: 'include',
      },
      body: JSON.stringify(podaci)
    });

    if (odgovor.ok) {
      console.log("Korisnik uspješno registriran");
      return true;
    } else {
      console.error("Greška prilikom registriranja korisnika");
      return false;
    }
  } catch (error) {
    console.error("Greška prilikom registracije", error);
    return false;
  }
}
