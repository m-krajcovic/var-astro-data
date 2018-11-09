package cz.astro.`var`.data.czev.service

import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import org.springframework.stereotype.Component
import java.io.StringWriter

interface ExportFormatterService<I, O> {
    fun format(input: I): O
}

interface CzevStarCsvExportFormatterService: ExportFormatterService<List<CzevStarExportModel>, String>

@Component
class CzevStarCsvExportFormatterServiceImpl: CzevStarCsvExportFormatterService {
    override fun format(input: List<CzevStarExportModel>): String {

        val writer = StringWriter()
        writer.use {
            val csvPrinter = CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                    "CzeV", "ID", "VSX", "RA", "DE", "Con", "Type", "V", "J", "J-K", "A", "F", "M0", "P", "Discoverer", "Year"
            ))

            csvPrinter.use {

                input.forEach {
                    csvPrinter.printRecord(
                            it.czevId,
                            it.crossIdentifications.first(),
                            it.vsxName,
                            it.coordinates.toStringRa(),
                            it.coordinates.toStringDec(),
                            it.constellation.name,
                            it.type,
                            it.vMagnitude ?: "",
                            it.jMagnitude ?: "",
                            it.jk ?: "",
                            it.amplitude ?: "",
                            it.filterBand?.name ?: "",
                            it.m0 ?: "",
                            it.period ?: "",
                            it.discoverers.joinToString(transform = { observer -> observer.abbreviation }),
                            it.year
                    )
                }
            }
        }

        return writer.toString()
    }

}

