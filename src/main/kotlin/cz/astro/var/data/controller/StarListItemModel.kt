package cz.astro.`var`.data.controller

data class StarListItem(
        val starId: Int,
        val constellation: String,
        val starName: String,
        val comp: String,
        val minimaCount: Long
)
