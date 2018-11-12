package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.CzevStarRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.util.*

@Service
@Transactional
class CzevStarServiceImpl(
        private val czevStarRepository: CzevStarRepository
) : CzevStarService {
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
    override fun getStarDetails(id: Long): CzevStarDetailsModel {
        return czevStarRepository.findByIdFetched(id).map {
            it.toDetailsModel()
        }.orElse(null)
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
