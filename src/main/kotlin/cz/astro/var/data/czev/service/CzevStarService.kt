package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.CzevCatalogFilter
import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.security.SecurityService
import cz.astro.`var`.data.security.UserPrincipal
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

interface CzevStarService {
    fun getAllForList(filter: CzevCatalogFilter, page: Pageable): Page<CzevStarListModel>
    fun getStarDetails(id: Long): Optional<CzevStarDetailsModel>
    fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<DistanceModel<CzevStarListModel>>
    fun getAllForExport(filter: CzevCatalogFilter): List<CzevStarExportModel>
    fun getByIdentification(identification: String): Optional<CzevStarListModel>
    fun update(model: CzevStarUpdateModel): CzevStarDetailsModel
}

interface CzevStarDraftService {
    fun approve(approvalModel: CzevStarApprovalModel): Optional<CzevStarDetailsModel>
    fun reject(rejection: CzevStarDraftRejectionModel): Boolean
    fun insert(draft: CzevStarDraftNewModel): CzevStarDraftModel
    fun insertAll(drafts: List<CzevStarDraftNewModel>)
    fun importCsv(import: CsvImportModel): CsvImportResultModel
    fun getById(id: Long): Optional<CzevStarDraftModel>
    fun getAll(): List<CzevStarDraftModel>
    fun getAllForCurrentUser(): List<CzevStarDraftModel>
    fun deleteAll(ids: List<Long>)
    fun delete(id: Long): Boolean
    fun update(model: CzevStarDraftUpdateModel): CzevStarDraftModel
}

interface AccessVoter {
    fun isDraftOwner(draftId: Long, principal: UserPrincipal): Boolean
    fun isDraftOwner(draft: CzevStarDraft?, principal: UserPrincipal): Boolean
    fun isDraftsOwner(draftIds: List<Long>, principal: UserPrincipal): Boolean
}

@Component("accessVoter")
class AccessVoterImpl(
        private val draftRepository: CzevStarDraftRepository
) : AccessVoter {
    override fun isDraftsOwner(draftIds: List<Long>, principal: UserPrincipal): Boolean {
        return draftRepository.findAllById(draftIds).all { it.createdBy.id == principal.id }
    }

    override fun isDraftOwner(draft: CzevStarDraft?, principal: UserPrincipal): Boolean {
        return draft != null && draft.createdBy.id == principal.id
    }

    override fun isDraftOwner(draftId: Long, principal: UserPrincipal): Boolean {
        return draftRepository.findById(draftId).map { it.createdBy.id == principal.id }.orElse(false)
    }
}

@Service
@Transactional
class CzevStarDraftServiceImpl(
        private val czevStarRepository: CzevStarRepository,
        private val czevStarDraftRepository: CzevStarDraftRepository,
        private val securityService: SecurityService,
        private val typeRepository: StarTypeRepository,
        private val czevStarDraftCsvImportReader: CzevStarDraftCsvImportReader,

        private val constellationRepository: ConstellationRepository,
        private val observerRepository: StarObserverRepository,
        private val filterBandRepository: FilterBandRepository,
        private val starIdentificationRepository: StarIdentificationRepository
) : CzevStarDraftService {

    @PreAuthorize("hasRole('USER')")
    override fun importCsv(import: CsvImportModel): CsvImportResultModel {
        val (result, errors) = czevStarDraftCsvImportReader.read(import.fileInputStream)
        if (result.isNotEmpty()) {
            val constellationsMap = constellationRepository.findAll().toMap { it.name.toLowerCase() }
            val filterBandMap = filterBandRepository.findAll().toMap { it.name.toLowerCase() }
            val types = typeRepository.findAll()
            val mutableErrors = errors.toMutableList()

            val newDrafts = ArrayList<CzevStarDraft>()
            val typeValidator = StarTypeValidatorImpl(types.map { it.name }.toSet())
            result.forEach {
                val error = ImportRecordError(it.recordNumber)
                val record = it.record
                val constellation = constellationsMap[record.constellation.toLowerCase()]
                val filterband = filterBandMap[record.filterBand.toLowerCase()]
                val typeValid = typeValidator.validate(record.type)
                val type = if (!typeValid) typeValidator.tryFixCase(record.type) else record.type

                val discoverers = observerRepository.findByAbbreviationIn(record.discoverers).toMutableSet()

                if (constellation != null) {
                    if (!starIdentificationRepository.existsByNameIn(record.crossIds)) {
                        val principal = securityService.currentUser
                        val user = User(principal.id)
                        newDrafts.add(
                                CzevStarDraft(
                                        constellation, type, filterband, record.amplitude, record.coordinates.toEntity(), record.crossIds.map { id -> StarIdentification(id, null) }.toMutableSet(),
                                        record.m0, record.period, discoverers, record.year, record.privateNote, record.publicNote, user)
                        )
                    } else {
                        error.messages.add("Star with cross-id ${record.crossIds.joinToString()} already exists in the catalogue")
                    }
                } else {
                    error.messages.add("Constellation '${record.constellation}' doesn't exist")
                }
                if (error.messages.isNotEmpty()) {
                    mutableErrors.add(error)
                }
            }

            czevStarDraftRepository.saveAll(newDrafts)

            return CsvImportResultModel(
                    newDrafts.size, mutableErrors.sortedBy { it.recordNumber }
            )
        }
        return CsvImportResultModel(
                0, errors
        )
    }

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftOwner(#id, principal)")
    override fun update(model: CzevStarDraftUpdateModel): CzevStarDraftModel {
        val updatedEntity = czevStarDraftRepository.getOne(model.id)
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
            constellation = newConstellation
            filterBand = newFilterBand
            year = model.year
            discoverers = observers
            coordinates = CosmicCoordinates(model.coordinates.ra, model.coordinates.dec)
        }
        return czevStarDraftRepository.save(updatedEntity).toModel()
    }

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftsOwner(#ids, principal)")
    override fun deleteAll(ids: List<Long>) {
        val foundEntities = czevStarDraftRepository.findAllById(ids)
        czevStarDraftRepository.deleteAll(foundEntities)
    }

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftOwner(#id, principal)")
    override fun delete(id: Long): Boolean {
        return czevStarDraftRepository.findById(id).map {
            czevStarDraftRepository.delete(it)
            true
        }.orElse(false)
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun approve(approvalModel: CzevStarApprovalModel): Optional<CzevStarDetailsModel> {
        return czevStarDraftRepository.findByIdFetched(approvalModel.id).map {
            val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { type -> type.name }.toSet())
            val published = it.toPublished(approvalModel, typeValidator)
            val newStar = czevStarRepository.save(published)
            czevStarDraftRepository.delete(it)
            newStar.toDetailsModel()
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun reject(rejection: CzevStarDraftRejectionModel): Boolean {
        return czevStarDraftRepository.findById(rejection.id).map {
            it.rejected = true
            it.rejectedBy = User(securityService.currentUser.id)
            it.rejectedNote = rejection.rejectionNote
            it.rejectedOn = LocalDateTime.now()

            czevStarDraftRepository.save(it)
            true
        }.orElse(false)
    }

    @PreAuthorize("hasRole('USER')")
    override fun insert(draft: CzevStarDraftNewModel): CzevStarDraftModel {
        val user = securityService.currentUser!!
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { it.name }.toSet())
        val entity = draft.toEntity(User(user.id), typeValidator)
        return czevStarDraftRepository.save(entity).toModel()
    }

    @PreAuthorize("hasRole('USER')")
    override fun insertAll(drafts: List<CzevStarDraftNewModel>) {
        val principal = securityService.currentUser!!
        val user = User(principal.id)
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { it.name }.toSet())
        val newDrafts = drafts.map { it.toEntity(user, typeValidator) }
        czevStarDraftRepository.saveAll(newDrafts)
    }

    @PostAuthorize("hasRole('ADMIN') or @accessVoter.isDraftOwner(returnObject.orElse(null), principal)")
    @Transactional(readOnly = true)
    override fun getById(id: Long): Optional<CzevStarDraftModel> {
        return czevStarDraftRepository.findByIdFetched(id).map { it.toModel() }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    override fun getAll(): List<CzevStarDraftModel> {
        return czevStarDraftRepository.findAllFetched().map { it.toModel() }
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional(readOnly = true)
    override fun getAllForCurrentUser(): List<CzevStarDraftModel> {
        val user = securityService.currentUser
        return czevStarDraftRepository.findForUserFetched(User(user.id)).map { it.toModel() }
    }

    private fun CzevStarDraft.toPublished(model: CzevStarApprovalModel, typeValidator: StarTypeValidator): CzevStar {
        val observers = observerRepository.findAllById(discoverers.map { it.id }).toMutableSet()
        if (observers.size == 0 || observers.size != discoverers.size) {
            throw ServiceException("Some of discoverers don't exist")
        }
        val newConstellation = constellationRepository.findById(constellation.id).orElseThrow { ServiceException("Constellation does not exist") }
        val newFilterBand = filterBand?.let { filterBandRepository.findById(it.id).orElseThrow { ServiceException("Filter band does not exist") } }

        val czevStar = CzevStar(model.m0, model.period, .0, .0, model.publicNote, model.privateNote, newConstellation, model.type, newFilterBand,
                observers, model.coordinates.toEntity(), model.year, mutableSetOf(), null, "", model.vMagnitude, model.jMagnitude, model.jkMagnitude, model.amplitude, createdBy)

        val newIds = crossIdentifications.intersectIds(model.crossIdentifications)

        if (starIdentificationRepository.existsByNameIn(newIds)) {
            throw ServiceException("Star with same cross-id already exists")
        }

        czevStar.crossIdentifications = crossIdentifications
        czevStar.typeValid = typeValidator.validate(model.type)
        if (!czevStar.typeValid) {
            czevStar.type = typeValidator.tryFixCase(type)
        }
        return czevStar
    }

    private fun CzevStarDraftNewModel.toEntity(user: User, typeValidator: StarTypeValidator): CzevStarDraft {
        val observers = observerRepository.findAllById(discoverers.map { it.id }).toMutableSet()
        if (observers.size == 0 || observers.size != discoverers.size) {
            throw ServiceException("Some of discoverers don't exist")
        }
        val newConstellation = constellationRepository.findById(constellation.id).orElseThrow { ServiceException("Constellation does not exist") }
        val newFilterBand = filterBand?.let { filterBandRepository.findById(it.id).orElseThrow { ServiceException("Filter band does not exist") } }
        val crossIds = crossIdentifications.map { StarIdentification(it, null) }.toMutableSet()

        if (starIdentificationRepository.existsByNameIn(crossIdentifications)) {
            throw ServiceException("Star with same cross-id already exists")
        }

        val czevStarDraft = CzevStarDraft(
                newConstellation, type, newFilterBand, amplitude, CosmicCoordinates(coordinates.ra, coordinates.dec), crossIds,
                m0, period, observers, year, privateNote, publicNote, user)
        czevStarDraft.typeValid = typeValidator.validate(type)
        if (!czevStarDraft.typeValid) {
            czevStarDraft.type = typeValidator.tryFixCase(type)
        }
        return czevStarDraft
    }
}
