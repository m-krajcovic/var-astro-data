package cz.astro.`var`.data.controller

import cz.astro.`var`.data.repository.StarElement

data class StarElementModel(
        val id: Int,
        val minimum0: Double,
        val minimum9: Double,
        val kind: String,
        val period: Double
)

fun StarElement.toModel(): StarElementModel {
    return StarElementModel(id, prepend24(minimum0), prepend24(minimum9), kind, period);
}

fun prepend24(value: Double): Double {
    return ("24$value").toDouble()
}
