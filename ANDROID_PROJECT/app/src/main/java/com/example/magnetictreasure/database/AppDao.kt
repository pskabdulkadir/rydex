package com.example.magnetictreasure.database

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Delete
import kotlinx.coroutines.flow.Flow

@Dao
interface ReadingDao {
    
    @Insert
    suspend fun insertReading(reading: ReadingEntity)
    
    @Insert
    suspend fun insertReadings(readings: List<ReadingEntity>)
    
    @Query("SELECT * FROM magnetic_readings ORDER BY timestamp DESC")
    fun getAllReadings(): Flow<List<ReadingEntity>>
    
    @Query("SELECT * FROM magnetic_readings WHERE timestamp >= :startTime ORDER BY timestamp DESC")
    fun getReadingsSince(startTime: Long): Flow<List<ReadingEntity>>
    
    @Query("SELECT COUNT(*) FROM magnetic_readings")
    suspend fun getReadingCount(): Int
    
    @Query("DELETE FROM magnetic_readings")
    suspend fun deleteAllReadings()
    
    @Query("DELETE FROM magnetic_readings WHERE timestamp < :beforeTime")
    suspend fun deleteOldReadings(beforeTime: Long)
}

@Dao
interface TreasureDao {
    
    @Insert
    suspend fun insertTreasure(treasure: TreasureEntity)
    
    @Insert
    suspend fun insertTreasures(treasures: List<TreasureEntity>)
    
    @Query("SELECT * FROM treasure_detections ORDER BY timestamp DESC")
    fun getAllTreasures(): Flow<List<TreasureEntity>>
    
    @Query("SELECT * FROM treasure_detections WHERE timestamp >= :startTime ORDER BY timestamp DESC")
    fun getTreasuresSince(startTime: Long): Flow<List<TreasureEntity>>
    
    @Query("SELECT * FROM treasure_detections WHERE resourceType = :type ORDER BY timestamp DESC")
    fun getTreasuresByType(type: String): Flow<List<TreasureEntity>>
    
    @Query("SELECT COUNT(*) FROM treasure_detections WHERE resourceType = :type")
    suspend fun getTreasureCount(type: String): Int
    
    @Delete
    suspend fun deleteTreasure(treasure: TreasureEntity)
    
    @Query("DELETE FROM treasure_detections")
    suspend fun deleteAllTreasures()
}
