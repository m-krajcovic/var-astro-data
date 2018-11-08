package cz.astro.`var`.data.czev.service

interface CzevStarService {
    fun getAllApprovedStars(): List<CzevStarListModel>
    fun getStarDetails(id: Long): CzevStarDetailsModel
    fun insertOne(star: CzevStarNewModel)
    fun insertMultiple(stars: List<CzevStarNewModel>)
    fun approve(id: Long)
}