<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{


    public function rules()
    {
        // Obtenir l'ID depuis la route pour l'exception d'unicité
        // $projectId = $this->route('id');

        $rules = [
            'title' => 'required|string|max:255|unique:projects,title',
            'description' => 'required|string',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'priority_id' => 'required|exists:priorities,id',
        ];

        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $rules['title'] = 'required|string|max:255|unique:projects,title,' . $this->route('id');
        }

        return $rules;


        //'manager_id' => 'required|exists:users,id',
        // 'members' => 'nullable|array',
        // 'members.*.user_id' => 'required|exists:users,id',
        // 'members.*.role' => 'nullable|string|max:100',



    }
}