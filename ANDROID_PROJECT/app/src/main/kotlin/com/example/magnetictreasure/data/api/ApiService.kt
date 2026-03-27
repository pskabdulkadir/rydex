package com.example.magnetictreasure.data.api

import com.example.magnetictreasure.data.models.MeasurementRequest
import com.example.magnetictreasure.data.models.MeasurementResponse
import com.example.magnetictreasure.data.models.DetectionDTO
import com.example.magnetictreasure.data.models.HistoryItem
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.Body
import retrofit2.http.Query

interface ApiService {

    /**
     * Yeni ölçüm kaydını backend'e kaydet
     */
    @POST("/api/measurements/save")
    suspend fun saveMeasurement(
        @Body measurement: MeasurementRequest
    ): MeasurementResponse

    /**
     * Toplu ölçümleri kaydet
     */
    @POST("/api/measurements/batch")
    suspend fun saveMeasurementBatch(
        @Body measurements: List<MeasurementRequest>
    ): MeasurementResponse

    /**
     * Tüm tespit edilen anomalileri al
     */
    @GET("/api/detections")
    suspend fun getDetections(): List<DetectionDTO>

    /**
     * Tarih aralığına göre ölçümleri al
     */
    @GET("/api/measurements")
    suspend fun getMeasurements(
        @Query("startDate") startDate: Long,
        @Query("endDate") endDate: Long
    ): List<MeasurementRequest>

    /**
     * Geçmiş verilerini al
     */
    @GET("/api/history")
    suspend fun getHistory(): List<HistoryItem>

    /**
     * API sağlığını kontrol et
     */
    @GET("/api/ping")
    suspend fun ping(): Map<String, String>
}
