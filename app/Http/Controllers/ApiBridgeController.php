<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ApiBridgeController extends Controller
{
    /**
     * Récupérer tous les utilisateurs
     */
    public function getAllUsers()
    {
        try {
            $users = User::all();

            $formattedUsers = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedUsers
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des utilisateurs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Rechercher des utilisateurs par nom ou email
     */
    public function searchUsers(Request $request)
    {
        try {
            $query = $request->input('query', '');

            // Si la requête est vide, retourner tous les utilisateurs
            if (empty($query)) {
                return $this->getAllUsers();
            }

            $users = User::where('name', 'like', "%{$query}%")
                ->orWhere('email', 'like', "%{$query}%")
                ->get();

            $formattedUsers = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedUsers
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la recherche des utilisateurs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la recherche des utilisateurs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer les données d'un utilisateur spécifique
     */
    public function getUser($id)
    {
        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Utilisateur non trouvé'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération de l\'utilisateur: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération de l\'utilisateur',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Récupérer tous les projets
     */
    public function getAllProjects()
    {
        try {
            $projects = Project::all();

            $formattedProjects = $projects->map(function ($project) {
                return [
                    'id' => $project->id,
                    'name' => $project->title,
                    'description' => $project->description ?? 'Pas de description',
                    'status' => $project->status ? $project->status->name : 'En cours',
                    'deadline' => $project->end_date ? $project->end_date->format('Y-m-d') : 'Non définie'
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedProjects
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des projets: ' . $e->getMessage());

            // En cas d'erreur, retourner un projet par défaut
            return response()->json([
                'success' => true,
                'data' => [
                    [
                        'id' => 1,
                        'name' => 'Projet par défaut',
                        'description' => 'Projet par défaut pour les équipes',
                        'status' => 'En cours',
                        'deadline' => '2025-12-31'
                    ]
                ]
            ]);
        }
    }

    /**
     * Récupérer un projet spécifique
     */
    public function getProject($id)
    {
        try {
            $project = Project::find($id);

            if (!$project) {
                // Si le projet n'existe pas, retourner un projet par défaut
                return response()->json([
                    'success' => true,
                    'data' => [
                        'id' => $id,
                        'name' => 'Projet ' . $id,
                        'description' => 'Projet générique',
                        'status' => 'En cours',
                        'deadline' => '2025-12-31'
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $project->id,
                    'name' => $project->title,
                    'description' => $project->description ?? 'Pas de description',
                    'status' => $project->status ? $project->status->name : 'En cours',
                    'deadline' => $project->end_date ? $project->end_date->format('Y-m-d') : 'Non définie'
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du projet: ' . $e->getMessage());

            // En cas d'erreur, retourner un projet par défaut
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $id,
                    'name' => 'Projet ' . $id,
                    'description' => 'Projet générique',
                    'status' => 'En cours',
                    'deadline' => '2025-12-31'
                ]
            ]);
        }
    }

    /**
     * Récupérer toutes les équipes
     */
    public function getAllTeams()
    {
        try {
            $teams = Team::with(['manager', 'project', 'members'])->get();

            $formattedTeams = $teams->map(function ($team) {
                return [
                    'id' => $team->id,
                    'name' => $team->name,
                    'description' => $team->description ?? '',
                    'manager' => $team->manager ? [
                        'id' => $team->manager->id,
                        'name' => $team->manager->name,
                        'email' => $team->manager->email,
                    ] : null,
                    'project' => $team->project ? [
                        'id' => $team->project->id,
                        'title' => $team->project->title,
                    ] : null,
                    'members' => $team->members->map(function ($member) {
                        return [
                            'id' => $member->id,
                            'name' => $member->name,
                            'email' => $member->email,
                        ];
                    }),
                    'created_at' => $team->created_at->format('Y-m-d'),
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $formattedTeams
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des équipes: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des équipes',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}