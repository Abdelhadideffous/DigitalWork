<?php


use App\Http\Controllers\ApiBridgeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentsProjetController;
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

// Route pour récupérer tous les utilisateurs
Route::get('users/search', [UserController::class, 'searchUsers']);



//Routes pour commentaire d'un projet
// Routes qui nécessitent une authentification

Route::post('/comments', [CommentsProjetController::class, 'store']);
Route::put('/comments/{id}', [CommentsProjetController::class, 'update']);
Route::delete('/comments/{id}', [CommentsProjetController::class, 'destroy']);
// Ajoutez d'autres routes protégées ici


// Routes publiques
Route::get('/projects/{projectId}/comments', [CommentsProjetController::class, 'index']);
Route::get('/comments/{id}', [CommentsProjetController::class, 'show']);



//route pour Task

Route::get('/tasks', [TaskController::class, 'index']);
Route::post('/tasks', [TaskController::class, 'store']);
Route::get('/tasks/{task}', [TaskController::class, 'show']);
Route::put('/tasks/{task}', [TaskController::class, 'update']);
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);


Route::get('/test-api', function () {
    return response()->json([
        'message' => 'Hello World!'
    ]);
});