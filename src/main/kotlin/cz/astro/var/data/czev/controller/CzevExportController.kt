package cz.astro.`var`.data.czev.controller

import cz.astro.`var`.data.czev.controller.DownloadableTextMessageConverter.Companion.TEXT_CSV
import cz.astro.`var`.data.czev.service.CzevStarCsvExportFormatterService
import cz.astro.`var`.data.czev.service.CzevStarService
import org.springframework.http.HttpInputMessage
import org.springframework.http.HttpOutputMessage
import org.springframework.http.MediaType
import org.springframework.http.converter.AbstractHttpMessageConverter
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.ResponseBody
import java.nio.charset.Charset
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@Controller
@RequestMapping("api/czev/export")
class CzevExportController(
        private val starService: CzevStarService,
        private val exportFormatterService: CzevStarCsvExportFormatterService
) {

    @RequestMapping("stars")
    @ResponseBody
    fun exportCzevToCsv(@RequestParam("format") format: String): DownloadableTextResponse {
//        response.contentType = "text/csv;charset=utf-8"
//        response.setHeader("Content-Disposition","attachment; filename=\"czev_catalogue_${LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)}.csv\"")
        val allForExport = starService.getAllForExport()
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