<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'description' => ['nullable', 'string'],
            'date' => ['required', 'date', 'after:now'],
            'venue' => ['required', 'string', 'max:255'],
            'price_categories' => ['required', 'array', 'min:1'],
            'price_categories.*.name' => ['required', 'string', 'max:255'],
            'price_categories.*.price' => ['required', 'numeric', 'min:0'],
            'price_categories.*.rows' => ['required', 'array', 'min:1'],
            'price_categories.*.rows.*' => ['required', 'string', 'max:10'],
            'price_categories.*.seats_per_row' => ['required', 'integer', 'min:1'],
            'max_seients_per_usuari' => ['sometimes', 'integer', 'min:1'],
        ];
    }
}
