package cz.astro.`var`.data.czev.controller

import cz.astro.`var`.data.czev.repository.decStringToDegrees
import cz.astro.`var`.data.czev.repository.raStringToDegrees
import cz.astro.`var`.data.czev.service.*
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
@RequestMapping("api/czev")
class CzevController(
        private val starService: CzevStarService,
        private val draftService: CzevStarDraftService,
        private val ucac4Resolver: Ucac4StarInformationResolverService,
        private val vsxResolver: VsxVariableStarInformationResolverService,
        private val sesameResolver: SesameVariableStarInformationResolverService) {

    @GetMapping("stars")
    fun getApprovedStars(): List<CzevStarListModel> {
        return starService.getAllForList()
    }

    @GetMapping("stars/{id}")
    fun getApprovedStarDetails(@PathVariable id: Long): CzevStarDetailsModel {
        return starService.getStarDetails(id)
    }

    @GetMapping("drafts")
    fun getDrafts(): List<CzevStarDraftModel> {
        return draftService.getAll()
    }

    @GetMapping("user/drafts")
    fun getUsersDrafts() = draftService.getAllForCurrentUser()

    @GetMapping("drafts/{id}")
    fun getDraft(@PathVariable id: Long): CzevStarDraftModel? = draftService.getById(id).orElse(null)

    @PostMapping("drafts")
    fun insertDraft(@RequestBody draft: CzevStarDraftNewModel) {
        draftService.insert(draft)
    }

    @DeleteMapping("drafts/{id}")
    fun deleteDraft(@PathVariable id: Long) = draftService.delete(id)

    @PostMapping("drafts/{id}/rejection")
    fun rejectDraft(@PathVariable id: Long, model: CzevStarDraftRejectionModel) {
        model.id = id
        draftService.reject(model)
    }

    @PostMapping("stars")
    fun approveDraft(model: CzevStarApprovalModel) {
        draftService.approve(model)
    }

    @GetMapping("cds", params = ["name"])
    fun getStarInformationByName(@RequestParam("name") name: String): StarInformationByNameResponse {
        val trimmedName = name.trim()
        val vsxResult = vsxResolver.findByName(trimmedName)
        val sesameResult = sesameResolver.findByName(trimmedName)
        val ucac4Result = ucac4Resolver.findByIdentifier(trimmedName).orElseGet {
            val ucacId = ucac4Resolver.selectIdentifier(trimmedName)
            sesameResult.map {
                it.names.firstOrNull { n ->
                    n.startsWith("UCAC4") &&
                            (!ucacId.isPresent || ucac4Resolver.selectIdentifier(n).map { u -> u != ucacId.get() }.orElse(false))
                }?.let { id ->
                    ucac4Resolver.findByIdentifier(id).orElse(null)
                }
            }.orElse(null)
        }
        val czevResult = starService.getByIdentification(trimmedName)

        return StarInformationByNameResponse(
                vsxResult.orElse(null),
                sesameResult.orElse(null),
                ucac4Result,
                czevResult.orElse(null)
        )
    }

    @GetMapping("cds", params = ["ra", "dec"])
    fun getStarInformationByCoords(@RequestParam("ra") ra: String, @RequestParam("dec") dec: String): StarInformationByCoordsResponse {
        val raDegreesPattern = Regex("\\d*(\\.\\d+)?")
        val decDegreesPattern = Regex("[+\\-]?\\d*(\\.\\d+)?")
        val raStringPattern = Regex("\\d{1,2}[\\s:]\\d{1,2}[\\s:]\\d{0,2}(\\.\\d+)?")
        val decStringPattern = Regex("[+\\-]?\\d{1,2}[\\s:]\\d{1,2}[\\s:]\\d{0,2}(\\.\\d+)?")
        val raTrimmed = ra.trim()
        val decTrimmed = dec.trim()
        val raDegrees: BigDecimal
        val decDegrees: BigDecimal
        if (raDegreesPattern.matches(raTrimmed) && decDegreesPattern.matches(decTrimmed)) {
            raDegrees = BigDecimal(raTrimmed)
            decDegrees = BigDecimal(decTrimmed)
        } else if (raStringPattern.matches(raTrimmed) && decStringPattern.matches(decTrimmed)) {
            raDegrees = raStringToDegrees(raTrimmed)
            decDegrees = decStringToDegrees(decTrimmed)
        } else {
            throw IllegalArgumentException("Coordinates are not in valid format")
        }
        val coords = CosmicCoordinatesModel(raDegrees, decDegrees)
        val ucacResult = ucac4Resolver.findByCoordinates(coords, 0.01)
        val vsxResult = vsxResolver.findByCoordinates(coords, 0.01)
        val czevResult = starService.getByCoordinatesForList(coords, 0.01.toBigDecimal())

        return StarInformationByCoordsResponse(
                ucacResult,
                vsxResult,
                czevResult
        )
    }
}

data class StarInformationByNameResponse(
        val vsx: VariableStarInformationModel?,
        val sesame: VariableStarInformationModel?,
        val ucac4: StarInformationModel?,
        val czev: CzevStarListModel?
)

data class StarInformationByCoordsResponse(
        val ucac4: List<DistanceModel<StarInformationModel>>,
        val vsx: List<DistanceModel<VariableStarInformationModel>>,
        val czev: List<DistanceModel<CzevStarListModel>>
)