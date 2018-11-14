package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.*

@Service
@Transactional
class CzevStarServiceImpl(
        private val czevStarRepository: CzevStarRepository,
        private val observerRepository: StarObserverRepository,
        private val constellationRepository: ConstellationRepository,
        private val filterBandRepository: FilterBandRepository,
        private val starIdentificationRepository: StarIdentificationRepository
) : CzevStarService {
    override fun update(model: CzevStarUpdateModel): CzevStarDetailsModel {
        val updatedEntity = czevStarRepository.getOne(model.czevId)
        updatedEntity.apply {

            val observers = observerRepository.findAllById(discoverers.map { it.id }).toMutableSet()
            if (observers.size == 0 || observers.size != discoverers.size) {
                throw ServiceException("Some of discoverers don't exist")
            }
            val newConstellation = constellationRepository.findById(constellation.id).orElseThrow { ServiceException("Constellation does not exist") }
            val newFilterBand = filterBand?.let { filterBandRepository.findById(it.id).orElseThrow { ServiceException("Filter band does not exist") } }


            val newIds = crossIdentifications.intersectIds(model.crossIdentifications)

            if (starIdentificationRepository.existsByNameIn(newIds)) {
                throw ServiceException("Star with same cross-id already exists")
            }

            type = model.type
            publicNote = model.publicNote
            amplitude = model.amplitude
            m0 = model.m0
            period = model.period
            jMagnitude = model.jMagnitude
            jkMagnitude = model.jkMagnitude
            vMagnitude = model.vMagnitude
            constellation = newConstellation
            filterBand = newFilterBand
            year = model.year
            discoverers = observers
            coordinates = CosmicCoordinates(model.coordinates.ra, model.coordinates.dec)
            vsxId = model.vsxId
            vsxName = model.vsxName
        }
        return czevStarRepository.save(updatedEntity).toDetailsModel()
    }

    override fun getByIdentification(identification: String): Optional<CzevStarListModel> {
        return czevStarRepository.findByStarIdentificationPartlyFetched(identification.trim()).map { it.toListModel() }
    }

    override fun getAllForExport(): List<CzevStarExportModel> {
        return czevStarRepository.findAllFetched().asSequence().map { it.toExportModel() }.toList()
    }

    override fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<DistanceModel<CzevStarListModel>> {
        return czevStarRepository.findAllByCoordinatesPartlyFetched(
                coordinates.ra - radius,
                coordinates.ra + radius,
                coordinates.dec - radius,
                coordinates.dec + radius
        ).asSequence().map { DistanceModel(cosmicDistance(coordinates.ra.toDouble(), coordinates.dec.toDouble(), it.coordinates.rightAscension.toDouble(), it.coordinates.declination.toDouble()), it.toListModel()) }.toList()
    }

    @Transactional(readOnly = true)
    override fun getStarDetails(id: Long): Optional<CzevStarDetailsModel> {
        return czevStarRepository.findByIdFetched(id).map {
            it.toDetailsModel()
        }
    }

    @Transactional(readOnly = true)
    override fun getAllForList(): List<CzevStarListModel> {
        return czevStarRepository.findAllPartlyFetched().asSequence().map { it.toListModel() }.toList()
    }
}

fun cosmicDistance(ra1: Double, dec1: Double, ra2: Double, dec2: Double): Double {
    val ra1Rads = Math.toRadians(ra1)
    val ra2Rads = Math.toRadians(ra2)
    val dec1Rads = Math.toRadians(dec1)
    val dec2Rads = Math.toRadians(dec2)
    return Math.toDegrees(Math.acos(Math.sin(dec1Rads) * Math.sin(dec2Rads) + Math.cos(dec1Rads) * Math.cos(dec2Rads) * Math.cos(ra1Rads - ra2Rads)))
}
