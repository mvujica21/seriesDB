import { Component, OnInit } from '@angular/core';
import { KorisnikPodaciService } from '../../korisnik-podaci.service';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-odjava',
  templateUrl: './odjava.component.html',
  styleUrl: './odjava.component.scss'
})
export class OdjavaComponent implements OnInit{
  private url = environment.url;
  private port = environment.port;
  constructor(private korisnikPodaciService: KorisnikPodaciService, private router: Router) {}
  ngOnInit(): void {
    this.logout();
  }

  async logout() {
    this.korisnikPodaciService.logout();
    try {
      await fetch(`${this.url}${this.port}/odjava`, {
        method: "GET",
        credentials: 'include',
      });
      console.log("Logout successful");
      this.router.navigate(['/pocetna']);
    } catch (error) {
      console.error("Error during logout", error);
    }
  }
}
