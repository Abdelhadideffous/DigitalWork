<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TasktStatusUpdater;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function index()
    {
        TasktStatusUpdater::update();

        $tasks = Task::with(['project', 'assignedUser', 'status', 'priority'])->get();

        return response()->json([
            'success' => true,
            'data' => TaskResource::collection($tasks)
        ], 200);
    }

    public function store(TaskRequest $request)
    {
        $validated = $request->validated();

        $task = Task::create($validated);
        $task->load(['project', 'assignedUser', 'status', 'priority']);

        return response()->json([
            'success' => true,
            'message' => 'Tâche créée avec succès',
            'data' => new TaskResource($task)
        ], 201);
    }

    public function show($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        $task->load(['project', 'assignedUser', 'status', 'priority']);

        return response()->json([
            'success' => true,
            'data' => new TaskResource($task)
        ], 200);
    }

    public function update($id, Request $request)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        $validated = $request->validate(app(TaskRequest::class)->rules());

        $task->update($validated);
        $task->load(['project', 'assignedUser', 'status', 'priority']);

        return response()->noContent(); // 204
    }

    public function destroy($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tâche supprimée avec succès'
        ], 200);
    }

    public function Taskterminer($id)
    {
        $task = Task::findOrFail($id);
        $task->status_id = 3; // ID du statut "terminé"
        $task->save();

        return response()->json([
            'success' => true,
            'message' => 'Tâche terminée'
        ], 200);
    }

    public function Taskanuule($id)
    {
        $task = Task::findOrFail($id);
        $task->status_id = 4; // ID du statut "annulé"
        $task->save();

        return response()->json([
            'success' => true,
            'message' => 'Tâche annulée'
        ], 200);
    }



    // Ajouter cette méthode
    public function calculateProgress($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Tâche non trouvée'], 404);
        }

        $task->calculateProgress();

        return response()->json([
            'success' => true,
            'message' => 'Progression recalculée',
            'data' => new TaskResource($task)
        ], 200);
    }

}
