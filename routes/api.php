<?php


use App\Http\Controllers\ApiBridgeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentsProjetController;
use App\Http\Controllers\EdbController;
use App\Http\Controllers\PriorityController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;






//route User

// Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::get('/users', [UserController::class, 'getAllUsers']);




//route login 

Route::post('/login', [AuthController::class, 'login']);

// Route de déconnexion - nécessite authentification
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');





// route priority
Route::get('/priority', [PriorityController::class, 'index']);
Route::get('/priorities', [PriorityController::class, 'getAllPriorities']);

// route statues
Route::get('/statuses', [StatusController::class, 'index']);




//route projects

Route::get('/projects', [ProjectController::class, 'index']);
Route::post('/projects', [ProjectController::class, 'store']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);
Route::put('/projects/{id}', [ProjectController::class, 'update']);
Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
Route::get('/projects/{id}/teams', [ProjectController::class, 'getProjectTeams']);
Route::patch('/edbs/{id}/annuler', [ProjectController::class, 'projetanuule']);
Route::patch('/edbs/{id}/teminer', [ProjectController::class, 'projetterminer']);
Route::get('projects/{id}/tasks', [ProjectController::class, 'getProjectTasks']);




// Route pour mettre à jour la progression d'un projet
Route::post('/projects/{id}/update-progress', [ProjectController::class, 'updateProgress']);

// Route pour annuler un projet (admin uniquement)
Route::post('/projects/{id}/cancel', [ProjectController::class, 'cancelProject']);

// Route pour mettre à jour tous les statuts de projets (peut être protégée par un middleware admin)
Route::get('/projects/update-all-statuses', [ProjectController::class, 'updateAllProjectsStatus']);


//route team 

// Routes pour les équipes
Route::get('/teams', [TeamController::class, 'index']);
Route::post('/teams', [TeamController::class, 'store']);
Route::get('/teams/{id}', [TeamController::class, 'show']);
Route::put('/teams/{id}', [TeamController::class, 'update']);
Route::delete('/teams/{id}', [TeamController::class, 'destroy']);

// Routes pour les membres d'équipes
Route::post('/teams/{teamId}/members', [TeamController::class, 'addMember']);
Route::delete('/teams/{teamId}/members/{userId}', [TeamController::class, 'removeMember']);
// Route pour récupérer les projets disponibles (non associés à une équipe)
Route::get('/available-projects', [TeamController::class, 'getAvailableProjects']);

// Route pour récupérer tous les utilisateurs
Route::get('users/search', [UserController::class, 'searchUsers']);



//Routes pour commentaire d'un projet

Route::get('/projects/{projectId}/comments', [CommentsProjetController::class, 'index']);
Route::post('/comments', [CommentsProjetController::class, 'store']);
Route::get('/comments/{id}', [CommentsProjetController::class, 'show']);
Route::put('/comments/{id}', [CommentsProjetController::class, 'update']);
Route::delete('/comments/{id}', [CommentsProjetController::class, 'destroy']);
Route::post('/comments/{id}/like', [CommentsProjetController::class, 'like']);
Route::post('/comments/{id}/unlike', [CommentsProjetController::class, 'unlike']);



//route pour Task

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::get('/tasks/{task}', [TaskController::class, 'show']);
Route::put('/tasks/{task}', [TaskController::class, 'update']);
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);


// route pour edb 

Route::get('/edbs', [EdbController::class, 'index']);

// Route alternative pour obtenir tous les Edbs (getAllEdbs)
Route::get('/all-edbs', [EdbController::class, 'getAllEdbs']);

// Route pour créer un nouveau Edb
Route::post('/edbs', [EdbController::class, 'store']);

// Route pour afficher un Edb spécifique
Route::get('/edbs/{id}', [EdbController::class, 'show']);

// Route pour mettre à jour un Edb
Route::put('/edbs/{id}', [EdbController::class, 'update']);

// Route pour supprimer un Edb
Route::delete('/edbs/{id}', [EdbController::class, 'destroy']);

// Routes pour approuver/rejeter un Edb
Route::patch('/edbs/{id}/approve', [EdbController::class, 'approveEdb']);
Route::patch('/edbs/{id}/reject', [EdbController::class, 'rejectEdb']);
Route::post('/edbs/{id}/attachments', [EDBController::class, 'uploadMultipleAttachments']);
Route::get('/edbs/{id}/attachments', [EdbController::class, 'getAttachments']);
Route::delete('/edbs/{id}/attachments/{attachmentId}', [EdbController::class, 'deleteAttachment']);
// Route::get('/edbs/{id}/export-pdf', [EdbController::class, 'exportPdf']);






Route::get('/test-api', function () {
    return response()->json([
        'message' => 'Hello World!'
    ]);
});