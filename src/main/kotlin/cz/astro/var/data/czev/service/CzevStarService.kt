package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.CzevCatalogFilter
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.math.BigDecimal
import java.util.*

/**
 * Interface for managing stars  in czev catalogue
 */
interface CzevStarService {
    fun getAllForList(filter: CzevCatalogFilter, page: Pageable): Page<CzevStarListModel>
    fun getStarDetails(id: Long): Optional<CzevStarDetailsModel>
    fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<DistanceModel<CzevStarListModel>>
    fun getAllForExport(filter: CzevCatalogFilter): List<CzevStarExportModel>
    fun getByIdentification(identification: String): Optional<CzevStarListModel>
    fun update(model: CzevStarUpdateModel): CzevStarDetailsModel
}

