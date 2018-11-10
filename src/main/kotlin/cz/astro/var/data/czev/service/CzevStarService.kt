package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.security.SecurityService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.*

interface CzevStarService {
    fun getAllForList(): List<CzevStarListModel>
    fun getStarDetails(id: Long): CzevStarDetailsModel
    fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<CzevStarListModel>
    fun getAllForExport(): List<CzevStarExportModel>
}

interface CzevStarDraftService {
    fun approve(draft: CzevStarDraftModel): Optional<CzevStar>
    fun reject(rejection: CzevStarDraftRejectionModel)
    fun insert(draft: CzevStarDraftModel)
    fun insertAll(drafts: List<CzevStarDraftModel>)
    fun getById(id: Long): Optional<CzevStarDraftModel>
    fun getAll(): List<CzevStarDraftModel>
    fun getAllForCurrentUser(): List<CzevStarDraftModel>
    fun deleteAll(drafts: List<CzevStarDraftModel>)
    fun delete(id: Long)
}

data class CzevStarDraftRejectionModel(
        var id: Long,
        var rejectionNote: String
)

@Service
@Transactional
class CzevStarDraftServiceImpl(
        private val observerRepository: StarObserverRepository,
        private val filterBandRepository: FilterBandRepository,
        private val constellationRepository: ConstellationRepository,
        private val czevStarRepository: CzevStarRepository,
        private val czevStarDraftRepository: CzevStarDraftRepository,
        private val securityService: SecurityService
): CzevStarDraftService {

    // TODO allow Owner as well
    @PreAuthorize("hasRole('ADMIN')")
    override fun deleteAll(drafts: List<CzevStarDraftModel>) {
        val foundEntities = czevStarDraftRepository.findAllById(drafts.filter { it.id != null }.map { it.id })
        czevStarDraftRepository.deleteAll(foundEntities)
    }

    // TODO allow Owner as well
    @PreAuthorize("hasRole('ADMIN')")
    override fun delete(id: Long) {
        czevStarDraftRepository.findById(id).ifPresent {
            czevStarDraftRepository.delete(it)
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun approve(draft: CzevStarDraftModel): Optional<CzevStar> {
        // TODO: new approval model with more properties
        if (draft.id != null) {
            return czevStarDraftRepository.findById(draft.id).map{
                val newStar = czevStarRepository.save(it.toPublished())
                czevStarDraftRepository.delete(it)
                newStar
            }
        }
        return Optional.empty()
    }

    private fun CzevStarDraft.toPublished(): CzevStar {
        val czevStar = CzevStar(m0, period, .0, .0, publicNote, privateNote, constellation, type, filterBand,
                discoverers, coordinates, year, mutableSetOf(), null, "", null, null, null, null, createdBy)
        czevStar.crossIdentifications = crossIdentifications
        return czevStar
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
        // TODO else throw ?
    }

    @PreAuthorize("hasRole('USER')")
    override fun insert(draft: CzevStarDraftModel) {
        val user = securityService.currentUser ?: throw ServiceException("No user logged in")
        czevStarDraftRepository.save(draft.toEntity(User(user.id)))
    }

    @PreAuthorize("hasRole('USER')")
    override fun insertAll(drafts: List<CzevStarDraftModel>) {
        val principal = securityService.currentUser ?: throw ServiceException("No user logged in")
        val user = User(principal.id)
        val newDrafts = drafts.map { it.toEntity(user) }
        czevStarDraftRepository.saveAll(newDrafts)
    }

    // TODO allow Owner as well ?
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    override fun getById(id: Long): Optional<CzevStarDraftModel> {
        return czevStarDraftRepository.findById(id).map { it.toModel() }
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
        return czevStarDraftRepository.findByCreatedBy(User(user.id)).map { it.toModel() }
    }

    private fun CzevStarDraftModel.toEntity(user: User): CzevStarDraft {
        val observers = observerRepository.findAllById(discoverers.map { it.id }).toMutableSet()
        if (observers.size == 0) {
            throw ServiceException("At least one observer must be set as discoverer.")
        }
        val filterBand = if (filterBand != null) filterBandRepository.findById(filterBand.id).orElse(null) else null
        val constellation = constellationRepository.findById(constellation.id).orElseThrow { ServiceException("Constellation not found") }
        val crossIds = crossIdentifications.map { StarIdentification(it, null) }.toMutableSet()

        return CzevStarDraft(
                constellation, type, filterBand, amplitude, coordinates.toEntity(), crossIds,
                m0, period, observers, year, privateNote, publicNote, user)
    }
}
