package cz.astro.`var`.data.repository

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

    @Query("select new cz.astro.var.data.repository.ConstellationStarSummary(s.constellation, COUNT(s)) from Star s GROUP BY s.constellationId, s.constellation ORDER BY s.constellationId")
    fun findAllConstellationStarSummary(): Set<ConstellationStarSummary>

    @Query("select new cz.astro.var.data.repository.StarMinimaSummary(s.id, s.constellation, s.starName, COUNT(m)) from StarMinima m JOIN Star s ON m.constellationId = s.constellationId AND m.starId = s.starId GROUP BY s.id, s.starId, s.constellation, s.starName ORDER BY s.starId")
    fun findAllStarMinimaSummary(): List<StarMinimaSummary>

    @Query("select new cz.astro.var.data.repository.StarMinimaSummary(s.id, s.constellation, s.starName, COUNT(m)) from StarMinima m JOIN Star s ON m.constellationId = s.constellationId AND m.starId = s.starId WHERE s.constellation = :constellation GROUP BY s.id, s.starId, s.constellation, s.starName ORDER BY s.starId")
    fun findStarMinimaSummaryByConstellation(@Param("constellation") constellation: String): List<StarMinimaSummary>
}
