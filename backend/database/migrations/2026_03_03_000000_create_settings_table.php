<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->timestamps();
        });

        // Seed default permissions
        DB::table('settings')->insert([
            'key'        => 'permissions',
            'value'      => json_encode([
                'canEdit'            => ['admin', 'hr_manager', 'hr_supervisor'],
                'canDelete'          => ['admin'],
                'canManagePositions' => ['admin'],
                'canViewAnalytics'   => ['admin', 'hr_manager', 'hr_supervisor'],
                'canManageUsers'     => ['admin'],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
