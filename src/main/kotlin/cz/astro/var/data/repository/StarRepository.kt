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

    @Query("select new cz.astro.var.data.repository.ConstellationStarSummary(s.constellation, COUNT(s)) from Star s GROUP BY s.constellation")
    fun findAllConstellationStarSummary(): Set<ConstellationStarSummary>

    @Query("select new cz.astro.var.data.repository.StarMinimaSummary(s.id, m.constellation, m.starName, m.comp, COUNT(m)) from StarMinima m JOIN Star s ON m.constellation = s.constellation AND m.starName = s.starName AND s.comp = m.comp GROUP BY m.constellation, m.starName, m.comp")
    fun findAllStarMinimaSummary(): List<StarMinimaSummary>

    @Query("select new cz.astro.var.data.repository.StarMinimaSummary(s.id, m.constellation, m.starName, m.comp, COUNT(m)) from StarMinima m JOIN Star s ON m.constellation = s.constellation AND m.starName = s.starName AND s.comp = m.comp WHERE s.constellation = :constellation GROUP BY m.constellation, m.starName, m.comp")
    fun findStarMinimaSummaryByConstellation(@Param("constellation") constellation: String): List<StarMinimaSummary>
}
