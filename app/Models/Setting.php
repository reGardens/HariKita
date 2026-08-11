<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Setting extends Model
{
    protected $fillable = [
        'wedding_id',
        'template_id',
        'theme_colors',
        'gallery_layout',
        'moderation_enabled',
        'password_protected',
        'password',
        'show_watermark',
        'custom_domain',
        'health_protocol',
        'live_stream_url',
        'shipping_address',
        'seo_meta',
        'qris_image_url',
        'amplop_accounts',
        'amplop_addresses',
        'amplop_thank_you_msg',
        'countdown_datetime',
        'custom_message',
        'love_story',
        'wishlist_items',
        'wishlist_enabled',
    ];

    protected $casts = [
        'theme_colors' => 'array',
        'seo_meta' => 'array',
        'amplop_accounts' => 'array',
        'amplop_addresses' => 'array',
        'love_story' => 'array',
        'wishlist_items' => 'array',
        'moderation_enabled' => 'boolean',
        'password_protected' => 'boolean',
        'show_watermark' => 'boolean',
        'wishlist_enabled' => 'boolean',
    ];

    public function wedding(): BelongsTo
    {
        return $this->belongsTo(Wedding::class);
    }
}
