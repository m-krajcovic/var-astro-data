package cz.astro.`var`.data.czev.controller

import cz.astro.`var`.data.czev.repository.decStringToDegrees
import cz.astro.`var`.data.czev.repository.raStringToDegrees
import cz.astro.`var`.data.czev.service.*
import org.springframework.web.bind.annotation.*
import java.math.BigDecimal
import javax.validation.constraints.Min

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
@RequestMapping("api/czev")
class CzevController(
        private val starService: CzevStarService,
        private val draftService: CzevStarDraftService,
        private val ucac4Resolved: Ucac4StarInformationResolverService,
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
    fun insertDraft(@RequestBody draft: CzevStarDraftModel) {
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
    fun getStarInformationByName(@RequestParam("name") name: String) {

    }

    @GetMapping("cds", params = ["ra", "dec"])
    fun getStarInformationByCoords(@RequestParam("ra") ra: String, @RequestParam("dec") dec: String) {
//        val coords = CosmicCoordinatesModel()
        val raDegreesPattern = Regex("\\d*(\\.\\d+)?")
        val decDegreesPattern = Regex()
        val raDegrees = raStringToDegrees(ra)
        val decDegrees = decStringToDegrees(dec)
    }
}