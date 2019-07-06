package cz.astro.`var`.data.czev.service

import java.util.stream.Collectors

class StarTypeValidatorImpl(
        private val validTypes: Set<String>
) : StarTypeValidator {
    companion object {
        const val UNCERTAIN_SYMBOL: String = ":"
        const val OR_SYMBOL: String = "|"
        const val AND_SYMBOL: String = "+"
        const val SUBTYPE_SYMBOL: String = "/"
    }

    private val caseInsensitiveTypes = validTypes.stream().collect(Collectors.toMap<String, String, String>(
            { it.toLowerCase() }, { it }
    ))

    override fun validate(type: String): Boolean {
        val certainType = type.substringBeforeLast(UNCERTAIN_SYMBOL)
        val split = certainType.split(OR_SYMBOL, AND_SYMBOL, SUBTYPE_SYMBOL)
        return split.all { validTypes.contains(it) }
    }

    override fun tryFixCase(type: String): String {
        val certainType = type.substringBeforeLast(UNCERTAIN_SYMBOL)
        val split = certainType.split(OR_SYMBOL, AND_SYMBOL, SUBTYPE_SYMBOL)
        val fixedWords = split.stream().collect(Collectors.toMap<String, String, String>({ it },
                { caseInsensitiveTypes.getOrElse(it.toLowerCase()) { it } }))
        var fixedType = type
        fixedWords.forEach { fixedType = fixedType.replace(it.key, it.value) }
        return fixedType
    }
}
