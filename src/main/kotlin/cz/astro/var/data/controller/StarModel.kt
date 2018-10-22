package cz.astro.`var`.data.controller

import cz.astro.`var`.data.CosmicCoordinates
import cz.astro.`var`.data.repository.Star
import cz.astro.`var`.data.repository.StarBrightness

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
    val elements: List<StarElementModel>,
    val brightness: List<StarBrightness>,
    val minima: List<StarMinimaModel>
)

fun Star.toModel() : StarModel {
    return StarModel(id, constellation, starName, comp, coordinates, elements.asSequence().map {it.toModel()}.toList(), brightness, minima.asSequence().map {it.toModel()}.toList())
}
