<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {

        // Vérifier si c'est une requête de mise à jour (PUT/PATCH) ou de création (POST)
        $isUpdateRequest = $this->isMethod('PUT') || $this->isMethod('PATCH');

        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $this->route('id') . '',
            'role' => 'required|string|in:manager,employee,admin',
            'number' => 'required|string|regex:/^[0-9]{8,15}$/',
        ];

        // Ajouter la règle de mot de passe uniquement pour les créations ou si le mot de passe est fourni
        if (!$isUpdateRequest) {
            // Pour les nouvelles créations, le mot de passe est obligatoire
            $rules['password'] = 'required|string|min:8';
        } else {
            // Pour les mises à jour, le mot de passe est facultatif mais doit respecter les règles s'il est fourni
            $rules['password'] = 'nullable|string|min:8';
        }

        return $rules;
    }




}