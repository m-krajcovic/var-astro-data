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
    fun update(model: CzevStarDetailsModel): CzevStarDetailsModel
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
    fun update(model: CzevStarDraftModel): CzevStarDraftModel
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
        private val typeRepository: StarTypeRepository
) : CzevStarDraftService {
    override fun update(model: CzevStarDraftModel): CzevStarDraftModel {
        val updatedEntity = czevStarDraftRepository.getOne(model.id)
        updatedEntity.apply {

            val observers = model.discoverers.toEntities()
            val newConstellation = model.constellation.toEntity()
            val newFilterBand: FilterBand? = model.filterBand.toEntity()

            crossIdentifications = crossIdentifications.intersectIds(model.crossIdentifications)

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
    override fun delete(id: Long) {
        czevStarDraftRepository.findById(id).ifPresent {
            czevStarDraftRepository.delete(it)
        }
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
        return czevStarDraftRepository.findAllFetched().map { it.toModel() }
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional(readOnly = true)
    override fun getAllForCurrentUser(): List<CzevStarDraftModel> {
        val user = securityService.currentUser
        return czevStarDraftRepository.findForUserFetched(User(user.id)).map { it.toModel() }
    }

    private fun CzevStarDraft.toPublished(model: CzevStarApprovalModel, typeValidator: StarTypeValidator): CzevStar {
        val newConstellation = model.constellation.toEntity()
        val newFilterBand = model.filterBand.toEntity()
        val observerEntities = model.discoverers.toEntities()
        val czevStar = CzevStar(model.m0, model.period, .0, .0, model.publicNote, model.privateNote, newConstellation, model.type, newFilterBand,
                observerEntities, model.coordinates.toEntity(), model.year, mutableSetOf(), null, "", model.vMagnitude, model.jMagnitude, model.jkMagnitude, model.amplitude, createdBy)

        crossIdentifications = crossIdentifications.intersectIds(model.crossIdentifications)

        czevStar.crossIdentifications = crossIdentifications
        czevStar.typeValid = typeValidator.validate(model.type)
        if (!czevStar.typeValid) {
            czevStar.type = typeValidator.tryFixCase(type)
        }
        return czevStar
    }

    private fun CzevStarDraftNewModel.toEntity(user: User, typeValidator: StarTypeValidator): CzevStarDraft {
        val observers = discoverers.toEntities()
        val newConstellation = constellation.toEntity()
        val newFilterBand = filterBand.toEntity()
        val crossIds = crossIdentifications.map { StarIdentification(it, null) }.toMutableSet()
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
