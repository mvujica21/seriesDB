BEGIN;
CREATE TABLE "uloge"(
  "id_uloge" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(100) NOT NULL,
  "opis" VARCHAR(100)
);
CREATE TABLE "serija"(
  "id_serije" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(200) NOT NULL,
  "opis" VARCHAR(500) NOT NULL,
  "broj_sezona" INTEGER NOT NULL,
  "broj_epizoda" INTEGER NOT NULL,
  "popularnost" INTEGER NOT NULL,
  "slika" VARCHAR(200) NOT NULL,
  "godina" DATE NOT NULL,
  "tmdb_id" INTEGER NOT NULL
);
CREATE TABLE "serija_sezona"(
  "id_sezone" INTEGER PRIMARY KEY NOT NULL,
  "broj_sezone" INTEGER NOT NULL,
  "broj_epizoda_u_sezoni" INTEGER NOT NULL,
  "naziv" VARCHAR(200) NOT NULL,
  "opis" VARCHAR(500) NOT NULL,
  "slika" VARCHAR(200) NOT NULL,
  "godina" DATE NOT NULL,
  "serija_id_serije" INTEGER NOT NULL,
  "tmdb_id_sez" INTEGER,
  CONSTRAINT "fk_serija_sezona_serija1"
    FOREIGN KEY("serija_id_serije")
    REFERENCES "serija"("id_serije")
);
CREATE INDEX "serija_sezona.fk_serija_sezona_serija1_idx" ON "serija_sezona" ("serija_id_serije");
CREATE TABLE "korisnik"(
  "id_korisnik" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "ime" VARCHAR(100),
  "prezime" VARCHAR(100),
  "korime" VARCHAR(50) NOT NULL,
  "lozinka" VARCHAR(100) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "telefon" VARCHAR(100),
  "grad" VARCHAR(100),
  "drzava" VARCHAR(100),
  "totp" VARCHAR(20),
  "totp_active" BOOLEAN,
  "uloge_id_uloge" INTEGER NOT NULL,
  CONSTRAINT "korime_UNIQUE"
    UNIQUE("korime"),
  CONSTRAINT "email_UNIQUE"
    UNIQUE("email"),
  CONSTRAINT "fk_korisnik_uloge1"
    FOREIGN KEY("uloge_id_uloge")
    REFERENCES "uloge"("id_uloge")
);
CREATE INDEX "korisnik.fk_korisnik_uloge1_idx" ON "korisnik" ("uloge_id_uloge");
CREATE TABLE "favoriti"(
  "korisnik_id_korisnik" INTEGER NOT NULL,
  "serija_id_serije" INTEGER NOT NULL,
  PRIMARY KEY("korisnik_id_korisnik","serija_id_serije"),
  CONSTRAINT "fk_favoriti_korisnik1"
   FOREIGN KEY ("korisnik_id_korisnik")
   REFERENCES "korisnik" ("id_korisnik")
   ON DELETE CASCADE,
CONSTRAINT "fk_favoriti_serija1"
   FOREIGN KEY ("serija_id_serije")
   REFERENCES "serija" ("id_serije")
);
CREATE INDEX "favoriti.fk_favoriti_serija1_idx" ON "favoriti" ("serija_id_serije");
CREATE TABLE "dnevni_zapis"(
  "id_zapis" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "datum" DATE NOT NULL,
  "vrijeme" DATETIME NOT NULL,
  "vrsta_zahtjeva" VARCHAR(100) NOT NULL,
  "trazeni_resurs" VARCHAR(100) NOT NULL,
  "tijelo" VARCHAR(200),
  "korisnik_id_korisnik" INTEGER NOT NULL,
  CONSTRAINT "fk_dnevnik_korisnik1"
    FOREIGN KEY("korisnik_id_korisnik")
    REFERENCES "korisnik"("id_korisnik")
);
CREATE INDEX "dnevni_zapis.fk_dnevnik_korisnik1_idx" ON "dnevni_zapis" ("korisnik_id_korisnik");
COMMIT

