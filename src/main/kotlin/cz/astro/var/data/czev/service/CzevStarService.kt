package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

interface CzevStarService {
    fun getAllApprovedStars(): List<CzevStarListModel>
    fun getApprovedStarDetails(czevId: Long): CzevStarListModel
    fun save(star: CzevStarNewModel)
    fun saveAll(star: List<CzevStarNewModel>)
    fun approve(id: Long)
}

@Service
@Transactional("czevTM")
class CzevStarServiceImpl (
        private val czevStarRepository: CzevStarRepository,
        private val observerRepository: StarObserverRepository,
        private val filterBandRepository: FilterBandRepository,
        private val constellationRepository: ConstellationRepository
) : CzevStarService {

    override fun saveAll(star: List<CzevStarNewModel>) {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun save(star: CzevStarNewModel) {
        val observers = observerRepository.findAllById(star.discoverers.map { it.id })
        val filterBand = filterBandRepository.getOne(star.filterBand.id)
        val constellation = constellationRepository.getOne(star.constellation.id)
        val crossIds = star.crossIds.map { StarIdentification(it, null) }.toMutableList()

        val newStar = CzevStar(
            null, null, .0, .0, star.publicNote, star.privateNode, constellation,
                star.type, filterBand, observers, ArrayList(), star.vsxId, star.vsxName, false,
                null, LocalDateTime.now(), null, null, null, star.amplitude,
                star.coordinates.toEntity(), LocalDateTime.now().year
        )
        newStar.crossIdentifications = crossIds

        czevStarRepository.save(newStar)
    }

    override fun approve(id: Long) {
        val star = czevStarRepository.getOne(id)
        star.approved = true
        star.approvedBy = null
        star.approvedOn = LocalDateTime.now()
        czevStarRepository.save(star)
    }

    @Transactional("czevTM", readOnly = true)
    override fun getApprovedStarDetails(czevId: Long): CzevStarListModel {
        val star = czevStarRepository.findOne(isApproved().and(hasCzevId(czevId)))
        return star.orElse(null).toListModel()
    }

    @Transactional("czevTM", readOnly = true)
    override fun getAllApprovedStars(): List<CzevStarListModel> {
        return czevStarRepository.findAll(isApproved()).asSequence().map { it.toListModel() }.toList()
    }
}

data class CzevStarNewModel(
        val vsxName: String,
        val vsxId: Long?,
        val constellation: ConstellationModel,
        val type: String,
        val discoverers: List<StarObserverModel>,
        val amplitude: Double?,
        val filterBand: FilterBandModel,
        val crossIds: List<String>,
        val coordinates: CosmicCoordinatesModel,
        val privateNode: String,
        val publicNote: String
)

data class CzevStarListModel(
        val id: Long,
        val czevId: Long?,
        val coordinates: CosmicCoordinatesModel,
        val constellation: ConstellationModel,
        val type: String,
        val magnitude: Double,
        val discoverers: List<StarObserverModel>,
        val m0: BigDecimal?,
        val period: BigDecimal?
)

data class CosmicCoordinatesModel(
        val ra: BigDecimal,
        val dec: BigDecimal
) {

    fun toEntity(): CosmicCoordinates {
        return CosmicCoordinates(ra, dec)
    }
}

data class ConstellationModel(
        val id: Long,
        val name: String
)

data class FilterBandModel(
        val id: Long,
        val name: String
)

data class StarObserverModel(
        val id: Long,
        val firstName: String,
        val lastName: String,
        val abbreviation: String
)

fun CzevStar.toListModel(): CzevStarListModel {
    return CzevStarListModel(id, czevId, coordinates.toModel(), constellation.toModel(), type, .0, discoverers.toModels(), m0, period)
}

fun CosmicCoordinates.toModel(): CosmicCoordinatesModel {
    return CosmicCoordinatesModel(rightAscension, declination)
}

fun Constellation.toModel(): ConstellationModel {
    return ConstellationModel(id, name)
}

fun List<StarObserver>.toModels(): List<StarObserverModel> {
    return this.asSequence().map { StarObserverModel(it.id, it.firstName, it.lastName, it.abbreviation) }.toList()
}
