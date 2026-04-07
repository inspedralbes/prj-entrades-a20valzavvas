<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255', 'regex:/^[a-z0-9-]+$/'],
            'description' => ['sometimes', 'nullable', 'string'],
            'date' => ['sometimes', 'date', 'after:now'],
            'venue' => ['sometimes', 'string', 'max:255'],
            'price_categories' => ['sometimes', 'array', 'min:1'],
        ];
    }
}
