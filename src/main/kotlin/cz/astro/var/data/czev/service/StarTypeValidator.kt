package cz.astro.`var`.data.czev.service

interface StarTypeValidator {
    fun validate(type: String): Boolean
    fun tryFixCase(type: String): String
}

/*
* potrebujem:
* najst format podla stringu
* validovat string na given format
* */

interface CdsFormatValidator {
//    fun validate(String )
}