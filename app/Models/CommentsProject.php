<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommentsProject extends Model
{
    use HasFactory;
    

    protected $fillable = [
        'content',
        'user_id',
        'project_id',
        'parent_id',
        'likes_count'
    ];

    protected $casts = [
        'parent_id' => 'integer',
        'likes_count' => 'integer'
    ];

    // Relation avec l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation avec le projet
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Relation avec le commentaire parent
    public function parent()
    {
        return $this->belongsTo(CommentsProject::class, 'parent_id');
    }

    // Relation avec les réponses (commentaires enfants)
    public function replies()
    {
        return $this->hasMany(CommentsProject::class, 'parent_id');
    }
    
    // Méthode pour incrémenter les likes
    public function incrementLikes()
    {
        $this->likes_count++;
        $this->save();
        return $this->likes_count;
    }
    
    // Méthode pour décrémenter les likes
    public function decrementLikes()
    {
        if ($this->likes_count > 0) {
            $this->likes_count--;
            $this->save();
        }
        return $this->likes_count;
    }
}