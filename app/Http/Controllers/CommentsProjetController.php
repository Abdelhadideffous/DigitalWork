<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\CommentsProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class CommentsProjetController extends Controller
{
    /**
     * Afficher tous les commentaires d'un projet
     */
    public function index($projectId)
    {
        try {
            // Récupérer uniquement les commentaires de premier niveau (sans parent)
            $comments = CommentsProject::with(['user', 'replies.user'])
                ->where('project_id', $projectId)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $comments
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des commentaires: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des commentaires',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Créer un nouveau commentaire
     */
    public function store(Request $request)
    {
        try {
            // Validation
            $validated = $request->validate([
                'content' => 'required|string',
                'user_id' => 'required|exists:users,id',
                'project_id' => 'required|exists:projects,id',
                'parent_id' => 'nullable|numeric'
            ]);

            // Vérifier si parent_id existe s'il est fourni
            if ($request->has('parent_id') && $request->parent_id) {
                $parentExists = CommentsProject::where('id', $request->parent_id)->exists();
                if (!$parentExists) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Le commentaire parent spécifié n\'existe pas'
                    ], 400);
                }
            }

            // Créer le commentaire
            $comment = CommentsProject::create([
                'content' => $request->content,
                'user_id' => $request->user_id,
                'project_id' => $request->project_id,
                'parent_id' => $request->parent_id ?: null,
                'likes_count' => 0
            ]);

            // Charger l'utilisateur pour le retourner avec le commentaire
            $comment->load('user');

            return response()->json([
                'success' => true,
                'message' => 'Commentaire créé avec succès',
                'data' => $comment
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la création du commentaire: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du commentaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Afficher un commentaire spécifique
     */
    public function show($id)
    {
        try {
            $comment = CommentsProject::with(['user', 'replies.user'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $comment
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération du commentaire: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération du commentaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mettre à jour un commentaire
     */
    public function update(Request $request, $id)
    {
        try {
            $request->validate([
                'content' => 'required|string'
            ]);

            $comment = CommentsProject::findOrFail($id);

            $comment->update([
                'content' => $request->content
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Commentaire mis à jour avec succès',
                'data' => $comment
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du commentaire: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du commentaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Supprimer un commentaire
     */
    public function destroy($id)
    {
        try {
            $comment = CommentsProject::findOrFail($id);
            $comment->delete();

            return response()->json([
                'success' => true,
                'message' => 'Commentaire supprimé avec succès'
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression du commentaire: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la suppression du commentaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Incrémenter les likes d'un commentaire
     */
    /**
     * Incrémenter les likes d'un commentaire
     */
    public function like($id)
    {
        try {
            $comment = CommentsProject::findOrFail($id);

            // Incrémenter le compteur mais limiter à 1 like par utilisateur
            // Comme nous n'utilisons pas de table pour les likes, on incrémente simplement
            // et on se fie au frontend pour gérer l'état de like de l'utilisateur
            $comment->likes_count = $comment->likes_count + 1;
            $comment->save();

            return response()->json([
                'success' => true,
                'message' => 'Commentaire liké avec succès',
                'likes_count' => $comment->likes_count
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors du like du commentaire: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du like du commentaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Décrémenter les likes d'un commentaire
     */
    public function unlike($id)
    {
        try {
            $comment = CommentsProject::findOrFail($id);

            // Ne pas décrémenter en dessous de zéro
            if ($comment->likes_count > 0) {
                $comment->likes_count = $comment->likes_count - 1;
                $comment->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Like retiré avec succès',
                'likes_count' => $comment->likes_count
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors du unlike du commentaire: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du unlike du commentaire',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}