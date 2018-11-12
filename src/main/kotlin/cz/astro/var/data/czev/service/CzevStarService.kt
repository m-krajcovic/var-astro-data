package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.security.SecurityService
import cz.astro.`var`.data.security.UserPrincipal
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Component
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

interface CzevStarService {
    fun getAllForList(): List<CzevStarListModel>
    fun getStarDetails(id: Long): CzevStarDetailsModel
    fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<DistanceModel<CzevStarListModel>>
    fun getAllForExport(): List<CzevStarExportModel>
    fun getByIdentification(identification: String): Optional<CzevStarListModel>
}

interface CzevStarDraftService {
    fun approve(approvalModel: CzevStarApprovalModel): Optional<CzevStarDetailsModel>
    fun reject(rejection: CzevStarDraftRejectionModel)
    fun insert(draft: CzevStarDraftNewModel)
    fun insertAll(drafts: List<CzevStarDraftNewModel>)
    fun getById(id: Long): Optional<CzevStarDraftModel>
    fun getAll(): List<CzevStarDraftModel>
    fun getAllForCurrentUser(): List<CzevStarDraftModel>
    fun deleteAll(ids: List<Long>)
    fun delete(id: Long)
}

data class CzevStarDraftRejectionModel(
        var id: Long,
        val rejectionNote: String
)

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
        private val observerRepository: StarObserverRepository,
        private val filterBandRepository: FilterBandRepository,
        private val constellationRepository: ConstellationRepository,
        private val czevStarRepository: CzevStarRepository,
        private val czevStarDraftRepository: CzevStarDraftRepository,
        private val securityService: SecurityService,
        private val typeRepository: StarTypeRepository
) : CzevStarDraftService {

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftsOwner(#ids, principal)")
    override fun deleteAll(ids: List<Long>) {
        val foundEntities = czevStarDraftRepository.findAllById(ids)
        czevStarDraftRepository.deleteAll(foundEntities)
    }

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftOwner(#id, principal)")
    override fun delete(id: Long) {
        czevStarDraftRepository.findById(id).ifPresent {
            czevStarDraftRepository.delete(it)
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun approve(approvalModel: CzevStarApprovalModel): Optional<CzevStarDetailsModel> {
        return czevStarDraftRepository.findById(approvalModel.id).map {
            val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { type -> type.name }.toSet())
            val published = it.toPublished(approvalModel, typeValidator)
            czevStarDraftRepository.delete(it)
            val newStar = czevStarRepository.save(published)
            newStar.toDetailsModel()
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun reject(rejection: CzevStarDraftRejectionModel) {
        czevStarDraftRepository.findById(rejection.id).ifPresent {
            it.rejected = true
            it.rejectedBy = User(securityService.currentUser.id)
            it.rejectedNote = rejection.rejectionNote
            it.rejectedOn = LocalDateTime.now()

            czevStarDraftRepository.save(it)
        }
    }

    @PreAuthorize("hasRole('USER')")
    override fun insert(draft: CzevStarDraftNewModel) {
        val user = securityService.currentUser!!
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { it.name }.toSet())
        czevStarDraftRepository.save(draft.toEntity(User(user.id), typeValidator))
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
        return czevStarDraftRepository.findAll().map { it.toModel() }
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional(readOnly = true)
    override fun getAllForCurrentUser(): List<CzevStarDraftModel> {
        val user = securityService.currentUser
        return czevStarDraftRepository.findForUserFetched(User(user.id)).map { it.toModel() }
    }

    private fun CzevStarDraft.toPublished(model: CzevStarApprovalModel, typeValidator: StarTypeValidator): CzevStar {
        val constEntity = constellationRepository.findById(model.constellation.id).orElse(constellation)
        val filterBandEntity = model.filterBand?.let { filterBandRepository.findById(it.id).orElse(filterBand) }
                ?: filterBand
        var observerEntities = observerRepository.findAllById(model.discoverers.map { it.id }).toMutableSet()
        if (observerEntities.isEmpty()) {
            observerEntities = discoverers
        }
        val czevStar = CzevStar(model.m0, model.period, .0, .0, model.publicNote, model.privateNote, constEntity, model.type, filterBandEntity,
                observerEntities, model.coordinates.toEntity(), model.year, mutableSetOf(), null, "", model.vMagnitude, model.jMagnitude, model.jkMagnitude, model.amplitude, createdBy)
        czevStar.crossIdentifications = model.crossIdentifications.map { StarIdentification(it, null) }.toMutableSet()
        czevStar.typeValid = typeValidator.validate(model.type)
        if (!czevStar.typeValid) {
            czevStar.type = typeValidator.tryFixCase(type)
        }
        return czevStar
    }

    private fun CzevStarDraftNewModel.toEntity(user: User, typeValidator: StarTypeValidator): CzevStarDraft {
        val observers = observerRepository.findAllById(discoverers.map { it.id }).toMutableSet()
        if (observers.size == 0) {
            throw ServiceException("At least one observer must be set as discoverer.")
        }
        val filterBand = if (filterBand != null) filterBandRepository.findById(filterBand.id).orElse(null) else null
        val constellation = constellationRepository.findById(constellation.id).orElseThrow { ServiceException("Constellation not found") }
        val crossIds = crossIdentifications.map { StarIdentification(it, null) }.toMutableSet()

        val czevStarDraft = CzevStarDraft(
                constellation, type, filterBand, amplitude, CosmicCoordinates(coordinates.ra, coordinates.dec), crossIds,
                m0, period, observers, year, privateNote, publicNote, user)
        czevStarDraft.typeValid = typeValidator.validate(type)
        if (!czevStarDraft.typeValid) {
            czevStarDraft.type = typeValidator.tryFixCase(type)
        }
        return czevStarDraft
    }
}
