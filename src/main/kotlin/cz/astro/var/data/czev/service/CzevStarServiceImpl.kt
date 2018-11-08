package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.security.UserPrincipal
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional
class CzevStarServiceImpl(
        private val czevStarRepository: CzevStarRepository,
        private val observerRepository: StarObserverRepository,
        private val filterBandRepository: FilterBandRepository,
        private val constellationRepository: ConstellationRepository,
        private val czevIdSequenceIdentifierRepository: CzevIdSequenceIdentifierRepository
) : CzevStarService {

    @PreAuthorize("hasRole('USER')")
    override fun insertMultiple(stars: List<CzevStarNewModel>) {
        val principal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
        val user = User(principal.id)
        val newStars = stars.map { modelToStar(it, user) }
        czevStarRepository.saveAll(newStars)
    }

    @PreAuthorize("hasRole('USER')")
    override fun insertOne(star: CzevStarNewModel) {

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
                null, null, .0, .0, star.publicNote, star.privateNode, constellation,
                star.type, filterBand, observers, ArrayList(), star.vsxId, star.vsxName, false,
                null, LocalDateTime.now(), null, null, null, star.amplitude,
                star.coordinates.toEntity(), LocalDateTime.now().year
        )
        newStar.crossIdentifications = crossIds
        return newStar
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun approve(id: Long) {
        val principal = SecurityContextHolder.getContext().authentication.principal as UserPrincipal
        val user = User(principal.id)

        val star = czevStarRepository.getOne(id)
        val czevId = czevIdSequenceIdentifierRepository.save(CzevIdSequenceIdentifier())
        star.czevId = czevId.id
        czevIdSequenceIdentifierRepository.delete(czevId)
        star.approved = true
        star.approvedBy = user
        star.approvedOn = LocalDateTime.now()
        czevStarRepository.save(star)
    }

    @Transactional(readOnly = true)
    override fun getStarDetails(id: Long): CzevStarDetailsModel {
        val star = czevStarRepository.findFetchedById(id)
        return star.orElse(null).toDetailsModel()
    }

    @Transactional(readOnly = true)
    override fun getAllApprovedStars(): List<CzevStarListModel> {
        return czevStarRepository.findAllApproved().asSequence().map { it.toListModel() }.toList()
    }
}