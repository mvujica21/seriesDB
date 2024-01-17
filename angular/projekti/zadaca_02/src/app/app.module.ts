import { Component, NgModule } from '@angular/core';
import { BrowserModule} from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { PrijavaComponent } from './stranice/prijava/prijava.component';
import { FavoritiComponent } from './stranice/favoriti/favoriti.component';
import { FavoritiDetaljiComponent } from './stranice/favoriti-detalji/favoriti-detalji.component';
import { KorisniciComponent } from './stranice/korisnici/korisnici.component';
import { PocetnaComponent } from './stranice/pocetna/pocetna.component';
import { ProfilComponent } from './stranice/profil/profil.component';
import { RegistracijaComponent } from './stranice/registracija/registracija.component';
import { SerijaDetaljiComponent } from './stranice/serija-detalji/serija-detalji.component';
import { NavigacijaComponent } from './navigacija/navigacija.component';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule, withFetch } from '@angular/common/http';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from "ng-recaptcha";
import { OdjavaComponent } from './stranice/odjava/odjava.component';
import { environment } from '../environments/environment';
import { DokumentacijaComponent } from './stranice/dokumentacija/dokumentacija.component';
const routes: Routes =[
  {path: '', redirectTo: '/pocetna', pathMatch:'full'},
  {path: 'pocetna', title:'Početna',component:PocetnaComponent},
  {path: 'prijava', title:'Prijava',component:PrijavaComponent},
  {path: 'odjava', title:'Odjava',component:OdjavaComponent},
  {path: 'favoriti', title:'Favoriti',component:FavoritiComponent},
  {path: 'profil', title:'Profil',component:ProfilComponent},
  {path: 'korisnici', title:'Korisnici',component:KorisniciComponent},
  {path: 'registracija', title:'Registracija',component:RegistracijaComponent},
  {path: 'favoriti-detalji', title:'Detalji favorita', component:FavoritiDetaljiComponent},
  {path: 'serija-detalji', title:'Detalji serije', component:SerijaDetaljiComponent},
  {path: 'dokumentacija', title:'Dokumentacija', component:DokumentacijaComponent},
  {path: '**', redirectTo: '/pocetna', pathMatch:'full'},
];

@NgModule({
  declarations: [
    AppComponent,
    PrijavaComponent,
    FavoritiComponent,
    FavoritiDetaljiComponent,
    KorisniciComponent,
    PocetnaComponent,
    ProfilComponent,
    RegistracijaComponent,
    SerijaDetaljiComponent,
    NavigacijaComponent,
    OdjavaComponent,
    DokumentacijaComponent
  ],
  imports: [
    BrowserModule, FormsModule, RouterModule, RouterModule.forRoot(routes), HttpClientModule, ReactiveFormsModule, RecaptchaV3Module
  ],
  providers: [
    {
      provide: HttpClient,
      useClass: HttpClient,
      deps: [withFetch]
    },
    HttpClientModule,
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: environment.recaptcha.siteKey }, 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
