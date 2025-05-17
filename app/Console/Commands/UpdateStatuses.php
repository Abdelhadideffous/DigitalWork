<?php

namespace App\Console\Commands;

use App\Services\ProjectStatusUpdater;
use App\Services\TasktStatusUpdater;
use Illuminate\Console\Command;

class UpdateStatuses extends Command
{
    protected $signature = 'statuses:update';
    protected $description = 'Met à jour automatiquement le statut des projets et des tâches';

    public function handle(): int
    {
        ProjectStatusUpdater::update();
        TasktStatusUpdater::update();
        $this->info('Statuts mis à jour');
        return self::SUCCESS;
    }
}
