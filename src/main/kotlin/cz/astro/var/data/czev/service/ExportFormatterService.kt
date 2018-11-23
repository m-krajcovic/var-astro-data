package cz.astro.`var`.data.czev.service

import cz.astro.`var`.data.czev.conversion.DeclinationHolder
import cz.astro.`var`.data.czev.conversion.RightAscensionHolder
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVParser
import org.apache.commons.csv.CSVPrinter
import org.springframework.core.convert.ConversionService
import org.springframework.stereotype.Component
import java.io.InputStream
import java.io.InputStreamReader
import java.io.StringWriter
import java.math.BigDecimal

interface ExportFormatterService<I, O> {
    fun format(input: I): O
}

// TODO: create implementation to map single record -- maybe it will be useful to map streams
interface CzevStarCsvExportFormatterService : ExportFormatterService<List<CzevStarExportModel>, String>

@Component
class CzevStarCsvExportFormatterServiceImpl : CzevStarCsvExportFormatterService {
    override fun format(input: List<CzevStarExportModel>): String {

        StringWriter().use { writer ->
            CSVPrinter(writer, CSVFormat.DEFAULT.withHeader(
                    "CzeV", "ID", "VSX", "RA", "DE", "Con", "Type", "V", "J", "J-K", "A", "F", "M0", "P", "Discoverer", "Year"
            )).use { printer ->
                input.forEach {
                    printer.printRecord(
                            it.czevId,
                            it.crossIdentifications.first(),
                            it.vsxName,
                            it.coordinates.toStringRa(),
                            it.coordinates.toStringDec(),
                            it.constellation.abbreviation,
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
            return writer.toString()
        }
    }
}


interface ImportReaderService<I, O> {
    fun read(input: I): O
}

interface CzevStarDraftCsvImportReader : ImportReaderService<InputStream, ImportResult<CzevStarDraftImportModel>>

// TODO: add possible options such as fail/skip on errors, header, custom order of columns...
@Component
class CzevStarDraftCsvImportReaderImpl(
        private val conversionService: ConversionService
) : CzevStarDraftCsvImportReader {
    override fun read(input: InputStream): ImportResult<CzevStarDraftImportModel> {
        val csvReader = CSVParser(InputStreamReader(input), CSVFormat.DEFAULT)
        // *RA (J2000), *DEC (J2000), *Cross-ids (split with ';'), *Constellation (abbreviation), *Discoverers (abbreviations, split by ';'), *Year, Type, Amplitude, Filter Band, Epoch, Period, Note
        val errors = ArrayList<ImportRecordError>()
        val result = ArrayList<ImportRecord<CzevStarDraftImportModel>>()
        csvReader.use {
            for (csvRecord in it) {
                val error = ImportRecordError(csvRecord.recordNumber)
                try {
                    val size = csvRecord.size()
                    if (size < 12) {
                        error.messages.add("Number of columns expected: 12, actual: $size")
                    } else {

                        val ra = csvRecord[0].trim()
                        val dec = csvRecord[1].trim()

                        val coords: CosmicCoordinatesModel = try {
                            val raHolder = conversionService.convert(ra, RightAscensionHolder::class.java)!!
                            val decHolder = conversionService.convert(dec, DeclinationHolder::class.java)!!
                            CosmicCoordinatesModel(raHolder.value, decHolder.value)
                        } catch (e: Exception) {
                            error.messages.add("Failed to parse coordinates RA: '${csvRecord[0]}' DEC: '${csvRecord[1]}'")
                            CosmicCoordinatesModel(BigDecimal.ZERO, BigDecimal.ZERO)
                        }

                        val crossIds = csvRecord[2].split(';').map { i -> i.trim() }.toList()
                        val constellationName = csvRecord[3].trim()
                        val discoverers = csvRecord[4].split(';').map { d -> d.trim() }.toSet()
                        val year = csvRecord[5].toIntOrNull()
                        if (year == null) {
                            error.messages.add("Failed to parse year of discovery '${csvRecord[5]}'")
                        }

                        val type = csvRecord[6].trim()
                        val amplitude = csvRecord[7].toDoubleOrNull()
                        val filterBand = csvRecord[8].trim()
                        val m0 = csvRecord[9].toBigDecimalOrNull()
                        val period = csvRecord[10].toBigDecimalOrNull()
                        val privateNote = ""
                        val publicNote = csvRecord[11]

                        if (error.messages.isEmpty()) {
                            result.add(ImportRecord(csvRecord.recordNumber, CzevStarDraftImportModel(
                                    coords, constellationName, type, amplitude, filterBand, crossIds, year!!, discoverers, m0, period, privateNote, publicNote
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
