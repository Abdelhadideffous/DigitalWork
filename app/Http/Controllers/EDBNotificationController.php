<?php

namespace App\Http\Controllers;

use App\Models\EDB;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class EDBNotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function edbSubmitted(EDB $edb)
    {
        $this->notificationService->edbSubmitted($edb);
    }

    public function edbApproved(EDB $edb)
    {
        $this->notificationService->edbApproved($edb);
    }

    public function edbRejected(EDB $edb)
    {
        $this->notificationService->edbRejected($edb);
    }
} 