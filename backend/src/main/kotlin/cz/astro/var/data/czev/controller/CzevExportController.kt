package cz.astro.`var`.data.czev.controller

import cz.astro.`var`.data.czev.controller.DownloadableTextMessageConverter.Companion.TEXT_CSV
import cz.astro.`var`.data.czev.service.CzevStarCsvExportFormatterService
import cz.astro.`var`.data.czev.service.CzevStarService
import cz.astro.`var`.data.czev.validation.Declination
import cz.astro.`var`.data.czev.validation.RightAscension
import org.springframework.http.HttpInputMessage
import org.springframework.http.HttpOutputMessage
import org.springframework.http.MediaType
import org.springframework.http.converter.AbstractHttpMessageConverter
import org.springframework.stereotype.Controller
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import java.math.BigDecimal
import java.nio.charset.Charset
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.*


@Controller
@RequestMapping("api/czev/export")
@Validated
class CzevExportController(
        private val starService: CzevStarService,
        private val exportFormatterService: CzevStarCsvExportFormatterService
) {
    @RequestMapping("stars")
    @ResponseBody
    fun exportCzevToCsv(@RequestParam("format") format: String, filter: CzevCatalogFilter): DownloadableTextResponse {
        val allForExport = starService.getAllForExport(filter)
        return when (format) {
            "csv" -> {
                DownloadableTextResponse(exportFormatterService.format(allForExport),
                        "czev_catalogue_${LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)}.csv",
                        TEXT_CSV)
            }
            else -> {
                DownloadableTextResponse(exportFormatterService.format(allForExport),
                        "czev_catalogue_${LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)}.csv",
                        TEXT_CSV)
            }
        }
    }
}

data class CzevCatalogFilter(
        val czevIdFrom: Optional<Long> = Optional.empty(),
        val czevIdTo: Optional<Long> = Optional.empty(),
        val constellation: Optional<Long> = Optional.empty(),
        val type: Optional<String> = Optional.empty(),
        val amplitudeFrom: Optional<Double> = Optional.empty(),
        val amplitudeTo: Optional<Double> = Optional.empty(),
        val filterBand: Optional<Long> = Optional.empty(),
        val yearFrom: Optional<Int> = Optional.empty(),
        val yearTo: Optional<Int> = Optional.empty(),
        val discoverer: Optional<Long> = Optional.empty(),
        @RightAscension val ra: Optional<BigDecimal> = Optional.empty(),
        @Declination val dec: Optional<BigDecimal> = Optional.empty(),
        val radius: Double = 0.01
)

class DownloadableTextMessageConverter : AbstractHttpMessageConverter<DownloadableTextResponse>(MediaType.TEXT_PLAIN, TEXT_CSV, TEXT_LATEX) {

    companion object {
        val TEXT_CSV = MediaType("text", "csv", Charset.forName("utf-8"))
        val TEXT_LATEX = MediaType("text", "latex", Charset.forName("utf-8"))
    }

    override fun writeInternal(t: DownloadableTextResponse, outputMessage: HttpOutputMessage) {
        outputMessage.headers.contentType = t.mediaType
        outputMessage.headers.set("Content-Disposition", "attachment; filename=\"${t.filename}\"")
        outputMessage.body.use {
            it.writer().use { writer ->
                writer.write(t.content)
            }
        }
    }

    override fun readInternal(clazz: Class<out DownloadableTextResponse>, inputMessage: HttpInputMessage): DownloadableTextResponse {
        TODO("not implemented") //To change body of created functions use File | Settings | File Templates.
    }

    override fun supports(clazz: Class<*>): Boolean {
        return DownloadableTextResponse::class.java.equals(clazz)
    }

}


class DownloadableTextResponse(
        val content: String,
        val filename: String = "export.txt",
        val mediaType: MediaType = MediaType.TEXT_PLAIN
)
