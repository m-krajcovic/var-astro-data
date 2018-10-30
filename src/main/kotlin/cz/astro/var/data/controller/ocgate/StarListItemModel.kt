package cz.astro.`var`.data.controller

import cz.astro.`var`.data.repository.StarMinimaSummary

data class StarListItemModel(
        val starId: Int,
        val constellation: String,
        val starName: String,
        val minimaCount: Long
)

fun StarMinimaSummary.toListItemModel(): StarListItemModel {
    return StarListItemModel(starId, constellation, starName, minimaCount)
}
