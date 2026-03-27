package com.example.magnetictreasure.detection

import com.example.magnetictreasure.sensor.MagneticReading
import kotlin.math.abs

enum class ResourceType {
    TREASURE,                    // 💎 >120 µT
    VALUABLE_MATERIAL,           // ✨ >110 µT
    MINERAL,                     // ⛏️ >95 µT
    UNDERGROUND_STRUCTURE,       // 🏗️ >80 µT
    UNKNOWN                      // ❓
}

data class TreasureResult(
    val id: String = java.util.UUID.randomUUID().toString(),
    val resourceType: ResourceType,
    val magneticStrength: Float,
    val anomalyLevel: Float,
    val confidence: Float, // 0-100
    val latitude: Double? = null,
    val longitude: Double? = null,
    val timestamp: Long = System.currentTimeMillis()
)

class TreasureDetector {
    
    private val anomalyThreshold: Float = 15f // µT
    
    private val thresholds = mapOf(
        ResourceType.TREASURE to 120f,
        ResourceType.VALUABLE_MATERIAL to 110f,
        ResourceType.MINERAL to 95f,
        ResourceType.UNDERGROUND_STRUCTURE to 80f,
        ResourceType.UNKNOWN to 0f
    )
    
    fun detectResources(
        readings: List<MagneticReading>,
        baselineStrength: Float
    ): List<TreasureResult> {
        val results = mutableListOf<TreasureResult>()
        var anomalyCount = 0
        
        readings.forEach { reading ->
            val anomalyLevel = abs(reading.total - baselineStrength)
            
            if (anomalyLevel > anomalyThreshold) {
                anomalyCount++
                
                val resourceType = classifyResource(reading.total)
                val confidence = calculateConfidence(
                    anomalyLevel, 
                    resourceType, 
                    anomalyCount
                )
                
                if (confidence > 30) {
                    results.add(TreasureResult(
                        resourceType = resourceType,
                        magneticStrength = reading.total,
                        anomalyLevel = anomalyLevel,
                        confidence = confidence,
                        timestamp = reading.timestamp
                    ))
                }
            }
        }
        
        return results
    }
    
    private fun classifyResource(magneticStrength: Float): ResourceType {
        return when {
            magneticStrength >= thresholds[ResourceType.TREASURE]!! -> ResourceType.TREASURE
            magneticStrength >= thresholds[ResourceType.VALUABLE_MATERIAL]!! -> ResourceType.VALUABLE_MATERIAL
            magneticStrength >= thresholds[ResourceType.MINERAL]!! -> ResourceType.MINERAL
            magneticStrength >= thresholds[ResourceType.UNDERGROUND_STRUCTURE]!! -> ResourceType.UNDERGROUND_STRUCTURE
            else -> ResourceType.UNKNOWN
        }
    }
    
    private fun calculateConfidence(
        anomalyLevel: Float,
        resourceType: ResourceType,
        detectionCount: Int
    ): Float {
        var confidence = 50f // Başlangıç güveni
        
        // Anomali seviyesine göre arttır
        confidence += minOf(anomalyLevel * 2, 30f)
        
        // Kaynak türüne göre ayarla
        val typeConfidence = when (resourceType) {
            ResourceType.TREASURE -> 20f
            ResourceType.VALUABLE_MATERIAL -> 15f
            ResourceType.MINERAL -> 10f
            ResourceType.UNDERGROUND_STRUCTURE -> 5f
            ResourceType.UNKNOWN -> -10f
        }
        confidence += typeConfidence
        
        // Tekrarlayan deteksiyonlar güveni arttırır
        confidence += minOf(detectionCount * 2, 15f)
        
        return confidence.coerceIn(0f, 100f)
    }
    
    fun getResourceDisplayName(type: ResourceType): String = when (type) {
        ResourceType.TREASURE -> "💎 Hazine"
        ResourceType.VALUABLE_MATERIAL -> "✨ Değerli Materyal"
        ResourceType.MINERAL -> "⛏️ Madeni Kaynak"
        ResourceType.UNDERGROUND_STRUCTURE -> "🏗️ Yer Altı Yapısı"
        ResourceType.UNKNOWN -> "❓ Bilinmeyen"
    }
    
    fun getResourceColor(type: ResourceType): Int = when (type) {
        ResourceType.TREASURE -> 0xFFD700.toInt() // Gold
        ResourceType.VALUABLE_MATERIAL -> 0xFF0000.toInt() // Red
        ResourceType.MINERAL -> 0x00FFFF.toInt() // Cyan
        ResourceType.UNDERGROUND_STRUCTURE -> 0x808080.toInt() // Gray
        ResourceType.UNKNOWN -> 0xFFFFFF.toInt() // White
    }
}
