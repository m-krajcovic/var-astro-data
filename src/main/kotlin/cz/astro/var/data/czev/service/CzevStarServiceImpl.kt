package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.CzevStarRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal

@Service
@Transactional
class CzevStarServiceImpl(
        private val czevStarRepository: CzevStarRepository
) : CzevStarService {
    override fun getAllForExport(): List<CzevStarExportModel> {
        return czevStarRepository.findAllFetched().asSequence().map { it.toExportModel() }.toList()
    }

    override fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<CzevStarListModel> {
        return czevStarRepository.findAllByCoordinatesPartlyFetched(
                coordinates.ra - radius,
                coordinates.ra + radius,
                coordinates.dec - radius,
                coordinates.dec + radius
        ).asSequence().map { it.toListModel() }.toList()
    }

    @Transactional(readOnly = true)
    override fun getStarDetails(id: Long): CzevStarDetailsModel {
        val star = czevStarRepository.findByIdFetched(id)
        return star.orElse(null).toDetailsModel()
    }

    @Transactional(readOnly = true)
    override fun getAllForList(): List<CzevStarListModel> {
        return czevStarRepository.findAllPartlyFetched().asSequence().map { it.toListModel() }.toList()
    }
}
