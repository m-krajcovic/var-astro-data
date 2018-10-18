package cz.astro.`var`.data.controller

import cz.astro.`var`.data.CosmicCoordinates
import cz.astro.`var`.data.repository.Star
import cz.astro.`var`.data.repository.StarBrightness
import cz.astro.`var`.data.repository.StarElement

/**
 * @author Michal
 * @version 1.0
 * @since 10/17/2018
 */
data class StarModel(
    val id: Int,
    val constellation: String,
    val starName: String,
    val comp: String,
    val coordinates: CosmicCoordinates,
    val elements: List<StarElement>,
    val brightness: List<StarBrightness>,
    val minima: List<StarMinimaModel>
)

fun Star.toModel() : StarModel {
    return StarModel(id, constellation, starName, comp, coordinates, elements, brightness, minima.map {it.toModel()}.toList())
}
