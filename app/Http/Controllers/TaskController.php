<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Services\TasktStatusUpdater;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        if (!$user)
            return response()->json(['message' => 'Unauthenticated'], 401);

        if ($user->role === 'admin') {
            $tasks = Task::with(['project', 'status', 'priority', 'assignedUser'])->get();

        } else {
            // Cas manager + employé : on récupère toutes les tâches,
            // puis on filtre en fonction du projet ET du lien réel

            $tasks = Task::with(['project.team', 'status', 'priority', 'assignedUser'])
                ->get()
                ->filter(function ($task) use ($user) {
                    $project = $task->project;

                    // Si le projet est null → ignorer cette tâche
                    if (!$project)
                        return false;

                    // OK si manager du projet
                    if ($user->isManagerOfProject($project))
                        return true;

                    // OK si la tâche lui est assignée
                    return $task->assigned_to === $user->id;
                })
                ->values();
        }

        return response()->json([
            'success' => true,
            'data' => TaskResource::collection($tasks)
        ]);
    }
    public function store(Request $request)
    {
        $user = Auth::user();

        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            return response()->json([
                'message' => 'Accès refusé : seuls les managers et administrateurs peuvent créer une tâche.'
            ], 403);
        }

        $validated = $request->validate(app(TaskRequest::class)->rules());

        $task = Task::create($validated);

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
