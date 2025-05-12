// Ajouter cette fonction à votre fichier api.ts

// API pour récupérer les membres d'un projet
export const getProjectMembers = async (projectId: number) => {
    try {
        const response = await fetch(`http://localhost:8000/api/projects/${projectId}/my-team`);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error(`Erreur lors de la récupération des membres du projet ${projectId}:`, error);
        throw error;
    }
};
