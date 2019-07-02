package cz.astro.`var`.data.czev.service

interface StarTypeValidator {
    fun validate(type: String): Boolean
    fun tryFixCase(type: String): String
}
