<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->json('amplop_accounts')->nullable()->after('qris_image_url');
            $table->json('amplop_addresses')->nullable()->after('amplop_accounts');
            $table->text('amplop_thank_you_msg')->nullable()->after('amplop_addresses');
            $table->string('countdown_datetime')->nullable()->after('amplop_thank_you_msg');
            $table->text('custom_message')->nullable()->after('countdown_datetime');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->string('dress_code')->nullable()->after('location_map_url');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn([
                'amplop_accounts',
                'amplop_addresses',
                'amplop_thank_you_msg',
                'countdown_datetime',
                'custom_message',
            ]);
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('dress_code');
        });
    }
};
