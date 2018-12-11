package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.CzevStarDraft
import cz.astro.`var`.data.czev.repository.CzevStarDraftRepository
import cz.astro.`var`.data.security.UserPrincipal
import org.springframework.stereotype.Component

@Component("accessVoter")
class AccessVoterImpl(
        private val draftRepository: CzevStarDraftRepository
) : AccessVoter {
    override fun isDraftsOwner(draftIds: List<Long>, principal: UserPrincipal): Boolean {
        return draftRepository.findAllById(draftIds).all { it.createdBy.id == principal.id }
    }

    override fun isDraftOwner(draft: CzevStarDraft?, principal: UserPrincipal): Boolean {
        return draft != null && draft.createdBy.id == principal.id
    }

    override fun isDraftOwner(draftId: Long, principal: UserPrincipal): Boolean {
        return draftRepository.findById(draftId).map { it.createdBy.id == principal.id }.orElse(false)
    }
}
