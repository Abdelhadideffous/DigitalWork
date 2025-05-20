<?php

namespace App\Http\Controllers;

use App\Http\Requests\EdbRequest;
use App\Http\Resources\EdbResource;
use App\Models\Attachment;
use App\Models\Edb;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Auth;
use App\Services\NotificationService;

class EdbController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    // public function index()
    // {
    //     $user = Auth::user();
    //     if (!$user) {
    //         return response()->json(['message' => 'Unauthenticated.'], 401);
    //     }

    //     // Admin : tous les enregistrements
    //     if ($user->role === 'admin') {
    //         $edbs = Edb::all();
    //     } else {
    //         // Tous les autres rôles : uniquement leurs propres EDB
    //         $edbs = Edb::where('user_id', $user->id)->get();
    //         // Si tu veux que le manager voie tout, enlève la condition sur le rôle
    //     }

    //     return EdbResource::collection($edbs);
    // }

    public function getAllEdbs()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // Admin : tous les enregistrements
        if ($user->role === 'admin') {
            $edbs = Edb::all();
        } else {

            $edbs = Edb::where('user_id', $user->id)->get();
        }

        return response()->json([
            'success' => true,
            'message' => 'Edb créé avec succès',
            'data' => EdbResource::collection($edbs)
        ], 201);
    }

    public function store(EdbRequest $request)
    {
        $validated = $request->validated();
        $validated['user_id'] = Auth::id();

        $edb = Edb::create($validated);

        // Ajouter la notification
        $this->notificationService->edbSubmitted($edb);

        return response()->json([
            'success' => true,
            'message' => 'Edb créé avec succès',
            'data' => new EdbResource($edb)
        ], 201);
    }

    public function show($id)
    {
        $edb = Edb::find($id);
        if (!$edb) {
            return response()->json([
                'success' => false,
                'message' => 'Edb non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new EdbResource($edb)
        ], 200);
    }

    public function update(EdbRequest $request, $id)
    {
        $edb = Edb::find($id);
        if (!$edb) {
            return response()->json([
                'success' => false,
                'message' => 'Edb non trouvé'
            ], 404);
        }

        $validated = $request->validated();
        $edb->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Edb mis à jour avec succès',
            'data' => new EdbResource($edb)
        ], 200);
    }

    public function destroy($id)
    {
        $edb = Edb::with('attachments')->find($id); // Charger les attachments liés

        if (!$edb) {
            return response()->json([
                'success' => false,
                'message' => 'Edb non trouvé'
            ], 404);
        }

        // Supprimer les fichiers du disque
        foreach ($edb->attachments as $attachment) {
            if ($attachment->file_path && Storage::exists($attachment->file_path)) {
                Storage::delete($attachment->file_path);
            }

            // Supprimer l'enregistrement de l'attachement
            $attachment->delete();
        }

        // Supprimer l'EDB
        $edb->delete();

        return response()->json([
            'success' => true,
            'message' => 'EDB et ses pièces jointes ont été supprimés avec succès'
        ], 200);
    }

    public function approveEdb($id)
    {
        /** @var \App\Models\EDB $edb*/

        $edb = Edb::findOrFail($id);
        $edb->status_id = 6;
        $edb->save();

        $this->notificationService->edbApproved($edb);

        return response()->json([
            'success' => true,
            'message' => 'Demande approuvée avec succès'
        ], 200);
    }

    public function rejectEdb($id)
    {
        /** @var \App\Models\EDB $edb*/
        $edb = Edb::findOrFail($id);
        $edb->status_id = 7;
        $edb->save();


        $this->notificationService->edbRejected($edb);

        return response()->json([
            'success' => true,
            'message' => 'Demande rejetée avec succès'
        ], 200);
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
        ], 201);
    }

    public function getAttachments($id)
    {
        $edb = Edb::findOrFail($id);
        $attachments = Attachment::where('edb_id', $id)->get();

        return response()->json([
            'success' => true,
            'data' => $attachments
        ], 200);
    }


    public function deleteAttachment($id, $attachmentId)
    {
        $edb = Edb::findOrFail($id);
        $attachment = Attachment::where('edb_id', $id)
            ->where('id', $attachmentId)
            ->firstOrFail();

        // Supprimer le fichier physique
        Storage::disk('public')->delete($attachment->file_path);

        $attachment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Fichier supprimé avec succès'
        ], 200);
    }

    public function downloadAttachment($id, $attachmentId)
    {
        $edb = Edb::findOrFail($id);

        $attachment = Attachment::where('edb_id', $id)
            ->where('id', $attachmentId)
            ->firstOrFail();

        $path = storage_path('app/public/' . $attachment->file_path);
        $originalName = $attachment->file_name;

        return response()->download($path, $originalName);
    }



    public function previewAttachment(int $edbId, int $attachmentId)
    {
        $attachment = Attachment::where('edb_id', $edbId)->findOrFail($attachmentId);


        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $mime = $disk->mimeType($attachment->file_path) ?? 'application/octet-stream';

        return $disk->response(
            $attachment->file_path,
            $attachment->file_name,
            ['Content-Type' => $mime]
        );
    }






}
