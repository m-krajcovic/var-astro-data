package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.CzevStarDraft
import cz.astro.`var`.data.security.UserPrincipal

/**
 * Interface for figuring out if a user has access to some resources
 */
interface AccessVoter {
    fun isDraftOwner(draftId: Long, principal: UserPrincipal): Boolean
    fun isDraftOwner(draft: CzevStarDraft?, principal: UserPrincipal): Boolean
    fun isDraftsOwner(draftIds: List<Long>, principal: UserPrincipal): Boolean
}
