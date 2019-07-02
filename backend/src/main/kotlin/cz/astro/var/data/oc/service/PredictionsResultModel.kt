package cz.astro.`var`.data.oc.service

import com.fasterxml.jackson.annotation.JsonFormat
import java.time.LocalTime

data class PredictionsResultModel(
        val predictions: Set<PredictionsStarModel>,
        val nights: List<NightInterval>
)

data class NightInterval(
        @JsonFormat(pattern = "HH:mm", timezone = "UTC/Greenwich")
        val sunset: LocalTime,
        @JsonFormat(pattern = "HH:mm", timezone = "UTC/Greenwich")
        val sunrise: LocalTime
)
