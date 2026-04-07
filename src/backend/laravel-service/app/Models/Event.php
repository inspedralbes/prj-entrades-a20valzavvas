<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'date',
        'venue',
        'total_capacity',
        'published',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'datetime',
            'published' => 'boolean',
        ];
    }

    public function seats(): HasMany
    {
        return $this->hasMany(Seat::class);
    }

    public function priceCategories(): HasMany
    {
        return $this->hasMany(PriceCategory::class);
    }
}
