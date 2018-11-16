package cz.astro.`var`.data.czev.controller

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.github.fge.jsonpatch.JsonPatch
import com.github.fge.jsonpatch.JsonPatchException
import cz.astro.`var`.data.czev.service.*
import org.codehaus.jackson.JsonProcessingException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import reactor.core.publisher.Mono
import reactor.core.publisher.toMono
import java.util.*
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
        private val objectMapper: ObjectMapper) {

    @GetMapping("stars")
    fun getApprovedStars(filter: CzevCatalogFilter): List<CzevStarListModel> {
        return starService.getAllForList(filter)
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
    fun insertDraft(@Valid @RequestBody draft: CzevStarDraftNewModel): CzevStarDraftModel {
        return draftService.insert(draft)
    }

    @PostMapping("drafts/import")
    fun insertDrafts(@RequestParam("file") file: MultipartFile): CsvImportResultModel {
        return draftService.importCsv(CsvImportModel(file.inputStream))
    }

    @DeleteMapping("drafts/{id}")
    fun deleteDraft(@PathVariable id: Long) = draftService.delete(id)

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
    fun rejectDraft(@PathVariable id: Long, @Valid @RequestBody model: CzevStarDraftRejectionModel): Boolean {
        model.id = id
        return draftService.reject(model)
    }

    @PostMapping("stars")
    fun approveDraft(@Valid @RequestBody model: CzevStarApprovalModel): ResponseEntity<CzevStarDetailsModel> {
        return draftService.approve(model).toOkOrNotFound()
    }

    @GetMapping("cds", params = ["name"])
    fun getStarInformationByName(@RequestParam("name") name: String): StarInformationByNameResponse {
        // TODO: Perhaps just use async completable futures instead of reactor?
        val trimmedName = name.trim()
        val vsxResult = vsxResolver.findByName(trimmedName)
                .onErrorResume { Mono.empty() }
        var ucac4Result = ucac4Resolver.findByIdentifier(trimmedName)
                .onErrorResume { Mono.empty() }
        val sesameResult = sesameResolver.findByName(trimmedName)
                .onErrorResume { Mono.empty() }
        val czevResult = starService.getByIdentification(trimmedName).orElse(null)

        val sesame = sesameResult.block()
                ?.apply {
            names.firstOrNull { n ->
                n.startsWith("UCAC4")
            }?.let { id ->
                ucac4Result = ucac4Result.switchIfEmpty(ucac4Resolver.findByIdentifier(id))
            }
        }
        return StarInformationByNameResponse(
                vsxResult.block(),
                sesame,
                ucac4Result.block(),
                czevResult
        )
    }

    @GetMapping("cds", params = ["ra", "dec"])
    fun getStarInformationByCoords(coordinates: CosmicCoordinatesModel): ResponseEntity<*> {
        return coordinates.let {
            val ucac4Result = ucac4Resolver.findByCoordinates(it, 0.01)
                    .onErrorResume { Mono.empty() }
            val vsxResult = vsxResolver.findByCoordinates(it, 0.01)
                    .onErrorResume { Mono.empty() }
            val czevResult = starService.getByCoordinatesForList(it, 0.01.toBigDecimal())

            Mono.`when`(vsxResult, ucac4Result).block()

            StarInformationByCoordsResponse(
                    ucac4Result.collectList().blockOptional().orElse(emptyList()),
                    vsxResult.collectList().blockOptional().orElse(emptyList()),
                    czevResult
            ).toOk()
        }
        // TODO: Other formats like these?
        // GSC 01234-06789 (5 digits before and after the dash, use leading zeroes if necessary)
        //2MASS J11431012-5804040 (use a J before the coordinates)
        //USNO-A2.0 0300-13671194
        //USNO-B1.0 0319-0360318 (use a dash between USNO and the catalog version, it is part of the acronym)
        //GSC2.3 S111210165373
        //UCAC4 810-003941
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

fun main(args: Array<String>) {
    val switchIfEmpty = Mono.empty<String>().switchIfEmpty("Hi".toMono())
    switchIfEmpty.subscribe {
        println(it)
    }
    switchIfEmpty.block()
}
