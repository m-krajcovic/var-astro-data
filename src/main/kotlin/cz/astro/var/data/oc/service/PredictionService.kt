package cz.astro.`var`.data.oc.service

import java.time.LocalDate

/**
 * @author Michal
 * @version 1.0
 * @since 11/26/2018
 */
interface PredictionService {
    fun getAllPredictionsForNight(night: LocalDate, latitude: Double = 50.0, longitude: Double = 15.0): Set<PredictionResultModel>
}
