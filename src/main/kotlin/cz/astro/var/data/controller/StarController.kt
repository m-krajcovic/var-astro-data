package cz.astro.`var`.data.controller

import cz.astro.`var`.data.repository.ConstellationWithStarCount
import cz.astro.`var`.data.repository.Star
import cz.astro.`var`.data.repository.StarRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RestController

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
@RestController
class StarController(private val starRepository: StarRepository) {

    @GetMapping("star")
    fun getAll(): List<StarListItem> = starRepository.findAll().map { t -> StarListItem(t.id, t.constellation, t.starName, t.minima.count()) }

    @GetMapping("star/{id}")
    fun getById(@PathVariable id: Int): Star = starRepository.getOne(id)

    @GetMapping("constellation")
    fun getConstellations(): Set<ConstellationWithStarCount> = starRepository.findAllConstellationsWithStarCount()

    @GetMapping("constellation/{cons}/star")
    fun getByConstellation(@PathVariable cons: String): List<StarListItem> = starRepository.findByConstellation(cons).map { t -> StarListItem(t.id, t.constellation, t.starName, t.minima.count()) }

}
