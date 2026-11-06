<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BulkTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
            'tasks' => 'required|array|min:1',
            'tasks.*.title' => 'required|string|max:255',
            'tasks.*.description' => 'nullable|string',
            'tasks.*.assigned_to' => 'nullable|exists:users,id',
            'tasks.*.priority_id' => 'required|exists:priorities,id',
            'tasks.*.start_date' => 'required|date',
            'tasks.*.end_date' => 'required|date|after_or_equal:tasks.*.start_date',
            'tasks.*.progress' => 'nullable|integer|min:0|max:100',
            'tasks.*.depends_on' => 'array'
        ];
    }
}
