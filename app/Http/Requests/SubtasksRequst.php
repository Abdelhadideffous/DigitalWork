<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SubtasksRequst extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'progress' => 'nullable|integer|min:0|max:100',

        ];
    }
}
