package cz.astro.`var`.data.newoc.repository

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Service

interface StarsRepository: JpaRepository<Star, Long>
interface StarElementRepository: JpaRepository<StarElement, Long>
interface StarBrightnessRepository: JpaRepository<StarBrightness, Long>
interface PublicationsRepository: JpaRepository<MinimaPublication, Long>
interface MinimaRepository: JpaRepository<StarMinima, Long>
interface ObservationMethodRepository: JpaRepository<ObservationMethod, Long>
interface ObservationKindRepository: JpaRepository<ObservationKind, Long>
interface MinimaBatchRepository: JpaRepository<MinimaImportBatch, Long>



@Service
class NewOCGateInit(
        private val methodRepository: ObservationMethodRepository,
        private val kindRepository: ObservationKindRepository
) {
    fun init() {
        methodRepository.save(ObservationMethod("ccv"))
        methodRepository.save(ObservationMethod("ccv2"))

//        filterRepository.save(ObservationFilter("S"))
//        filterRepository.save(ObservationFilter("V"))

        kindRepository.save(ObservationKind("P"))
        kindRepository.save(ObservationKind("S"))
    }
}
