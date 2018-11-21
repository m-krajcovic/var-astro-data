package cz.astro.`var`.data.czev.controller

import com.fasterxml.jackson.core.JsonProcessingException
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.github.fge.jsonpatch.JsonPatch
import com.github.fge.jsonpatch.JsonPatchException
import cz.astro.`var`.data.czev.service.*
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.util.*
import java.util.concurrent.CompletableFuture
import javax.validation.Valid

@RestController
@CrossOrigin(origins = ["http://localhost:3000"])
@RequestMapping("api/czev")
@Validated
class CzevController(
        private val starService: CzevStarService,
        private val draftService: CzevStarDraftService,
        private val ucac4Resolver: Ucac4StarInformationResolverService,
        private val vsxResolver: VsxVariableStarInformationResolverService,
        private val sesameResolver: SesameVariableStarInformationResolverService,
        private val constellationService: ConstellationService,
        private val typeService: StarTypeService,
        private val filterBandService: FilterBandService,
        private val starObserverService: StarObserverService,
        private val objectMapper: ObjectMapper) {

    @GetMapping("stars")
    fun getApprovedStars(filter: CzevCatalogFilter, page: Pageable): Page<CzevStarListModel> {
        return starService.getAllForList(filter, page)
    }

    @GetMapping("stars/{id}")
    fun getApprovedStarDetails(@PathVariable id: Long): ResponseEntity<CzevStarDetailsModel> {
        return starService.getStarDetails(id).toOkOrNotFound()
    }

    @GetMapping("drafts")
    fun getDrafts(): List<CzevStarDraftModel> {
        return draftService.getAll()
    }

    @GetMapping("user/drafts")
    fun getUsersDrafts() = draftService.getAllForCurrentUser()

    @GetMapping("drafts/{id}")
    fun getDraft(@PathVariable id: Long): ResponseEntity<CzevStarDraftModel> = draftService.getById(id).toOkOrNotFound()

    @PostMapping("drafts")
    @ResponseStatus(HttpStatus.CREATED)
    fun insertDraft(@Valid @RequestBody draft: CzevStarDraftNewModel): CzevStarDraftModel {
        return draftService.insert(draft)
    }

    @PostMapping("drafts/import")
    @ResponseStatus(HttpStatus.CREATED)
    fun insertDrafts(@RequestParam("file") file: MultipartFile): CsvImportResultModel {
        return draftService.importCsv(CsvImportModel(file.inputStream))
    }

    @DeleteMapping("drafts/{id}")
    fun deleteDraft(@PathVariable id: Long): ResponseEntity<*> =
            if (draftService.delete(id)) ResponseEntity.noContent().build<Any>() else ResponseEntity.notFound().build<Any>()

    @PatchMapping("drafts/{id}")
    fun patchDraft(@PathVariable id: Long, patch: JsonPatch): ResponseEntity<*> {
        return draftService.getById(id).map {
            try {
                val patched = patch.apply(objectMapper.convertValue(it, JsonNode::class.java))

                val patchedModel = objectMapper.treeToValue(patched, CzevStarDraftUpdateModel::class.java)

                draftService.update(patchedModel).toOk()
            } catch (e: JsonPatchException) {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.message)
            } catch (e: JsonProcessingException) {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.message)
            }
        }.orElse(ResponseEntity.notFound().build())
    }


    @PatchMapping("stars/{id}")
    fun patchStar(@PathVariable id: Long, patch: JsonPatch): ResponseEntity<*> {
        return starService.getStarDetails(id).map {
            try {
                val patched = patch.apply(objectMapper.convertValue(it, JsonNode::class.java))

                val patchedModel = objectMapper.treeToValue(patched, CzevStarUpdateModel::class.java)

                starService.update(patchedModel).toOk()
            } catch (e: JsonPatchException) {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.message)
            } catch (e: JsonProcessingException) {
                ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.message)
            }
        }.orElse(ResponseEntity.notFound().build())
    }

    @PostMapping("drafts/{id}/rejection")
    fun rejectDraft(@PathVariable id: Long, @Valid @RequestBody model: CzevStarDraftRejectionModel): ResponseEntity<*> {
        model.id = id
        return if (draftService.reject(model)) ResponseEntity.noContent().build<Any>() else ResponseEntity.notFound().build<Any>()
    }

    @PostMapping("stars")
    fun approveDraft(@Valid @RequestBody model: CzevStarApprovalModel): ResponseEntity<CzevStarDetailsModel> {
        return draftService.approve(model).toOkOrNotFound()
    }

    @GetMapping("cds/all", params = ["name"])
    fun getStarInformationByName(@RequestParam("name") name: String): StarInformationByNameResponse {
        val trimmedName = name.trim()
        val vsxResult = vsxResolver.findByName(trimmedName)
                .exceptionally { Optional.empty() }
        var ucac4Result = ucac4Resolver.findByIdentifier(trimmedName)
                .exceptionally { Optional.empty() }
        val sesameResult = sesameResolver.findByName(trimmedName)
                .exceptionally { Optional.empty() }

        val czevResult = starService.getByIdentification(trimmedName).orElse(null)

        val ucacSesameFuture = CompletableFuture.allOf(ucac4Result, sesameResult)
                .thenRun {
                    val u = ucac4Result.get()
                    val s = sesameResult.get()
                    if (!u.isPresent && s.isPresent) {
                        s.get().names.firstOrNull { n ->
                            n.startsWith("UCAC4")
                        }?.let { id ->
                            ucac4Result = ucac4Resolver.findByIdentifier(id)
                        }
                    }
                }

        CompletableFuture.allOf(ucacSesameFuture, ucac4Result, vsxResult).get()

        return StarInformationByNameResponse(
                vsxResult.get().orElse(null),
                sesameResult.get().orElse(null),
                ucac4Result.get().orElse(null),
                czevResult
        )
    }

    @GetMapping("cds/all", params = ["ra", "dec"])
    fun getStarInformationByCoords(coordinates: CosmicCoordinatesModel): StarInformationByCoordsResponse {
        return coordinates.let {
            val ucac4Result = ucac4Resolver.findByCoordinates(it, 0.01)
                    .exceptionally { emptyList() }
            val vsxResult = vsxResolver.findByCoordinates(it, 0.01)
                    .exceptionally { emptyList() }
            val czevResult = starService.getByCoordinatesForList(it, 0.01.toBigDecimal())

            val allOf = CompletableFuture.allOf(ucac4Result, vsxResult)
            allOf.get()
            StarInformationByCoordsResponse(
                    ucac4Result.get(),
                    vsxResult.get(),
                    czevResult
            )
        }
        // TODO: Other formats like these?
        //GSC 01234-06789 (5 digits before and after the dash, use leading zeroes if necessary)
        //2MASS J11431012-5804040 (use a J before the coordinates)
        //USNO-A2.0 0300-13671194
        //USNO-B1.0 0319-0360318 (use a dash between USNO and the catalog version, it is part of the acronym)
        //GSC2.3 S111210165373
        //UCAC4 810-003941
    }

    @GetMapping("constellations")
    fun getAllConstellations(): List<ConstellationModel> {
        return constellationService.getAll()
    }

    @GetMapping("observers")
    fun getAllStarObservers(): List<StarObserverModel> {
        return starObserverService.getAll()
    }

    @GetMapping("types")
    fun getAllStarTypes(): List<String> {
        return typeService.getAll()
    }

    @GetMapping("filterBands")
    fun getAllFilterBands(): List<FilterBandModel> {
        return filterBandService.getAll()
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

fun <T> T.toOk(): ResponseEntity<T> {
    return ResponseEntity.ok().body(this)
}

fun <T> Optional<T>.toOkOrNotFound(): ResponseEntity<T> {
    return this.map {
        ResponseEntity.ok().body<T>(it)
    }.orElse(ResponseEntity.notFound().build<T>())
}
