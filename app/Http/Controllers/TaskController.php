<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{


    public function index()
    {
        $tasks = Task::with(['project', 'assignedUser', 'status', 'priority'])->get();
        return TaskResource::collection($tasks);
    }




    public function store(TaskRequest $request)
    {
        $task = Task::create($request->validated());
        $task->load(['project', 'assignedUser', 'status', 'priority']);
        return new TaskResource($task);
    }


    public function show(Task $task)
    {
        $task->load(['project', 'assignedUser', 'status', 'priority']);
        return new TaskResource($task);
    }



    public function update(TaskRequest $request, Task $task)
    {
        $task->update($request->validated());
        $task->load(['project', 'assignedUser', 'status', 'priority']);
        return new TaskResource($task);
    }



    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }
}