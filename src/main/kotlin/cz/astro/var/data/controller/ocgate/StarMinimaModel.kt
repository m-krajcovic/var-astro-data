package cz.astro.`var`.data.controller

import cz.astro.`var`.data.repository.StarMinima

/**
 * @author Michal
 * @version 1.0
 * @since 10/17/2018
 */
data class StarMinimaModel(
        val id: Int,
        val julianDate: Double,
        val oc: Double,
        val color: String,
        val kind: String,
        val quality: String
)

fun StarMinima.toModel() : StarMinimaModel {
    val jdString = "${julianDatePrefix}${julianDate}"
    val ocString = "${ocSign}${oc}"
    return StarMinimaModel(id, jdString.toDouble(), ocString.toDouble(), color, kind, quality)
}
