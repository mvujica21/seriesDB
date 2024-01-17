import { Component, OnInit, ChangeDetectorRef, OnChanges, SimpleChanges} from '@angular/core';
import { KorisnikPodaciService } from '../korisnik-podaci.service';

@Component({
  selector: 'app-navigacija',
  templateUrl: './navigacija.component.html',
  styleUrl: './navigacija.component.scss'
})
export class NavigacijaComponent implements OnInit{
  uloga: string = '';
  isLogged: boolean = false;

  constructor(private korisnikPodaciService:KorisnikPodaciService) {}
  ngOnInit(): void {
    this.korisnikPodaciService.uloga$.subscribe(uloga => this.uloga = uloga);
    this.korisnikPodaciService.korime$.subscribe(korime => {
      this.isLogged = !!korime;
    });
  }

}
