<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentsProject;
use App\Models\Project;
use App\Utils\TeamUtils;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommentsProjetController extends Controller
{
    /**
     * Affiche tous les commentaires d'un projet.
     *
     * @param  int  $projectId
     * @return JsonResponse
     */
    public function index(int $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        
        $comments = CommentsProject::with('user')
                          ->where('project_id', $projectId)
                          ->orderBy('created_at', 'desc')
                          ->get();
        
        // Formatage des commentaires pour le frontend
        $formattedComments = $comments->map(function ($comment) {
            return [
                'id' => $comment->id,
                'content' => $comment->content,
                'created_at' => $comment->created_at->format('d/m/Y'),
                'user' => [
                    'id' => $comment->user->id,
                    'name' => $comment->user->name,
                    'avatar' => $comment->user->avatar ?? null
                ]
            ];
        });
        
        return response()->json([
            'success' => true,
            'data' => $formattedComments,
            'total' => $comments->count()
        ]);
    }

    /**
     * Enregistre un nouveau commentaire.
     *
     * @param  Request  $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
            'project_id' => 'required|exists:projects,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $projectId = $request->project_id;
        
        // Vérifier que l'utilisateur fait partie d'une équipe du projet
        if (!TeamUtils::isUserInProjectTeam($projectId)) {
            return response()->json([
                'success' => false,
                'message' => 'Vous devez être membre d\'une équipe du projet pour ajouter un commentaire'
            ], 403);
        }

        $comment = CommentsProject::create([
            'content' => $request->content,
            'project_id' => $projectId,
            'user_id' => Auth::id(),
        ]);

        $comment->load('user');

        // Formatage du commentaire pour le frontend
        $formattedComment = [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at->format('d/m/Y'),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar' => $comment->user->avatar ?? null
            ]
        ];

        return response()->json([
            'success' => true,
            'message' => 'Commentaire ajouté avec succès',
            'data' => $formattedComment
        ], 201);
    }

    /**
     * Affiche un commentaire spécifique.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function show(int $id): JsonResponse
    {
        $comment = CommentsProject::with('user')->findOrFail($id);
        
        // Formatage du commentaire pour le frontend
        $formattedComment = [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at->format('d/m/Y'),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar' => $comment->user->avatar ?? null
            ]
        ];
        
        return response()->json([
            'success' => true,
            'data' => $formattedComment
        ]);
    }

    /**
     * Met à jour un commentaire existant.
     *
     * @param  Request  $request
     * @param  int  $id
     * @return JsonResponse
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $comment = CommentsProject::findOrFail($id);
        
        // Vérifier si l'utilisateur est autorisé à modifier ce commentaire
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $comment->update([
            'content' => $request->content,
        ]);

        $comment->load('user');

        // Formatage du commentaire pour le frontend
        $formattedComment = [
            'id' => $comment->id,
            'content' => $comment->content,
            'created_at' => $comment->created_at->format('d/m/Y'),
            'user' => [
                'id' => $comment->user->id,
                'name' => $comment->user->name,
                'avatar' => $comment->user->avatar ?? null
            ]
        ];

        return response()->json([
            'success' => true,
            'message' => 'Commentaire mis à jour avec succès',
            'data' => $formattedComment
        ]);
    }

    /**
     * Supprime un commentaire.
     *
     * @param  int  $id
     * @return JsonResponse
     */
    public function destroy(int $id): JsonResponse
    {
        $comment = CommentsProject::findOrFail($id);
        
        // Vérifier si l'utilisateur est autorisé à supprimer ce commentaire
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorisé'
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Commentaire supprimé avec succès'
        ]);
    }
}