CREATE DATABASE var_astro_cz;
CREATE DATABASE var_astro_cz_ocgate;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';
CREATE INDEX identif_ids_index ON identif(NSTAR, NCONS);
CREATE INDEX bright_ids_index ON bright(NSTAR, NCONS);
CREATE INDEX element_ids_index ON element(NSTAR, NCONS);
CREATE INDEX minima_ids_index ON minima(NSTAR, NCONS);
