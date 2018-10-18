package cz.astro.`var`.data

data class CosmicCoordinates(
        var raHours: Int = 0,
        var raMinutes: Int = 0,
        var raSeconds: Double = 0.0,
        var decDegrees: Int = 0,
        var decMinutes: Int = 0,
        var decSeconds: Double = 0.0,
        var decSign: String = "+"
)
