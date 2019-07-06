CREATE DATABASE var_astro_cz;
CREATE DATABASE var_astro_cz_ocgate;
CREATE USER 'root'@'localhost' IDENTIFIED BY 'root';
UPDATE identif SET MODIFIED='1970-01-01' WHERE MODIFIED='0000-00-00';
CREATE INDEX identif_ids_index ON identif(NSTAR, NCONS);
UPDATE bright SET MODIFIED='1970-01-01' WHERE MODIFIED='0000-00-00';
CREATE INDEX bright_ids_index ON bright(NSTAR, NCONS);
UPDATE element SET MODIFIED='1970-01-01' WHERE MODIFIED='0000-00-00';
CREATE INDEX element_ids_index ON element(NSTAR, NCONS);
UPDATE minima SET MODIFIED='1970-01-01' WHERE MODIFIED='0000-00-00';
CREATE INDEX minima_ids_index ON minima(NSTAR, NCONS);



CREATE VIEW `oc_ConstellationSummary` AS SELECT c.id AS constellation_id, COUNT(*) as starCount FROM common_Constellation c JOIN oc_Star s on c.id = s.constellation_id GROUP BY c.id;

CREATE VIEW oc_ElementMinimaCount AS select e.id as element_id, COUNT(*) as minimaCount, SUM(CASE WHEN me.name = 'CCD/Photoelectric' THEN 1 ELSE 0 END) as ccdCount From oc_StarElement e LEFT JOIN oc_StarMinima m ON e.id = m.element_id LEFT JOIN oc_ObservationMethod me ON me.id = m.method_id GROUP BY e.id;

CREATE VIEW oc_StarMinimaCount AS select e.star_id as star_id, COUNT(*) as minimaCount From oc_StarElement e LEFT JOIN oc_StarMinima m ON e.id = m.element_id GROUP BY e.star_id;

