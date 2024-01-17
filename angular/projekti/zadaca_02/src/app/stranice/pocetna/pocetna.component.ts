import { Component, ElementRef, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pocetna',
  templateUrl: './pocetna.component.html',
  styleUrls: ['./pocetna.component.scss']
})
export class PocetnaComponent implements OnInit {
  prikaz: HTMLElement;
  filter: string = '';
  serije: any[] | null = null;
  stranica: number = 1;
  ukupnoStranica: number = 1;

  constructor(private el: ElementRef, private router:Router) {
    this.prikaz = document.createElement('div');
  }
  ngOnInit() {
    // Initialize prikaz in ngOnInit
    this.prikaz = this.el.nativeElement.querySelector('#stranicenje');
  }
  async onFilterChange() {
    if (this.filter.length >= 3) {
      await this.pretraziSerije();
    }
  }

  async pretraziSerije() {
    try {
      const podaci = await this.fetchSerije(this.filter, this.stranica);
      this.serije = podaci.results;
      this.ukupnoStranica = podaci.total_pages;
      this.prikaziStranicenje();
    } catch (error) {
      console.error("Greška prilikom dohvata", error);
    }
  }

  async fetchSerije(filter: string, stranica: number) {
    const odgovor = await fetch(`api/tmdb/tv?trazi=${filter}&stranica=${stranica}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const podaci = await odgovor.json();
    return podaci;
  }

  prikaziDetalje(serijaId: number) {
    sessionStorage.setItem('currentSerijaId', serijaId.toString());
    this.router.navigate(['/serija-detalji']);
  }

  prikaziStranicenje() {
    const buttons = [];
  
    if (this.stranica > 1) {
      buttons.push({ label: '<<', page: 1 });
      buttons.push({ label: '<', page: this.stranica - 1 });
    }
  
    buttons.push({ label: `${this.stranica}/${this.ukupnoStranica}`, page: this.stranica });
  
    if (this.stranica < this.ukupnoStranica) {
      buttons.push({ label: '>', page: this.stranica + 1 });
      buttons.push({ label: '>>', page: this.ukupnoStranica });
    }
  
    // Update your HTML using property binding
    this.prikaz.innerHTML = buttons.map(button => `<button (click)="pretraziSerije(${button.page})">${button.label}</button>`).join('');
  }
  
  
}
