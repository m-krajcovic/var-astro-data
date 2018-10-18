package cz.astro.`var`.data.repository

data class StarMinimaSummary (
        val starId: Int,
        val constellation: String,
        val starName: String,
        val comp: String,
        val minimaCount: Long
)