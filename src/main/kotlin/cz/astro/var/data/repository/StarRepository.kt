package cz.astro.`var`.data.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
interface StarRepository : JpaRepository<Star, Int> {
    fun findByConstellation(constellation: String): List<Star>

    @Query("select new cz.astro.var.data.repository.ConstellationWithStarCount(s.constellation, COUNT(s)) from Star s GROUP BY s.constellation")
    fun findAllConstellationsWithStarCount(): Set<ConstellationWithStarCount>
}
