<?php

namespace Database\Seeders;

use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {


        // Tableaux de titres et descriptions pour génération aléatoire
        $titles = [
            "Développement de la fonctionnalité d'authentification",
            "Création de la page d'accueil",
            "Optimisation de la base de données",
            "Tests unitaires du module de paiement",
            "Revue de code du sprint 3",
            "Intégration de l'API externe",
            "Déploiement sur l'environnement de staging",
            "Correction des bugs signalés",
            "Documentation technique",
            "Réunion de planification",
            "Migration des données vers le nouveau schéma",
            "Mise à jour des dépendances",
            "Implémentation du système de notifications"
        ];

        $descriptions = [
            "Il faut implémenter cette fonctionnalité en suivant les spécifications du document technique.",
            "Cette tâche requiert une attention particulière aux détails de l'interface utilisateur.",
            "Travailler en collaboration avec l'équipe backend pour assurer la compatibilité.",
            "Analyser les performances actuelles et proposer des améliorations.",
            "Suivre les meilleures pratiques de l'industrie pour cette implémentation.",
            "Documenter soigneusement toutes les étapes pour faciliter la maintenance future.",
            "Coordonner avec l'équipe DevOps pour un déploiement sans accroc.",
            "Résoudre les problèmes identifiés lors des tests utilisateurs.",
            "Priorité haute suite à la demande du client.",
            "Utiliser le framework Laravel pour l'implémentation."
        ];

        // Créer 10 exemples de tâches avec des dates aléatoires
        for ($i = 1; $i <= 10; $i++) {
            // Générer une date de début aléatoire entre 60 jours dans le passé et 60 jours dans le futur
            $startDate = Carbon::now()->subDays(60)->addDays(rand(0, 120));

            // Générer une date de fin qui est entre 1 et 30 jours après la date de début
            $endDate = (clone $startDate)->addDays(rand(1, 30));

            // Formatage au format Y-m-d
            $formattedStartDate = $startDate->format('Y-m-d');
            $formattedEndDate = $endDate->format('Y-m-d');

            Task::create([
                "id" => $i,
                "title" => $titles[array_rand($titles)],
                "description" => $descriptions[array_rand($descriptions)],
                "project_id" => rand(11, 21),
                "assigned_to" => rand(1, 3),
                "status_id" => rand(1, 4),
                "priority_id" => rand(1, 4),
                "start_date" => $formattedStartDate,
                "end_date" => $formattedEndDate,
            ]);
        }
    }
}