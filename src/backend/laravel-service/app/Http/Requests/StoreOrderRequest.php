<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nom' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email:rfc'],
            'seat_ids' => ['sometimes', 'array'],
            'seat_ids.*' => ['uuid'],
        ];
    }
}
