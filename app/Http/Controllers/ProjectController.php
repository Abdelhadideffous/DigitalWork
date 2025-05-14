<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TaskResource;
use App\Http\Resources\TeamResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Task;
use App\Models\Team;
use App\Services\ProjectStatusUpdater;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{

    public function index()
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non authentifié'
                ], 401);
            }

            $query = Project::query();

            if ($user->role === 'admin') {
                // Les administrateurs voient tous les projets
                $projects = $query->get();
            } else {
                // Pour les autres utilisateurs, on récupère les projets où ils sont manager ou membre
                $projects = $query
                    ->where(function ($q) use ($user) {
                        $q->whereHas('team', function ($teamQuery) use ($user) {
                            $teamQuery->where('manager_id', $user->id);
                        })
                        ->orWhereHas('team.members', function ($memberQuery) use ($user) {
                            $memberQuery->where('users.id', $user->id);
                        });
                    })
                    ->get();
            }

            return response()->json([
                'success' => true,
                'data' => ProjectResource::collection($projects)
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des projets: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération des projets'
            ], 500);
        }
    }





    public function store(ProjectRequest $request)
    {

        $validated = $request->validated();


        $project = Project::create($validated);


        return response()->json([
            'success' => true,
            'message' => 'Projet créé avec succès',
            'data' => new ProjectResource($project)
        ], 201);
    }

    public function update($id, Request $request)
    {

        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }


        $validated = $request->validate(app(ProjectRequest::class)->rules());

        $project->update($validated);



        return response()->noContent(); // 204
    }

    // response()->json()->noContent(); //204



    public function show($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project)
        ]);
    }

    public function destroy($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }


        // // Récupérer toutes les équipes associées à ce projet
        // $teams = Team::where('project_id', $id)->get();

        // // Supprimer toutes les équipes associées à ce projet
        // foreach ($teams as $team) {

        //     $team->delete();
        // }



        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Projet supprimé avec succès'
        ]);
    }




    public function getProjectTeams($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        $teams = Team::with(['manager', 'members'])
            ->where('project_id', $id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => TeamResource::collection($teams)
        ]);
    }


    public function projetterminer($id)
    {
        $projet = Project::findOrFail($id);
        $projet->status_id = 3; // ID du statut "approuvé"
        $projet->save();

        return response()->json([
            'success' => true,
            'message' => 'projet teminer'
        ], 200); // OK - Ajouté
    }


    public function projetanuule($id)
    {
        $projet = Project::findOrFail($id);
        $projet->status_id = 4; // ID du statut "approuvé"
        $projet->save();

        return response()->json([
            'success' => true,
            'message' => 'projet teminer'
        ], 200); // OK - Ajouté
    }


    public function getProjectTasks($id)
    {
        $project = Project::find($id);
        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        $tasks = Task::with(['assignedUser', 'status', 'priority'])
            ->where('project_id', $id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => TaskResource::collection($tasks)
        ]);
    }



    // Ajouter cette méthode
    public function calculateProjectProgress($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json(['success' => false, 'message' => 'Projet non trouvé'], 404);
        }

        $project->calculateProgress();

        return response()->json([
            'success' => true,
            'message' => 'Progression projet recalculée',
            'data' => new ProjectResource($project)
        ], 200);
    }

    public function getManagedProjects()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role === 'admin') {
            $projects = Project::all(); // admin voit tout
        } elseif ($user->role === 'manager') {
            // manager : projets dont l'équipe est gérée par lui
            $projects = Project::whereHas('team', function ($query) use ($user) {
                $query->where('manager_id', $user->id);
            })->get();
        } else {
            return response()->json([], 200); // employé = aucun
        }

        return response()->json([
            'success' => true,
            'data' => ProjectResource::collection($projects)
        ], 200);


    }



    public function getProjectMembers($id)
    {
        $user = Auth::user();

        $project = Project::with('team.members')->find($id);

        if (!$project || !$project->team) {
            return response()->json(['message' => 'Projet ou équipe introuvable'], 404);
        }

        // ⚠️ Seul le vrai manager ou l'admin peut voir les membres
        if ($user->id !== $project->team->manager_id && $user->role !== 'admin') {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        $team = $project->team;

        // ✅ Inclure le manager + tous les membres
        $allUsers = collect($team->members)->push($team->manager)->unique('id');

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($allUsers)
        ]);
    }



}