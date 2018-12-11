package cz.astro.`var`.data.oc.repository

interface StarMinimaCounts {
    val starId: Int
    val constellationId: Int
    val kind: String
    val ccdCount: Int?
    val allCount: Int?
}
