<?php

namespace App\Http\Controllers;

use App\Http\Requests\EdbRequest;
use App\Http\Resources\EdbResource;
use App\Models\Attachment;
use App\Models\Edb;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;

class EdbController extends Controller
{
    public function index()
    {
        $edbs = Edb::all();
        return response()->json([
            'success' => true,
            'data' => EdbResource::collection($edbs)
        ], 200); // OK - Déjà présent
    }

    public function getAllEdbs()
    {
        $edbs = Edb::all();
        return response()->json([
            'success' => true,
            'data' => EdbResource::collection($edbs)
        ], 200); // OK - Déjà présent
    }

    public function store(EdbRequest $request)
    {
        $validated = $request->validated();

        $edb = Edb::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Edb créé avec succès',
            'data' => new EdbResource($edb)
        ], 201); // Created - Déjà présent
    }

    public function show($id)
    {
        $edb = Edb::find($id);
        if (!$edb) {
            return response()->json([
                'success' => false,
                'message' => 'Edb non trouvé'
            ], 404); // Not Found - Déjà présent
        }

        return response()->json([
            'success' => true,
            'data' => new EdbResource($edb)
        ], 200); // OK - Ajouté
    }

    public function update(EdbRequest $request, $id)
    {
        $edb = Edb::find($id);
        if (!$edb) {
            return response()->json([
                'success' => false,
                'message' => 'Edb non trouvé'
            ], 404); // Not Found - Déjà présent
        }

        $validated = $request->validated();
        $edb->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Edb mis à jour avec succès',
            'data' => new EdbResource($edb)
        ], 200); // OK - Remplacé noContent() par une réponse 200 avec données
    }

    public function destroy($id)
    {
        $edb = Edb::find($id);
        if (!$edb) {
            return response()->json([
                'success' => false,
                'message' => 'Edb non trouvé'
            ], 404); // Not Found - Déjà présent
        }

        $edb->delete();

        return response()->json([
            'success' => true,
            'message' => 'Edb supprimé avec succès'
        ], 200); // OK - Ajouté
    }

    public function approveEdb($id)
    {
        $edb = Edb::findOrFail($id);
        $edb->status_id = 5; // ID du statut "approuvé"
        $edb->save();

        return response()->json([
            'success' => true,
            'message' => 'Demande approuvée avec succès'
        ], 200); // OK - Ajouté
    }

    public function rejectEdb($id)
    {
        $edb = Edb::findOrFail($id);
        $edb->status_id = 6; // ID du statut "rejeté"
        $edb->save();

        return response()->json([
            'success' => true,
            'message' => 'Demande rejetée avec succès'
        ], 200); // OK - Ajouté
    }

    public function uploadMultipleAttachments(Request $request, $id)
    {
        $request->validate([
            'files.*' => 'required|file|mimes:pdf,docx,xlsx,jpg,png|max:20480',
        ]);

        $edb = EDB::findOrFail($id);
        $paths = [];

        foreach ($request->file('files') as $file) {
            $filePath = $file->store('edb_files', 'public');

            Attachment::create([
                'edb_id' => $edb->id,
                'file_path' => $filePath,
                'file_name' => $file->getClientOriginalName(),
            ]);

            $paths[] = $filePath;
        }

        return response()->json([
            'success' => true,
            'message' => 'Fichiers envoyés avec succès.',
            'files' => $paths,
        ], 201); // Created - Ajouté avec success field
    }

    public function getAttachments($id)
    {
        $edb = Edb::findOrFail($id);
        $attachments = Attachment::where('edb_id', $id)->get();

        return response()->json([
            'success' => true,
            'data' => $attachments
        ], 200); // OK - Ajouté
    }

    /**
     * Supprimer une pièce jointe
     */
    public function deleteAttachment($id, $attachmentId)
    {
        $edb = Edb::findOrFail($id);
        $attachment = Attachment::where('edb_id', $id)
            ->where('id', $attachmentId)
            ->firstOrFail();

        // Supprimer le fichier physique
        Storage::disk('public')->delete($attachment->file_path);

        // Supprimer l'enregistrement en base de données
        $attachment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fichier supprimé avec succès'
        ], 200); // OK - Ajouté
    }

   



}
