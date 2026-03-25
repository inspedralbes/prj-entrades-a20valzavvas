<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignUuid('price_category_id')->constrained('price_categories')->onDelete('cascade');
            $table->string('row');
            $table->unsignedInteger('number');
            $table->string('estat')->default('DISPONIBLE');
            $table->timestamps();
        });

        DB::statement("ALTER TABLE seats ADD CONSTRAINT seats_estat_check CHECK (estat IN ('DISPONIBLE', 'RESERVAT', 'VENUT'))");
    }

    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
