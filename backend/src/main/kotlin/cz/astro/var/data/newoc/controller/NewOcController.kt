package cz.astro.`var`.data.newoc.controller

import cz.astro.`var`.data.czev.controller.toOkOrNotFound
import cz.astro.`var`.data.czev.service.ConstellationModel
import cz.astro.`var`.data.czev.service.ConstellationService
import cz.astro.`var`.data.czev.service.ConstellationSummaryModel
import cz.astro.`var`.data.newoc.service.*
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import javax.validation.Valid

@RestController
@RequestMapping("api/ocgate")
class NewOcController(
        private val starsService: StarsService,
        private val publicationsService: PublicationsService,
        private val constellationsService: ConstellationService,
        private val observationsService: ObservationsService
) {
//    GET
//    constellations
//    stars --- ListModel
//    stars/{id} --- DetailsModel
//    publications
//
//    POST
//    stars -- one new star
//    stars/{id}/minima -- one new minima -- SingleImportBatch
//    minima/batch -- multiple new minima -- MultiImportBatch?
//    publications -- new publication
//
//    PUT/PATCH
//    stars/{id} -- updates star info
//    minima/{minimaId} -- updates single minima for a star
//    minima/batch/{batchId} -- updates everything in a batch?
//    publications/{pubId} -- updates a publication
//
//    DELETE
//    stars/{id}
//    minima/{id}
//    minima/batch/{id}
//    publications/{id}

    @GetMapping("stars")
    fun getAllStars(): List<StarListModel> = starsService.getAll()

    @GetMapping("stars/{id}")
    fun getStarById(@PathVariable id: Long) = starsService.getById(id).toOkOrNotFound()

    @GetMapping("constellations")
    fun getAllConstellations(): List<ConstellationModel> = constellationsService.getAll()

    @GetMapping("constellations/summary")
    fun getConstellationsSummary(): List<ConstellationSummaryModel> = constellationsService.getAllSummary()

    @GetMapping("constellations/{id}/stars")
    fun getStarsByConstellation(@PathVariable id: Long): List<StarListModel> = starsService.getStarsByConstellation(id)

    @GetMapping("publications")
    fun getAllPublications(): List<MinimaPublicationModel> = publicationsService.getAll()

    @GetMapping("observations/methods")
    fun getAllObservationMethods(): List<IdNameModel> = observationsService.getAllMethods()

    @GetMapping("observations/kinds")
    fun getAllObservationKinds(): List<IdNameModel> = observationsService.getAllKinds()

    @GetMapping("observations/filters")
    fun getAllObservationFilters(): List<IdNameModel> = observationsService.getAllFilters()

    @GetMapping("stars/{starId}/elements/{id}")
    fun getElement(@PathVariable starId: Long, @PathVariable id: Long): ResponseEntity<StarElementModel?> {
        // todo: get directly by element id?
        return starsService.getById(starId).map {
            it.elements.firstOrNull { e -> e.id == id }
        }.toOkOrNotFound()
    }

    @PutMapping("stars/{id}")
    fun updateStar(@PathVariable id: Long, @Valid @RequestBody star: StarUpdateModel) = starsService.updateStar(id, star)

//    @PutMapping("minima/{id}")
//    fun updateStarMinima(@PathVariable id: Long, @Valid @RequestBody minima: StarMinimaUpdateModel) = starsService.updateMinima(id, minima)

    @PutMapping("minima/{ids}")
    fun updateStarMinimaBulk(@PathVariable ids: String, @Valid @RequestBody model: StarMinimaBulkUpdateModel) {
        starsService.updateMinimaBulk(ids.split(',').map { it.toLong() }, model)
    }

    @PutMapping("stars/brightness/{id}")
    fun updateStarBrightness(@PathVariable id: Long, @Valid @RequestBody brightness: StarBrightnessNewModel) = starsService.updateStarBrightness(id, brightness)

    @PutMapping("stars/elements/{id}")
    fun updateStarElement(@PathVariable id: Long, @Valid @RequestBody element: StarElementNewModel) = starsService.updateStarElement(id, element)

    @PutMapping("publications/{id}")
    fun updatePublication(@PathVariable id: Long, @Valid @RequestBody model: MinimaPublicationUpdateModel) = publicationsService.updatePublication(id, model)

    @PutMapping("publications/volumes/{id}")
    fun updatePublicationVolume(@PathVariable id: Long, @Valid @RequestBody model: MinimaPublicationVolumeUpdateModel) = publicationsService.updateVolume(id, model)


    @PostMapping("publications")
    fun insertPublication(@Valid @RequestBody publication: MinimaPublicationNewModel) = publicationsService.insertPublication(publication)

    @PostMapping("publications/{id}/volumes")
    fun insertPublicationVolume(@PathVariable id: Long, @Valid @RequestBody publication: MinimaPublicationVolumeNewModel) = publicationsService.insertVolume(id, publication)

    @PostMapping("stars")
    fun insertStar(@Valid @RequestBody star: StarNewModel): StarListModel = starsService.insert(star)

    @PostMapping("minima")
    fun insertMinima(@RequestBody minima: StarMinimaNewModel) = starsService.insertMinima(minima)

    @PostMapping("minima/batch")
    fun insertMinimaBatch(@RequestBody minimas: List<StarMinimaNewModel>) = starsService.insertMinimas(minimas)

    @PostMapping("stars/{id}/brightness")
    fun insertStarBrightness(@PathVariable id: Long, @Valid @RequestBody brightness: StarBrightnessNewModel) = starsService.insertStarBrightness(id, brightness)

    @PostMapping("stars/{id}/elements")
    fun insertStarElement(@PathVariable id: Long, @Valid @RequestBody element: StarElementNewModel) = starsService.insertStarElement(id, element)


    @DeleteMapping("stars/brightness/{id}")
    fun deleteStarBrightness(@PathVariable id: Long) = starsService.deleteStarBrightness(id)

    @DeleteMapping("stars/elements/{id}")
    fun deleteStarElement(@PathVariable id: Long) = starsService.deleteStarElement(id)

    @DeleteMapping("minima/{id}")
    fun deleteMinima(@PathVariable id: Long) = starsService.deleteMinima(id)

    @DeleteMapping("minima/batch/{id}")
    fun deleteMinimaBatch(@PathVariable id: Long) = starsService.deleteMinimaBatch(id)

    @DeleteMapping("stars/{id}")
    fun deleteStar(@PathVariable id: Long) = starsService.deleteStar(id)

    @DeleteMapping("publications/{id}")
    fun deletePublication(@PathVariable id: Long) = publicationsService.deletePublication(id)

    @DeleteMapping("publications/volumes/{id}")
    fun deletePublicationVolume(@PathVariable id: Long) = publicationsService.deleteVolume(id)
}
