package com.example.magnetictreasure.data.models

data class MeasurementDTO(
    val id: String = "",
    val timestamp: Long = System.currentTimeMillis(),
    val latitude: Double,
    val longitude: Double,
    val magneticX: Float,
    val magneticY: Float,
    val magneticZ: Float,
    val magnitude: Float,
    val accuracy: Float,
    val altitude: Double,
    val speed: Float = 0f
)

data class MeasurementRequest(
    val timestamp: Long,
    val latitude: Double,
    val longitude: Double,
    val magneticX: Float,
    val magneticY: Float,
    val magneticZ: Float,
    val magnitude: Float,
    val accuracy: Float,
    val altitude: Double
)

data class MeasurementResponse(
    val success: Boolean,
    val message: String,
    val id: String? = null
)

data class DetectionDTO(
    val id: String = "",
    val timestamp: Long,
    val latitude: Double,
    val longitude: Double,
    val magnitude: Float,
    val accuracy: Float
)

data class HistoryItem(
    val id: String,
    val date: String,
    val count: Int,
    val maxMagnitude: Float
)
