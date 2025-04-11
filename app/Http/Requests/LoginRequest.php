<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class LoginRequest extends FormRequest
{
    // /**
    //  * Determine if the user is authorized to make this request.
    //  */
    // public function authorize(): bool
    // {
    //     return true; // Tous les utilisateurs peuvent essayer de se connecter
    // }

   

    
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string',
        ];
    }

    // /**
    //  * Get custom messages for validator errors.
    //  *
    //  * @return array
    //  */
    // // public function messages(): array
    // // {
    // //     return [
    // //         'email.required' => 'L\'email est obligatoire',
    // //         'email.email' => 'L\'email doit être une adresse valide',
    // //         'password.required' => 'Le mot de passe est obligatoire',
    // //     ];
    // // }

    // // /**
    // //  * Handle a failed validation attempt.
    // //  *
    // //  * @param  \Illuminate\Contracts\Validation\Validator  $validator
    // //  * @return void
    // //  *
    // //  * @throws \Illuminate\Http\Exceptions\HttpResponseException
    // //  */
    // // protected function failedValidation(Validator $validator)
    // // {
    // //     throw new HttpResponseException(response()->json([
    // //         'success' => false,
    // //         'message' => 'Erreur de validation',
    // //         'errors' => $validator->errors()
    // //     ], 422));
    // // }
}