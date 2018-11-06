package cz.astro.var.data.helper;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

/**
 * @author Michal
 * @version 1.0
 * @since 10/15/2018
 */
@Converter
public class BooleanToStringConverter implements AttributeConverter<Boolean, String> {

    @Override
    public String convertToDatabaseColumn(Boolean value) {
        return (value != null && value) ? "Y" : "N";
    }

    @Override
    public Boolean convertToEntityAttribute(String value) {
        return "Y".equals(value);
    }
}
