import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-prijava',
  templateUrl: './prijava.component.html',
  styleUrl: './prijava.component.scss',
})
export class PrijavaComponent {
  githubToken: string | undefined; 
  private url = environment.url;
  private port = environment.port;
  korime: string = '';
  lozinka: string = '';
  greska: string = '';
  totpKey: string = '';
  korimeEmpty: boolean = false;
  lozinkaEmpty: boolean = false;
  showTOTPInput: boolean = false;

  constructor(
    private router: Router,
    private korisnikPodaciService: KorisnikPodaciService,
    private recaptchaV3Service: ReCaptchaV3Service,) { }

  onSubmit() {
    this.korime = this.korime.trim();
    this.lozinka = this.lozinka.trim();
    this.totpKey = this.totpKey.trim();

    if (!this.korime || !this.lozinka) {
      if (!this.korime) {
        this.korimeEmpty = true;
        this.greska = '';
      } else {
        this.korimeEmpty = false;
      }

      if (!this.lozinka) {
        this.lozinkaEmpty = true;
        this.greska = '';
      } else {
        this.lozinkaEmpty = false;
      }

      return;
    }

    this.korimeEmpty = false;
    this.lozinkaEmpty = false;

    const podaciZaPrijavu = {
      korime: this.korime,
      lozinka: this.lozinka,
      recaptchaToken: '',
      totpKey: this.totpKey,
    };

    const prijavaUrl = `${this.url}${this.port}/baza/korisnici/${this.korime}/prijava`;
    this.recaptchaV3Service.execute('prijava').subscribe((token) => {
      podaciZaPrijavu.recaptchaToken = token;

      fetch(prijavaUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(podaciZaPrijavu),
        credentials: 'include',
      })
      .then((response) => {
        if (response.status === 404) {
          throw new Error('Korisnik ne postoji.');
        } else if (response.status === 400) {
          return response.json().then((data) => {
            if (data.greska === "Totp nije ispravan.") {
              throw new Error('Totp nije ispravan.', data.greska);
            } else {
              throw new Error('Pogrešna lozinka.');
            }
          });
        } else if (response.status === 412) {
          this.showTOTPInput = true;
          throw new Error('Treba mi totp.(unesi neki random totp, posalji, pa pogledaj u konzolu od servera ako ti kljuc nije ispravan)');
        }
        return response.json();
      })
      
        .then((data) => {
          console.log('Uspješna prijava', data);
          this.korisnikPodaciService.updateUloga(data.uloga);
          this.korisnikPodaciService.updateKorime(data.korime);
          this.router.navigate(['/pocetna']);
        })
        .catch((error) => {
          console.error('Greška prilikom prijave', error.message);
          this.greska = error.message;
        });
    });
  }
  loginWithGitHub() {
    const githubAuthUrl = `${this.url}${this.port}/githubPrijava`;
  
    console.log('Redirecting to GitHub for authentication...');
    window.location.href = githubAuthUrl;
  
    const handleGitHubCallback = (event: MessageEvent) => {
      console.log('Received a message:', event.data);
  
      if (event.origin === `${this.url}${this.port}` && event.data === 'githubCallback') {
        console.log('GitHub callback received. Removing event listener...');
        window.removeEventListener('message', handleGitHubCallback);
  
        // Redirect to /githubPovratno for handling the GitHub callback
        console.log('Redirecting to /githubPovratno...');
        window.location.href = `${this.url}${this.port}/githubPovratno`;
      }
    };
  
    // Add an event listener to handle messages
    console.log('Adding event listener for messages...');
    window.addEventListener('message', handleGitHubCallback);
  }
  
  
  
  
  getGitHubCookies() {
    const allCookies = document.cookie;
    const cookiesArray = allCookies.split('; ');
  
    const githubCookies: { [key: string]: string } = {};
    cookiesArray.forEach(cookie => {
      const [name, value] = cookie.split('=');
      githubCookies[name] = value;
    });
  
    return githubCookies;
  }
  
}
