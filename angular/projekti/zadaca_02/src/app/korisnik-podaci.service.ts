import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KorisnikPodaciService {
  private url = environment.url;
  private port = environment.port;

  async dohvatiToken(korime:string): Promise<string | null>{
    try {
      let odgovor = await fetch(this.url + this.port + `/baza/korisnici/${korime}/prijava`, {
        method: "GET",
      });
      const jwtFromHeader = odgovor.headers.get("Authorization");
      let podaci = await odgovor.json();
      return jwtFromHeader;
    } catch (error) {
      console.error("Greška prilikom dohvaćanja tokena iz sesije", error);
      return null;
    }
  }

  private ulogaSubject = new BehaviorSubject<string>('3');
  uloga$ = this.ulogaSubject.asObservable();
  private korimeSubject = new BehaviorSubject<string>('');
  korime$ = this.korimeSubject.asObservable();

  updateUloga(uloga: string) {
    this.ulogaSubject.next(uloga);
    sessionStorage.setItem('uloga',uloga);
  }

  updateKorime(korime: string){
    this.korimeSubject.next(korime);
    sessionStorage.setItem('korime', korime);
  }
  logout() {
    this.updateUloga('3');
    this.updateKorime('');

    sessionStorage.clear();
  }
  constructor() {
    const storedUloga = sessionStorage.getItem('uloga');
    const storedKorime = sessionStorage.getItem('korime');

    if (storedUloga) {
      this.ulogaSubject.next(storedUloga);
    }

    if (storedKorime) {
      this.korimeSubject.next(storedKorime);
    }
  }
}
