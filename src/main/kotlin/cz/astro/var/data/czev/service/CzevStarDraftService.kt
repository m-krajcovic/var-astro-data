package cz.astro.`var`.data.czev.service

import java.util.*

/**
 * Interface for managing star drafts waiting for approval in czev catalogue
 */
interface CzevStarDraftService {
    fun approve(approvalModel: CzevStarApprovalModel): Optional<CzevStarDetailsModel>
    fun reject(rejection: CzevStarDraftRejectionModel): Boolean
    fun insert(draft: CzevStarDraftNewModel): CzevStarDraftModel
    fun insertAll(drafts: List<CzevStarDraftNewModel>)
    fun importCsv(import: CsvImportModel): CsvImportResultModel
    fun getById(id: Long): Optional<CzevStarDraftModel>
    fun getAll(): List<CzevStarDraftListModel>
    fun getAllForCurrentUser(): List<CzevStarDraftListModel>
    fun deleteAll(ids: List<Long>)
    fun delete(id: Long): Boolean
    fun update(model: CzevStarDraftUpdateModel): CzevStarDraftModel
}
