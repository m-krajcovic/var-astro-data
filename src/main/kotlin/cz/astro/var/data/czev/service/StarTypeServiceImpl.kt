package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.repository.StarTypeRepository
import org.springframework.stereotype.Component

@Component
class StarTypeServiceImpl (
        private val starTypeRepository: StarTypeRepository
): StarTypeService {

    companion object {
        const val UNCERTAIN_SYMBOL: String = ":"
        const val OR_SYMBOL: String = "|"
        const val AND_SYMBOL: String = "+"
        const val SUBTYPE_SYMBOL: String = "/"
    }

    override fun validate(type: String): Boolean {
        val certainType = type.substringBeforeLast(UNCERTAIN_SYMBOL);
        val allTypes = HashSet(starTypeRepository.findAll().map { it.name })
        if (type.endsWith(UNCERTAIN_SYMBOL)) {
        }
        val split = certainType.split(OR_SYMBOL, AND_SYMBOL, SUBTYPE_SYMBOL)
        return split.all { allTypes.contains(it) }
    }
}