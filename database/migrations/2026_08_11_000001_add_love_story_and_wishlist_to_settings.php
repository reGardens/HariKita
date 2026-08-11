<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->json('love_story')->nullable()->after('custom_message');
            $table->json('wishlist_items')->nullable()->after('love_story');
            $table->boolean('wishlist_enabled')->default(true)->after('wishlist_items');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['love_story', 'wishlist_items', 'wishlist_enabled']);
        });
    }
};
