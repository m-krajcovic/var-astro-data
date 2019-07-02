package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.CzevCatalogFilter
import cz.astro.`var`.data.czev.cosmicDistance
import cz.astro.`var`.data.czev.repository.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PreAuthorize
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
        private val starIdentificationRepository: StarIdentificationRepository,
        private val typeRepository: StarTypeRepository
) : CzevStarService {
    @PreAuthorize("hasRole('USER')")
    override fun update(model: CzevStarUpdateModel): CzevStarDetailsModel {
        val updatedEntity = czevStarRepository.findById(model.czevId).orElseThrow { ServiceException("Star not found") }
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { type -> type.name }.toSet())

        updatedEntity.apply {

            val observers = observerRepository.findAllById(model.discoverers).toMutableSet()
            if (observers.size == 0 || observers.size != model.discoverers.size) {
                throw ServiceException("Some of discoverers don't exist")
            }
            val newConstellation = constellationRepository.findById(model.constellation).orElseThrow { ServiceException("Constellation does not exist") }
            val newFilterBand = model.filterBand?.let { filterBandRepository.findById(it).orElseThrow { ServiceException("Filter band does not exist") } }

            val newIds = model.crossIdentifications.toMutableSet()
            newIds.removeIf { crossIdentifications.contains(StarIdentification(it, null, 0)) }
            if (starIdentificationRepository.existsByNameIn(newIds)) {
                throw ServiceException("Star with same cross-id already exists")
            }

            crossIdentifications.clear()
            crossIdentifications.addAll(model.crossIdentifications.mapIndexed { i, it -> StarIdentification(it, null, i) }.toMutableSet())
            crossIdentifications.forEach { it.star = this }

            if (model.deletedFiles != null) {
                files.removeAll { model.deletedFiles.contains(it.id) }
            }
            files.addAll(model.newFiles?.map { StarAdditionalFile.fromMultipartFile(it) } ?: emptyList())
            files.forEach { file -> file.star = this }

            typeValid = typeValidator.validate(model.type)
            if (!typeValid) {
                type = typeValidator.tryFixCase(type)
            }
            publicNote = model.publicNote
            amplitude = model.amplitude
            m0 = model.m0
            period = model.period
            jmagnitude = model.jmagnitude
            kmagnitude = model.kmagnitude
            vmagnitude = model.vmagnitude
            constellation = newConstellation
            filterBand = newFilterBand
            year = model.year
            discoverers = observers
            coordinates = CosmicCoordinates(model.rightAscension, model.declination)
            // TODO allow vsx change
//            vsxId = model.vsxId
//            vsxName = model.vsxName
        }
        return czevStarRepository.save(updatedEntity).toDetailsModel()
    }

    override fun getByIdentification(identification: String): Optional<CzevStarListModel> {
        return Optional.ofNullable(czevStarRepository.findByStarIdentificationPartlyFetched(identification.trim()).firstOrNull()?.toListModel())
    }

    @PreAuthorize("hasRole('USER')")
    override fun getAllForExport(filter: CzevCatalogFilter): List<CzevStarExportModel> {
        return czevStarRepository.findAll(CzevStarFilterSpec(filter)).asSequence().map { it.toExportModel() }.toList()
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
    override fun getAllForList(filter: CzevCatalogFilter, page: Pageable): Page<CzevStarListModel> {
        return czevStarRepository.findAll(CzevStarFilterSpec(filter), page).map { it.toListModel() }
    }
}

