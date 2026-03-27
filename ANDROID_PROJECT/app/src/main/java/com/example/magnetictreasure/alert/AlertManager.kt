package com.example.magnetictreasure.alert

import android.content.Context
import android.media.ToneGenerator
import android.media.AudioManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.app.NotificationManager
import android.app.NotificationChannel
import androidx.core.app.NotificationCompat
import com.example.magnetictreasure.R

class AlertManager(private val context: Context) {
    
    private val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
    private val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    
    init {
        createNotificationChannel()
    }
    
    fun triggerAlert(magneticStrength: Float, threshold: Float) {
        if (magneticStrength > threshold) {
            val level = (magneticStrength / threshold) * 100
            
            when {
                level > 150 -> {
                    // KRİTİK
                    playAudioAlert(1500, 200)
                    triggerVibration(longArrayOf(100, 100, 100, 100))
                }
                level > 120 -> {
                    // YÜKSEK
                    playAudioAlert(1000, 300)
                    triggerVibration(longArrayOf(200, 100, 200))
                }
                else -> {
                    // ORTA
                    playAudioAlert(800, 200)
                    triggerVibration(longArrayOf(100, 50, 100))
                }
            }
        }
    }
    
    fun triggerCriticalAlert(resourceName: String, magneticStrength: Float) {
        // Sesli
        playAudioAlert(1500, 500)
        
        // Titreşim
        triggerVibration(longArrayOf(100, 100, 100, 100, 100, 100))
        
        // Bildirim
        showNotification(
            title = "🎯 $resourceName Tespit Edildi!",
            message = "Manyetik şiddet: ${String.format("%.2f", magneticStrength)} µT"
        )
    }
    
    private fun playAudioAlert(frequency: Int, duration: Int) {
        try {
            val toneGenerator = ToneGenerator(AudioManager.STREAM_ALARM, 100)
            toneGenerator.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, duration)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    
    private fun triggerVibration(pattern: LongArray) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(
                    VibrationEffect.createWaveform(pattern, -1)
                )
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(pattern, -1)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
    
    private fun showNotification(title: String, message: String) {
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()
        
        notificationManager.notify(NOTIFICATION_ID, notification)
    }
    
    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Magnetometer Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Uyarı ve Bildirimler"
            }
            notificationManager.createNotificationChannel(channel)
        }
    }
    
    companion object {
        private const val CHANNEL_ID = "magnetometer_alerts"
        private const val NOTIFICATION_ID = 1001
    }
}
