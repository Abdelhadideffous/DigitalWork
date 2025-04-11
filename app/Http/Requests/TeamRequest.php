<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TeamRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }
    
    public function rules()
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'manager_id' => 'required|exists:users,id',
            'project_id' => 'required|exists:projects,id',
            'members' => 'nullable|array',
            'members.*.user_id' => 'required|exists:users,id',
            
        ];
        
        return $rules;
    }
}