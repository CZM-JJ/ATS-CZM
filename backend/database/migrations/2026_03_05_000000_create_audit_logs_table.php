<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('user_name')->default('System');
            $table->string('action');          // login, logout, create, update, delete, status_change
            $table->string('entity');          // applicant, position, user, session
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->string('entity_label')->nullable(); // snapshot of name/title
            $table->string('description');
            $table->string('ip_address', 45)->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
