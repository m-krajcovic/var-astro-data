package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.controller.parseCoordinates
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVParser
import org.apache.commons.csv.CSVPrinter
import org.springframework.stereotype.Component
import java.io.InputStream
import java.io.InputStreamReader
import java.io.StringWriter

interface ExportFormatterService<I, O> {
    fun format(input: I): O
}

// TODO: create implementation to map single record -- maybe it will be useful to map streams
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
                            it.jkMagnitude ?: "",
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


interface ImportReaderService<I, O> {
    fun read(input: I): O
}

interface CzevStarDraftCsvImportReader: ImportReaderService<InputStream, ImportResult<CzevStarDraftImportModel>>

// TODO: add possible options such as fail/skip on errors, header, custom order of columns...
@Component
class CzevStarDraftCsvImportReaderImpl: CzevStarDraftCsvImportReader {
    override fun read(input: InputStream): ImportResult<CzevStarDraftImportModel> {
        val csvReader = CSVParser(InputStreamReader(input), CSVFormat.DEFAULT)
        // RA, DEC, constellation name, type, amplitude, filterBand?, crossIds (? split by , ?), year, discoverers (abbreviations), m0?, period?, privateNote, publicNote
        val errors = ArrayList<ImportRecordError>()
        val result = ArrayList<ImportRecord<CzevStarDraftImportModel>>()
        csvReader.use {
            for (csvRecord in it) {
                val error = ImportRecordError(csvRecord.recordNumber)
                try {
                    val size = csvRecord.size()
                    if (size < 13) {
                        error.messages.add("Number of columns expected: 13, actual: $size")
                    } else {

                        val ra = csvRecord[0].trim()
                        val dec = csvRecord[1].trim()

                        val coords = parseCoordinates(ra, dec)
                        if (!coords.isPresent) {
                            error.messages.add("Failed to parse coordinates")
                        }

                        val constellationName = csvRecord[2].trim()
                        val type = csvRecord[3].trim()
                        val amplitude = csvRecord[4].toDoubleOrNull()
                        val filterBand = csvRecord[5].trim()
                        val crossIds = csvRecord[6].split(',').map { it.trim() }
                        val year = csvRecord[7].toIntOrNull()
                        if (year == null) {
                            error.messages.add("Failed to parse year of discovery")
                        }
                        val discoverers = csvRecord[8].split(',').map { it.trim() }
                        val m0 = csvRecord[9].toBigDecimalOrNull()
                        val period = csvRecord[10].toBigDecimalOrNull()
                        val privateNote = csvRecord[11]
                        val publicNote = csvRecord[12]

                        if (error.messages.isEmpty()) {
                            result.add(ImportRecord(csvRecord.recordNumber, CzevStarDraftImportModel(
                                    coords.get(), constellationName, type, amplitude, filterBand, crossIds, year!!, discoverers, m0, period, privateNote, publicNote
                            )))
                        }
                    }
                } catch (e: Exception) {
                    error.messages.add("Unknown error while parsing")
                }
                if (error.messages.isNotEmpty()) {
                    errors.add(error)
                }
            }
        }
        return ImportResult(result, errors)
    }
}

data class ImportRecordError(
        val recordNumber: Long,
        val messages: MutableList<String> = ArrayList()
)

data class ImportRecord<T>(
        val recordNumber: Long,
        val record: T
)

data class ImportResult<T>(
        val result: List<ImportRecord<T>>,
        val errors: List<ImportRecordError>
)