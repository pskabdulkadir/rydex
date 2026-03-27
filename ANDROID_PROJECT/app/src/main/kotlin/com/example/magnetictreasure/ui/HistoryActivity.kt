package com.example.magnetictreasure.ui

import android.os.Bundle
import android.widget.Button
import android.widget.ListView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.example.magnetictreasure.R
import com.example.magnetictreasure.data.repository.MeasurementRepository
import kotlinx.coroutines.launch

class HistoryActivity : AppCompatActivity() {

    private lateinit var listView: ListView
    private lateinit var btnRefresh: Button
    private val repository = MeasurementRepository()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_history)

        listView = findViewById(R.id.history_list)
        btnRefresh = findViewById(R.id.btn_refresh)

        btnRefresh.setOnClickListener {
            loadHistory()
        }

        // İlk yükleme
        loadHistory()
    }

    private fun loadHistory() {
        lifecycleScope.launch {
            try {
                val result = repository.getHistory()
                result.onSuccess { history ->
                    val items = history.map { item ->
                        "${item.date}: ${item.count} ölçüm (Max: ${item.maxMagnitude} μT)"
                    }
                    updateHistoryList(items)
                    Toast.makeText(this@HistoryActivity, "Geçmiş yüklendi", Toast.LENGTH_SHORT).show()
                }
                result.onFailure { error ->
                    Toast.makeText(this@HistoryActivity, "Hata: ${error.message}", Toast.LENGTH_SHORT).show()
                }
            } catch (e: Exception) {
                Toast.makeText(this@HistoryActivity, "Hata: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun updateHistoryList(items: List<String>) {
        val adapter = android.widget.ArrayAdapter(
            this,
            android.R.layout.simple_list_item_1,
            items
        )
        listView.adapter = adapter
    }
}
