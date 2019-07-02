package cz.astro.`var`.data.oc.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
interface StarRepository : JpaRepository<Star, Int> {
    fun findByConstellation(constellation: String): List<Star>

    @Query("select new cz.astro.var.data.oc.repository.ConstellationStarSummary(s.constellation, COUNT(s)) from Star s GROUP BY s.constellationId, s.constellation ORDER BY s.constellationId")
    fun findAllConstellationStarSummary(): Set<ConstellationStarSummary>

    @Query("select new cz.astro.var.data.oc.repository.StarMinimaSummary(s.id, s.constellation, s.starName, COUNT(m)) from StarMinima m JOIN Star s ON m.constellationId = s.constellationId AND m.starId = s.starId GROUP BY s.id, s.starId, s.constellation, s.starName ORDER BY s.starId")
    fun findAllStarMinimaSummary(): List<StarMinimaSummary>

    @Query("select new cz.astro.var.data.oc.repository.StarMinimaSummary(s.id, s.constellation, s.starName, COUNT(m)) from StarMinima m JOIN Star s ON m.constellationId = s.constellationId AND m.starId = s.starId WHERE s.constellation = :constellation GROUP BY s.id, s.starId, s.constellation, s.starName ORDER BY s.starId")
    fun findStarMinimaSummaryByConstellation(@Param("constellation") constellation: String): List<StarMinimaSummary>

    @Query("select distinct s from Star s LEFT JOIN FETCH s.elements LEFT JOIN FETCH s.brightness")
    fun findStarsWithElements(): List<Star>

    @Query("select distinct s from Star s LEFT JOIN FETCH s.elements LEFT JOIN FETCH s.brightness LEFT JOIN FETCH s.minima")
    fun findStarsFetched(): List<Star>

    @Query(value="SELECT m.NSTAR AS starId, m.NCONS as constellationId, m.KIND as kind, c.mCount as ccdCount, COUNT(*) AS allCount FROM minima m LEFT JOIN (SELECT NSTAR, NCONS, KIND, COUNT(*) AS mCount FROM minima WHERE COL = 'ccd' GROUP BY NSTAR, NCONS, KIND) c ON m.NSTAR = c.NSTAR AND m.NCONS = c.NCONS AND m.KIND = c.KIND WHERE JD >= ?1 AND JC = 24 GROUP BY m.NSTAR, m.NCONS, m.KIND, c.mCount", nativeQuery = true)
    fun findMinimaCountsSince(jd: Double): List<StarMinimaCounts>
}


