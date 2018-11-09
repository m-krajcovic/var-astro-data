package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.security.SecurityService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.math.BigDecimal
import java.time.LocalDateTime

interface CzevStarService {
    fun getAllForList(): List<CzevStarListModel>
    fun getStarDetails(id: Long): CzevStarDetailsModel
    fun getByCoordinatesForList(coordinates: CosmicCoordinatesModel, radius: BigDecimal): List<CzevStarListModel>
    fun getAllForExport(): List<CzevStarExportModel>
}

interface CzevStarDraftService {
    fun approve(draft: CzevStarDraftModel): Boolean
    fun reject(rejection: CzevStarDraftRejectionModel)
    fun insert(draft: CzevStarDraftModel)
    fun insertAll(drafts: List<CzevStarDraftModel>)
    fun getById(id: Long): CzevStarDraftModel
    fun getAll(): List<CzevStarDraftModel>
    fun getAllForCurrentUser(): List<CzevStarDraftModel>
    fun delete(draft: CzevStarDraftModel)
    fun deleteAll(drafts: List<CzevStarDraftModel>)
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
    override fun delete(draft: CzevStarDraftModel) {
        if (draft.id != null) {
            czevStarDraftRepository.findById(draft.id).ifPresent {
                czevStarDraftRepository.delete(it)
            }
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun approve(draft: CzevStarDraftModel): Boolean {
        // map draft -> new star
        // save new star
        // remove draft
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
    override fun getById(id: Long): CzevStarDraftModel {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    override fun getAll(): List<CzevStarDraftModel> {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional(readOnly = true)
    override fun getAllForCurrentUser(): List<CzevStarDraftModel> {
        val user = securityService.currentUser
        return emptyList()
    }

    private fun CzevStarDraftModel.toEntity(user: User): CzevStarDraft {
        val observers = observerRepository.findAllById(discoverers.map { it.id })
        if (observers.size == 0) {
            throw ServiceException("At least one observer must be set as discoverer.")
        }
        val filterBand = if (filterBand != null) filterBandRepository.findById(filterBand.id).orElse(null) else null
        val constellation = constellationRepository.findById(constellation.id).orElseThrow { ServiceException("Constellation not found") }
        val crossIds = crossIdentifications.map { StarIdentification(it, null) }.toMutableList()

        return CzevStarDraft(
                constellation, type, filterBand, amplitude, coordinates.toEntity(), crossIds,
                m0, period, observers, year, privateNote, publicNote, user)
    }
}

/*
*
*     @PreAuthorize("hasRole('USER')")
    fun insertMultiple(stars: List<CzevStarNewModel>) {
        val principal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
        val user = User(principal.id)
        val newStars = stars.map { modelToStar(it, user) }
        czevStarRepository.saveAll(newStars)
    }

    @PreAuthorize("hasRole('USER')")
    fun insertOne(star: CzevStarNewModel) {

        val principal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
        val user = User(principal.id)

        val newStar = modelToStar(star, user)

        czevStarRepository.save(newStar)
    }

    private fun modelToStar(star: CzevStarNewModel, user: User): CzevStar {
        val observers = observerRepository.findAllById(star.discoverers.map { it.id })
        if (observers.size == 0) {
            throw ServiceException("At least one observer must be set as discoverer.")
        }
        val filterBand = if (star.filterBand != null) filterBandRepository.findById(star.filterBand.id).orElse(null) else null
        val constellation = constellationRepository.findById(star.constellation.id).orElseThrow { ServiceException("Constellation not found") }
        val crossIds = star.crossIds.map { StarIdentification(it, null) }.toMutableList()

        val newStar = CzevStar(
                null, null, .0, .0, star.publicNote, star.privateNote, constellation,
                star.type, filterBand, observers, ArrayList(), star.vsxId, star.vsxName, false,
                null, LocalDateTime.now(), null, null, null, star.amplitude,
                star.coordinates.toEntity(), LocalDateTime.now().year
        )
        newStar.createdBy = user
        newStar.crossIdentifications = crossIds
        return newStar
    }
//
//    @PreAuthorize("hasRole('ADMIN')")
//    override fun approve(id: Long) {
//        val principal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
//        val user = User(principal.id)
//
//        val star = czevStarRepository.getOne(id)
//        val czevId = czevIdSequenceIdentifierRepository.save(CzevIdSequenceIdentifier())
//        star.czevId = czevId.id
//        czevIdSequenceIdentifierRepository.delete(czevId)
//        star.approved = true
//        star.approvedBy = user
//        star.approvedOn = LocalDateTime.now()
//        czevStarRepository.save(star)
//    }*/