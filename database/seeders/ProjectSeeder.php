<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('projects')->insert([
            [
                'title' => 'Intranet RH',
                'description' => 'Développement d’un portail pour la gestion des ressources humaines.',
                'start_date' => '2025-04-01',
                'end_date' => '2025-06-01',
                'priority_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'CRM Client',
                'description' => 'Mise en place d’un système de gestion de la relation client.',
                'start_date' => '2025-03-15',
                'end_date' => '2025-05-30',
                'priority_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Refonte site web',
                'description' => 'Modernisation de l’interface du site web principal.',
                'start_date' => '2025-04-10',
                'end_date' => '2025-07-10',
                'priority_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Application mobile',
                'description' => 'Développement d’une app mobile pour les utilisateurs.',
                'start_date' => '2025-04-05',
                'end_date' => '2025-08-01',
                'priority_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Automatisation des rapports',
                'description' => 'Création de scripts pour générer des rapports automatiques.',
                'start_date' => '2025-04-02',
                'end_date' => '2025-04-20',
                'priority_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Plateforme e-learning',
                'description' => 'Plateforme interne pour la formation des employés.',
                'start_date' => '2025-03-25',
                'end_date' => '2025-06-25',
                'priority_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Support IT',
                'description' => 'Amélioration du système de tickets pour le support technique.',
                'start_date' => '2025-04-01',
                'end_date' => '2025-05-01',
                'priority_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Gestion des stocks',
                'description' => 'Système de suivi des stocks et alertes.',
                'start_date' => '2025-04-12',
                'end_date' => '2025-06-12',
                'priority_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Portail fournisseurs',
                'description' => 'Création d’un espace dédié aux fournisseurs.',
                'start_date' => '2025-04-08',
                'end_date' => '2025-07-08',
                'priority_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Sécurité réseau',
                'description' => 'Mise en place d’un système de monitoring de la sécurité.',
                'start_date' => '2025-04-01',
                'end_date' => '2025-04-30',
                'priority_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Archivage numérique',
                'description' => 'Digitalisation des archives physiques.',
                'start_date' => '2025-05-01',
                'end_date' => '2025-07-01',
                'priority_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Migration vers cloud',
                'description' => 'Déplacement des services internes vers une infrastructure cloud.',
                'start_date' => '2025-04-20',
                'end_date' => '2025-08-20',
                'priority_id' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Tableau de bord BI',
                'description' => 'Création de tableaux de bord pour les indicateurs clés.',
                'start_date' => '2025-04-15',
                'end_date' => '2025-06-15',
                'priority_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Intégration API Partenaires',
                'description' => 'Connexion avec les systèmes des partenaires via API.',
                'start_date' => '2025-04-18',
                'end_date' => '2025-07-18',
                'priority_id' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Portail interne RH',
                'description' => 'Nouvel outil de communication RH interne.',
                'start_date' => '2025-04-22',
                'end_date' => '2025-07-22',
                'priority_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]
        );
        
    }
}

