package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.*
import cz.astro.`var`.data.security.SecurityService
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime
import java.util.*

@Service
@Transactional
class CzevStarDraftServiceImpl(
        private val czevStarRepository: CzevStarRepository,
        private val czevStarDraftRepository: CzevStarDraftRepository,
        private val securityService: SecurityService,
        private val typeRepository: StarTypeRepository,
        private val czevStarDraftCsvImportReader: CzevStarDraftCsvImportReader,

        private val constellationRepository: ConstellationRepository,
        private val observerRepository: StarObserverRepository,
        private val filterBandRepository: FilterBandRepository,
        private val starIdentificationRepository: StarIdentificationRepository
//        ,private val fileRepository: StarAdditionalFileRepository
) : CzevStarDraftService {

    @PreAuthorize("hasRole('USER')")
    override fun importCsv(import: CsvImportModel): CsvImportResultModel {
        val (result, errors) = czevStarDraftCsvImportReader.read(import.fileInputStream)
        if (result.isNotEmpty()) {
            val constellationsMap = constellationRepository.findAll().toMap { it.abbreviation.toLowerCase() }
            val filterBandMap = filterBandRepository.findAll().toMap { it.name.toLowerCase() }
            val types = typeRepository.findAll()
            val mutableErrors = errors.toMutableList()

            val newDrafts = ArrayList<CzevStarDraft>()
            val typeValidator = StarTypeValidatorImpl(types.map { it.name }.toSet())
            result.forEach {
                val error = ImportRecordError(it.recordNumber)
                val record = it.record
                val constellation = constellationsMap[record.constellation.toLowerCase()]
                val filterband = filterBandMap[record.filterBand.toLowerCase()]
                val typeValid = typeValidator.validate(record.type)
                val type = if (!typeValid) typeValidator.tryFixCase(record.type) else record.type

                val discoverers = observerRepository.findByAbbreviationIn(record.discoverers).toMutableSet()

                if (constellation != null) {
                    if (!starIdentificationRepository.existsByNameIn(record.crossIds)) {
                        val principal = securityService.getCurrentUser()
                        val user = User(principal!!.id)
                        newDrafts.add(
                                CzevStarDraft(
                                        constellation, type, filterband, record.amplitude, record.coordinates.toEntity(), record.crossIds.mapIndexed { i, id -> StarIdentification(id, null, i) }.toMutableSet(),
                                        HashSet(), record.m0, record.period, discoverers, record.year, record.privateNote, record.publicNote, user)
                        )
                    } else {
                        error.messages.add("Star with cross-id ${record.crossIds.joinToString()} already exists in the catalogue")
                    }
                } else {
                    error.messages.add("Constellation '${record.constellation}' doesn't exist")
                }
                if (error.messages.isNotEmpty()) {
                    mutableErrors.add(error)
                }
            }

            if (mutableErrors.isEmpty()) {
                czevStarDraftRepository.saveAll(newDrafts)
                return CsvImportResultModel(
                        newDrafts.size, emptyList()
                )
            }
            return CsvImportResultModel(
                    0, mutableErrors.sortedBy { it.recordNumber }
            )
        }
        return CsvImportResultModel(
                0, errors
        )
    }

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftOwner(#model.id, principal)")
    override fun update(model: CzevStarDraftUpdateModel): CzevStarDraftModel {
        val updatedEntity = czevStarDraftRepository.findById(model.id).orElseThrow { ServiceException("Draft not found") }
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { type -> type.name }.toSet())

        updatedEntity.apply {

            val observers = observerRepository.findAllById(model.discoverers).toMutableSet()
            if (observers.size == 0 || observers.size != model.discoverers.size) {
                throw ServiceException("Some of discoverers don't exist")
            }
            val newConstellation = constellationRepository.findById(model.constellation).orElseThrow { ServiceException("Constellation does not exist") }
            val newFilterBand = model.filterBand?.let { filterBandRepository.findById(it).orElseThrow { ServiceException("Filter band does not exist") } }

            val newIds = model.crossIdentifications.toMutableSet()
            newIds.removeIf { crossIdentifications.contains(StarIdentification(it, null, 0)) }
            if (starIdentificationRepository.existsByNameIn(newIds)) {
                throw ServiceException("Star with same cross-id already exists")
            }
            crossIdentifications.clear()
            crossIdentifications.addAll(model.crossIdentifications.mapIndexed { i, it -> StarIdentification(it, null, i) }.toMutableSet())

            typeValid = typeValidator.validate(model.type)
            if (!typeValid) {
                type = typeValidator.tryFixCase(type)
            }
            if (model.deletedFiles != null) {
                files.removeAll { model.deletedFiles.contains(it.id) }
            }
            files.addAll(model.newFiles?.map { StarAdditionalFile.fromMultipartFile(it) } ?: emptyList())

            publicNote = model.publicNote
            amplitude = model.amplitude
            m0 = model.m0
            period = model.period
            constellation = newConstellation
            filterBand = newFilterBand
            year = model.year
            discoverers = observers
            coordinates = CosmicCoordinates(model.rightAscension, model.declination)
            jmagnitude = model.jmagnitude
            kmagnitude = model.kmagnitude
            vmagnitude = model.vmagnitude
        }
        return czevStarDraftRepository.save(updatedEntity).toModel()
    }

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftsOwner(#ids, principal)")
    override fun deleteAll(ids: List<Long>) {
        val foundEntities = czevStarDraftRepository.findAllById(ids)
        czevStarDraftRepository.deleteAll(foundEntities)
    }

    @PreAuthorize("hasRole('ADMIN') or @accessVoter.isDraftOwner(#id, principal)")
    override fun delete(id: Long): Boolean {
        return czevStarDraftRepository.findById(id).map {
            czevStarDraftRepository.delete(it)
            true
        }.orElse(false)
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun approve(approvalModel: CzevStarApprovalModel): Optional<CzevStarDetailsModel> {
        return czevStarDraftRepository.findByIdFetched(approvalModel.id).map {
            val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { type -> type.name }.toSet())
            val published = it.toPublished(approvalModel, typeValidator)
            val newStar = czevStarRepository.save(published)
            czevStarDraftRepository.delete(it)
            newStar.toDetailsModel()
        }
    }

    @PreAuthorize("hasRole('ADMIN')")
    override fun reject(rejection: CzevStarDraftRejectionModel): Boolean {
        return czevStarDraftRepository.findById(rejection.id).map {
            it.rejected = true
            it.rejectedBy = User(securityService.getCurrentUser()!!.id)
            it.rejectedNote = rejection.rejectionNote
            it.rejectedOn = LocalDateTime.now()

            czevStarDraftRepository.save(it)
            true
        }.orElse(false)
    }

    @PreAuthorize("hasRole('USER')")
    override fun insert(draft: CzevStarDraftNewModel): CzevStarDraftModel {
        val user = securityService.getCurrentUser()!!
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { it.name }.toSet())
        val entity = draft.toEntity(User(user.id), typeValidator)
        return czevStarDraftRepository.save(entity).toModel()
    }

    @PreAuthorize("hasRole('USER')")
    override fun insertAll(drafts: List<CzevStarDraftNewModel>) {
        val principal = securityService.getCurrentUser()!!
        val user = User(principal.id)
        val typeValidator = StarTypeValidatorImpl(typeRepository.findAll().map { it.name }.toSet())
        val newDrafts = drafts.map { it.toEntity(user, typeValidator) }
        czevStarDraftRepository.saveAll(newDrafts)
    }

    @PostAuthorize("hasRole('ADMIN') or @accessVoter.isDraftOwner(returnObject.orElse(null), principal)")
    @Transactional(readOnly = true)
    override fun getById(id: Long): Optional<CzevStarDraftModel> {
        return czevStarDraftRepository.findByIdFetched(id).map { it.toModel() }
    }

    @PreAuthorize("hasRole('ADMIN')")
    @Transactional(readOnly = true)
    override fun getAll(): List<CzevStarDraftListModel> {
        return czevStarDraftRepository.findAllFetched().map { it.toListModel() }
    }

    @PreAuthorize("hasRole('USER')")
    @Transactional(readOnly = true)
    override fun getAllForCurrentUser(): List<CzevStarDraftListModel> {
        val user = securityService.getCurrentUser()!!
        return czevStarDraftRepository.findForUserFetched(User(user.id)).map { it.toListModel() }
    }

    private fun CzevStarDraft.toPublished(model: CzevStarApprovalModel, typeValidator: StarTypeValidator): CzevStar {
        val observers = observerRepository.findAllById(model.discoverers).toMutableSet()
        if (observers.size == 0 || observers.size != model.discoverers.size) {
            throw ServiceException("Some of discoverers don't exist")
        }
        val newConstellation = constellationRepository.findById(model.constellation).orElseThrow { ServiceException("Constellation does not exist") }
        val newFilterBand = model.filterBand?.let { filterBandRepository.findById(it).orElseThrow { ServiceException("Filter band does not exist") } }

        val czevStar = CzevStar(model.m0, model.period, .0, .0, model.publicNote, model.privateNote, newConstellation, model.type, newFilterBand,
                observers, CosmicCoordinates(model.rightAscension, model.declination), model.year, mutableSetOf(), null, "", model.vmagnitude, model.jmagnitude, model.kmagnitude, model.amplitude, createdBy)

        val newIds = model.crossIdentifications.toMutableSet()
        newIds.removeIf { crossIdentifications.contains(StarIdentification(it, null, 0)) }
        if (starIdentificationRepository.existsByNameIn(newIds)) {
            throw ServiceException("Star with same cross-id already exists")
        }

        crossIdentifications.clear()

        czevStar.crossIdentifications = model.crossIdentifications.mapIndexed { i, it -> StarIdentification(it, null, i) }.toMutableSet()

        if (model.deletedFiles != null) {
            files.removeAll { model.deletedFiles.contains(it.id) }
        }
        files.addAll(model.newFiles?.map { StarAdditionalFile.fromMultipartFile(it) } ?: emptyList())

        czevStar.files = files.toMutableSet()
        files.clear()

        czevStar.typeValid = typeValidator.validate(model.type)
        if (!czevStar.typeValid) {
            czevStar.type = typeValidator.tryFixCase(type)
        }

        return czevStar
    }

    private fun CzevStarDraftNewModel.toEntity(user: User, typeValidator: StarTypeValidator): CzevStarDraft {
        val observers = observerRepository.findAllById(discoverers).toMutableSet()
        if (observers.size == 0 || observers.size != discoverers.size) {
            throw ServiceException("Some of discoverers don't exist")
        }
        val newConstellation = constellationRepository.findById(constellation).orElseThrow { ServiceException("Constellation does not exist") }
        val newFilterBand = filterBand?.let { filterBandRepository.findById(it).orElseThrow { ServiceException("Filter band does not exist") } }
        val crossIds = crossIdentifications.mapIndexed { i, it -> StarIdentification(it, null, i) }.toMutableSet()

        if (starIdentificationRepository.existsByNameIn(crossIdentifications)) {
            throw ServiceException("Star with same cross-id already exists")
        }

        val czevStarDraft = CzevStarDraft(
                newConstellation, type, newFilterBand, amplitude, CosmicCoordinates(rightAscension, declination), crossIds,
                files?.map { StarAdditionalFile.fromMultipartFile(it) }?.toMutableSet()
                        ?: mutableSetOf(), m0, period, observers, year, privateNote, publicNote, user, false, null, "", null, false, jmagnitude, vmagnitude, kmagnitude)
        czevStarDraft.typeValid = typeValidator.validate(type)
        if (!czevStarDraft.typeValid) {
            czevStarDraft.type = typeValidator.tryFixCase(type)
        }
        return czevStarDraft
    }
}
