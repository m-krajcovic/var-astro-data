package cz.astro.`var`.data.czev.controller

import cz.astro.`var`.data.czev.service.*
import org.springframework.web.bind.annotation.*

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
@RequestMapping("api/czev")
class CzevController(
        private val starService: CzevStarService,
        private val draftService: CzevStarDraftService) {

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
    fun approveDraft(model: CzevStarDraftModel) {
        draftService.approve(model)
    }
}