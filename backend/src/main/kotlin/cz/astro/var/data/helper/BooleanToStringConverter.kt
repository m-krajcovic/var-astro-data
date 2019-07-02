package cz.astro.`var`.data.helper

import javax.persistence.AttributeConverter
import javax.persistence.Converter

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
@Converter
class BooleanToStringConverter : AttributeConverter<Boolean, String> {

    override fun convertToDatabaseColumn(value: Boolean?): String {
        return if (value != null && value) "Y" else "N"
    }

    override fun convertToEntityAttribute(value: String): Boolean? {
        return "Y" == value
    }
}
