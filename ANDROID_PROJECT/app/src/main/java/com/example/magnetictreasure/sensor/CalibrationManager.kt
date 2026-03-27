package com.example.magnetictreasure.sensor

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

data class CalibrationData(
    val baseline: Float,
    val calibratedAt: Long,
    val readings: Int
)

class CalibrationManager(context: Context) {
    
    private val sharedPreferences: SharedPreferences = 
        context.getSharedPreferences("magnetometer_calib", Context.MODE_PRIVATE)
    
    private val _calibrationData = MutableStateFlow<CalibrationData?>(null)
    val calibrationData: StateFlow<CalibrationData?> = _calibrationData
    
    private val _calibrationProgress = MutableStateFlow(0)
    val calibrationProgress: StateFlow<Int> = _calibrationProgress
    
    private val _isCalibrating = MutableStateFlow(false)
    val isCalibrating: StateFlow<Boolean> = _isCalibrating
    
    private val readings = mutableListOf<Float>()
    
    init {
        loadCalibrationData()
    }
    
    fun startCalibration() {
        readings.clear()
        _isCalibrating.value = true
        _calibrationProgress.value = 0
    }
    
    fun addReading(magneticStrength: Float) {
        if (_isCalibrating.value) {
            readings.add(magneticStrength)
            _calibrationProgress.value = minOf(100, (readings.size * 100) / 100)
        }
    }
    
    fun completeCalibration(): CalibrationData? {
        return if (readings.isNotEmpty()) {
            val baseline = readings.average().toFloat()
            val data = CalibrationData(
                baseline = baseline,
                calibratedAt = System.currentTimeMillis(),
                readings = readings.size
            )
            
            saveCalibrationData(data)
            _calibrationData.value = data
            _isCalibrating.value = false
            
            data
        } else {
            null
        }
    }
    
    fun getBaseline(): Float {
        return _calibrationData.value?.baseline ?: 25f // Varsayılan: Normal dünya manyetik alanı
    }
    
    fun calculateAnomaly(magneticStrength: Float): Float {
        val baseline = getBaseline()
        return magneticStrength - baseline
    }
    
    private fun saveCalibrationData(data: CalibrationData) {
        with(sharedPreferences.edit()) {
            putFloat("baseline", data.baseline)
            putLong("calibrated_at", data.calibratedAt)
            putInt("readings_count", data.readings)
            apply()
        }
    }
    
    private fun loadCalibrationData() {
        val baseline = sharedPreferences.getFloat("baseline", -1f)
        if (baseline >= 0) {
            val calibratedAt = sharedPreferences.getLong("calibrated_at", 0)
            val readingsCount = sharedPreferences.getInt("readings_count", 0)
            
            _calibrationData.value = CalibrationData(
                baseline = baseline,
                calibratedAt = calibratedAt,
                readings = readingsCount
            )
        }
    }
    
    fun clearCalibration() {
        sharedPreferences.edit().clear().apply()
        _calibrationData.value = null
    }
}
