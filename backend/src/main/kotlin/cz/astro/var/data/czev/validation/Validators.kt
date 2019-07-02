package cz.astro.`var`.data.czev.validation

import cz.astro.`var`.data.czev.DEC_NUMBER_OR_STRING_REGEX
import cz.astro.`var`.data.czev.RA_NUMBER_OR_STRING_REGEX
import java.math.BigDecimal
import javax.validation.Constraint
import javax.validation.ConstraintValidator
import javax.validation.ConstraintValidatorContext
import javax.validation.Payload
import kotlin.reflect.KClass


@Target(AnnotationTarget.FUNCTION, AnnotationTarget.FIELD, AnnotationTarget.TYPE, AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@Constraint(validatedBy = [RightAscensionStringValidator::class, RightAscensionBigDecimalValidator::class])
annotation class RightAscension(
        val message: String = "Invalid right ascension",
        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)

class RightAscensionStringValidator : ConstraintValidator<RightAscension, String> {

    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value.matches(RA_NUMBER_OR_STRING_REGEX)
    }
}

class RightAscensionBigDecimalValidator : ConstraintValidator<RightAscension, BigDecimal> {

    override fun isValid(value: BigDecimal?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value >= BigDecimal.ZERO && value <= BigDecimal("360")
    }
}

@Target(AnnotationTarget.FUNCTION, AnnotationTarget.FIELD, AnnotationTarget.TYPE, AnnotationTarget.VALUE_PARAMETER)
@Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
@Constraint(validatedBy = [DeclinationValidator::class, DeclinationBigDecimalValidator::class])
annotation class Declination(
        val message: String = "Invalid declination",
        val groups: Array<KClass<*>> = [],
        val payload: Array<KClass<out Payload>> = []
)


class DeclinationValidator : ConstraintValidator<Declination, String> {

    override fun isValid(value: String?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value.matches(DEC_NUMBER_OR_STRING_REGEX)
    }
}

class DeclinationBigDecimalValidator : ConstraintValidator<Declination, BigDecimal> {

    override fun isValid(value: BigDecimal?, context: ConstraintValidatorContext?): Boolean {
        return value != null && value >= BigDecimal("-90") && value <= BigDecimal("90")
    }
}
