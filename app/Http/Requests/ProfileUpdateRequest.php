<?php

namespace App\Http\Requests;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'lowercase',
                'email',
                'max:255',
                Rule::unique(User::class)->ignore($this->user()->id),
            ],
            'phone' => [
                $this->user()->role === 'buyer' ? 'required' : 'nullable',
                'string',
                'min:9',
                'max:20',
                'regex:/^[0-9\-\+\s]+$/'
            ],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'phone.required' => 'Nomor HP wajib diisi.',
            'phone.min' => 'Nomor HP minimal terdiri dari 9 angka.',
            'phone.max' => 'Nomor HP maksimal terdiri dari 20 angka.',
            'phone.regex' => 'Format nomor HP tidak valid (hanya angka, spasi, tanda hubung -, dan awalan + yang diperbolehkan).',
        ];
    }
}
