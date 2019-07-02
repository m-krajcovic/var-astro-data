package cz.astro.`var`.data.oc.controller

import cz.astro.`var`.data.oc.repository.StarElement
import java.math.BigDecimal

data class StarElementModel(
        val id: Int,
        val minimum0: BigDecimal,
        val minimum9: BigDecimal,
        val kind: String,
        val period: BigDecimal
)

fun StarElement.toModel(): StarElementModel {
    return StarElementModel(id, prepend24(minimum0), prepend24(minimum9), kind, period);
}

fun prepend24(value: BigDecimal): BigDecimal {
    return value + BigDecimal("2400000")
}
