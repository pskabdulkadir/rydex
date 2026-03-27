package com.example.magnetictreasure.database

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "magnetic_readings")
data class ReadingEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val x: Float,
    val y: Float,
    val z: Float,
    val total: Float,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val timestamp: Long = System.currentTimeMillis()
)

@Entity(tableName = "treasure_detections")
data class TreasureEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,
    val uuid: String,
    val resourceType: String, // TREASURE, MINERAL, vb.
    val magneticStrength: Float,
    val anomalyLevel: Float,
    val confidence: Float,
    val latitude: Double? = null,
    val longitude: Double? = null,
    val timestamp: Long = System.currentTimeMillis()
)
