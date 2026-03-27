package com.example.magnetictreasure.ui.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.example.magnetictreasure.databinding.ItemTreasureBinding
import com.example.magnetictreasure.database.TreasureEntity
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class TreasureAdapter(
    private val treasures: List<TreasureEntity>
) : RecyclerView.Adapter<TreasureAdapter.TreasureViewHolder>() {
    
    private val resourceEmojis = mapOf(
        "TREASURE" to "💎",
        "VALUABLE_MATERIAL" to "✨",
        "MINERAL" to "⛏️",
        "UNDERGROUND_STRUCTURE" to "🏗️",
        "UNKNOWN" to "❓"
    )
    
    private val resourceNames = mapOf(
        "TREASURE" to "Hazine",
        "VALUABLE_MATERIAL" to "Değerli Materyal",
        "MINERAL" to "Madeni Kaynak",
        "UNDERGROUND_STRUCTURE" to "Yer Altı Yapısı",
        "UNKNOWN" to "Bilinmeyen"
    )
    
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): TreasureViewHolder {
        val binding = ItemTreasureBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return TreasureViewHolder(binding)
    }
    
    override fun onBindViewHolder(holder: TreasureViewHolder, position: Int) {
        holder.bind(treasures[position])
    }
    
    override fun getItemCount() = treasures.size
    
    inner class TreasureViewHolder(private val binding: ItemTreasureBinding) :
        RecyclerView.ViewHolder(binding.root) {
        
        fun bind(treasure: TreasureEntity) {
            val emoji = resourceEmojis[treasure.resourceType] ?: "❓"
            val name = resourceNames[treasure.resourceType] ?: "Bilinmeyen"
            
            binding.resourceEmoji.text = emoji
            binding.resourceName.text = name
            binding.magneticStrength.text = String.format("%.2f µT", treasure.magneticStrength)
            binding.anomalyLevel.text = String.format("%.2f µT", treasure.anomalyLevel)
            binding.confidence.text = String.format("%.0f%%", treasure.confidence)
            
            val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
            val date = Date(treasure.timestamp)
            binding.timestamp.text = dateFormat.format(date)
        }
    }
}
