package com.example.magnetictreasure.data.repository

import com.example.magnetictreasure.data.api.RetrofitClient
import com.example.magnetictreasure.data.models.MeasurementDTO
import com.example.magnetictreasure.data.models.MeasurementRequest
import com.example.magnetictreasure.data.models.DetectionDTO
import com.example.magnetictreasure.data.models.HistoryItem
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.LocalDateTime
import java.time.ZoneId

class MeasurementRepository {

    private val apiService = RetrofitClient.apiService
    private val measurementCache = mutableListOf<MeasurementDTO>()
    private val detectionCache = mutableListOf<DetectionDTO>()

    /**
     * Tek bir ölçümü backend'e kaydet
     */
    suspend fun saveMeasurement(measurement: MeasurementDTO): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                // Önce cache'e ekle
                measurementCache.add(measurement)

                // Backend'e gönder
                val request = MeasurementRequest(
                    timestamp = measurement.timestamp,
                    latitude = measurement.latitude,
                    longitude = measurement.longitude,
                    magneticX = measurement.magneticX,
                    magneticY = measurement.magneticY,
                    magneticZ = measurement.magneticZ,
                    magnitude = measurement.magnitude,
                    accuracy = measurement.accuracy,
                    altitude = measurement.altitude
                )

                val response = apiService.saveMeasurement(request)
                if (response.success) {
                    Result.success(response.id ?: measurement.id)
                } else {
                    Result.failure(Exception(response.message))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * Toplu ölçümleri backend'e kaydet
     */
    suspend fun saveMeasurementBatch(measurements: List<MeasurementDTO>): Result<String> {
        return withContext(Dispatchers.IO) {
            try {
                // Cache'e ekle
                measurementCache.addAll(measurements)

                // Request'lere dönüştür
                val requests = measurements.map { m ->
                    MeasurementRequest(
                        timestamp = m.timestamp,
                        latitude = m.latitude,
                        longitude = m.longitude,
                        magneticX = m.magneticX,
                        magneticY = m.magneticY,
                        magneticZ = m.magneticZ,
                        magnitude = m.magnitude,
                        accuracy = m.accuracy,
                        altitude = m.altitude
                    )
                }

                val response = apiService.saveMeasurementBatch(requests)
                if (response.success) {
                    Result.success(response.message)
                } else {
                    Result.failure(Exception(response.message))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * Cache'den ölçümleri al
     */
    fun getMeasurementsFromCache(): List<MeasurementDTO> {
        return measurementCache.toList()
    }

    /**
     * Backend'den ölçümleri al
     */
    suspend fun getMeasurementsFromServer(
        startDate: Long,
        endDate: Long
    ): Result<List<MeasurementDTO>> {
        return withContext(Dispatchers.IO) {
            try {
                val measurements = apiService.getMeasurements(startDate, endDate)
                val dtos = measurements.map { m ->
                    MeasurementDTO(
                        timestamp = m.timestamp,
                        latitude = m.latitude,
                        longitude = m.longitude,
                        magneticX = m.magneticX,
                        magneticY = m.magneticY,
                        magneticZ = m.magneticZ,
                        magnitude = m.magnitude,
                        accuracy = m.accuracy,
                        altitude = m.altitude
                    )
                }
                Result.success(dtos)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * Tüm tespit edilen anomalileri al
     */
    suspend fun getDetections(): Result<List<DetectionDTO>> {
        return withContext(Dispatchers.IO) {
            try {
                val detections = apiService.getDetections()
                detectionCache.clear()
                detectionCache.addAll(detections)
                Result.success(detections)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * Cache'den tespit edilen anomalileri al
     */
    fun getDetectionsFromCache(): List<DetectionDTO> {
        return detectionCache.toList()
    }

    /**
     * Geçmiş verilerini al
     */
    suspend fun getHistory(): Result<List<HistoryItem>> {
        return withContext(Dispatchers.IO) {
            try {
                val history = apiService.getHistory()
                Result.success(history)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * API bağlantısını test et
     */
    suspend fun testConnection(): Result<Boolean> {
        return withContext(Dispatchers.IO) {
            try {
                apiService.ping()
                Result.success(true)
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
    }

    /**
     * Cache'i temizle
     */
    fun clearCache() {
        measurementCache.clear()
        detectionCache.clear()
    }
}
