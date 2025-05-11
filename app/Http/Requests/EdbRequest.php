<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EdbRequest extends FormRequest
{
    public function authorize()
    {
        return true; // Autorise tous les utilisateurs à soumettre cette requête
    }

    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'objectif' => 'nullable|string|max:255',
            'contrainte' => 'nullable|string|max:255',
            'priority_id' => 'required|exists:priorities,id',
        ];
    }
}
