<?php


use App\Http\Controllers\ApiBridgeController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentsProjetController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EdbController;
use App\Http\Controllers\PriorityController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\NotificationController;
use GuzzleHttp\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;




Route::middleware('auth:sanctum')->group(function () {

    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/edbs', [EdbController::class, 'index']);
    Route::get('/all-edbs', [EdbController::class, 'getAllEdbs']);
    Route::post('/edbs', [EdbController::class, 'store']);
    Route::get('/teams', [TeamController::class, 'index']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/users', [UserController::class, 'getAllUsers']);
    Route::post('/tasks/{taskId}/annuler', [TaskController::class, 'Taskanuule']);
    Route::post('/tasks/{taskId}/terminer', [TaskController::class, 'Taskterminer']);





});

Route::middleware('auth:sanctum')->get('/projects/managed', [ProjectController::class, 'getManagedProjects']);
Route::middleware('auth:sanctum')->get('/projects/{id}/members', [ProjectController::class, 'getProjectMembers']);





//route User

// Route::get('/users', [UserController::class, 'index']);
Route::post('/users', [UserController::class, 'store']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

//route login 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// route priority
Route::get('/priority', [PriorityController::class, 'index']);
Route::get('/priorities', [PriorityController::class, 'getAllPriorities']);

// route statues
Route::get('/statuses', [StatusController::class, 'index']);
Route::get('/statusesprojetetask', [StatusController::class, 'getStatusProjetetTask']);

//route projects
Route::post('/projects', [ProjectController::class, 'store']);
Route::get('/projects/{id}', [ProjectController::class, 'show']);
Route::put('/projects/{id}', [ProjectController::class, 'update']);
Route::delete('/projects/{id}', [ProjectController::class, 'destroy']);
Route::get('/projects/{id}/teams', [ProjectController::class, 'getProjectTeams']);
Route::post('/projects/{id}/cancel', [ProjectController::class, 'projetanuule']); //Annuler Le projet
Route::post('/projects/{id}/terminer', [ProjectController::class, 'projetterminer']); //terminer Le projet
Route::get('projects/{id}/tasks', [ProjectController::class, 'getProjectTasks']);
Route::post('/projects/{id}/update-progress', [ProjectController::class, 'updateProgress']);
// Route::post('/projects/{id}/cancel', [ProjectController::class, 'cancelProject']);
Route::get('/projects/update-all-statuses', [ProjectController::class, 'updateAllProjectsStatus']);
Route::get('/projects/filter', [ProjectController::class, 'filterProjects']);



//route team 
Route::post('/teams', [TeamController::class, 'store']);
Route::get('/teams/{id}', [TeamController::class, 'show']);
Route::put('/teams/{id}', [TeamController::class, 'update']);
Route::delete('/teams/{id}', [TeamController::class, 'destroy']);
Route::post('/teams/{teamId}/members', [TeamController::class, 'addMember']);
Route::delete('/teams/{teamId}/members/{userId}', [TeamController::class, 'removeMember']);
Route::get('/available-projects', [TeamController::class, 'getAvailableProjects']);
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
// Route::get('/tasks', [TaskController::class, 'index']);
// Route::post('/tasks', [TaskController::class, 'store']);
Route::get('/tasks/{task}', [TaskController::class, 'show']);
Route::put('/tasks/{task}', [TaskController::class, 'update']);
Route::delete('/tasks/{task}', [TaskController::class, 'destroy']);
// Route::post('/tasks/{taskId}/annuler', [TaskController::class, 'Taskanuule']);
// Route::post('/tasks/{taskId}/terminer', [TaskController::class, 'Taskterminer']);
Route::get('/tasks-UpcomingTasks', [TaskController::class, 'getUpcomingTasks']);
Route::post('/tasks/group', [TaskController::class, 'storeTaskGroupWithDependencies']);
Route::post('/tasks/{id}/start', [TaskController::class, 'startTask']);



//route subtask
Route::get('/tasks/{taskId}/subtasks', [SubtaskController::class, 'index']);
Route::post('/tasks/{taskId}/subtasks', [SubtaskController::class, 'store']);
Route::get('/subtasks/{id}', [SubtaskController::class, 'show']);
Route::put('/subtasks/{id}', [SubtaskController::class, 'update']);
Route::delete('/subtasks/{id}', [SubtaskController::class, 'destroy']);
Route::patch('/subtasks/{id}/cancel', [SubtaskController::class, 'cancelSubtask']);
Route::post('/subtasks/{id}/complete', [SubtaskController::class, 'completeSubtask']);


// route pour edb 

Route::get('/edbs/{id}', [EdbController::class, 'show']);
Route::put('/edbs/{id}', [EdbController::class, 'update']);
Route::delete('/edbs/{id}', [EdbController::class, 'destroy']);
Route::patch('/edbs/{id}/approve', [EdbController::class, 'approveEdb']);
Route::patch('/edbs/{id}/reject', [EdbController::class, 'rejectEdb']);
Route::post('/edbs/{id}/attachments', [EDBController::class, 'uploadMultipleAttachments']);
Route::get('/edbs/{id}/attachments', [EdbController::class, 'getAttachments']);
Route::delete('/edbs/{id}/attachments/{attachmentId}', [EdbController::class, 'deleteAttachment']);
// Route::get('/edbs/{id}/export-pdf', [EdbController::class, 'exportPdf']);

Route::get('edbstatus', [EdbController::class, 'getEdbStatus']);



// routes/api.php
Route::post('/tasks/{id}/calculate-progress', [TaskController::class, 'calculateProgress']);
Route::post('/projects/{id}/calculate-progress', [ProjectController::class, 'calculateProjectProgress']);



Route::get('/dashboard/performance-summary', [DashboardController::class, 'getPerformanceSummary']);



Route::get('/test-api', function () {
    return response()->json([
        'message' => 'Hello World!'
    ]);
});

// Notification routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications', [NotificationController::class, 'destroyAll']);
});


Route::prefix('edbs/{edb}')->group(function () {
    // …tes routes existantes

    Route::get('attachments/{attachment}', [EdbController::class, 'previewAttachment']);
    Route::get('attachments/{attachment}/download', [EdbController::class, 'downloadAttachment']);
});
