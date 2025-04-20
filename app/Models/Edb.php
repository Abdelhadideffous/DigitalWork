<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Edb extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'objectif',
        'contrainte',
        'date_demande',
        'user_id',
        'priority_id'
    ];

    protected $guarded = ['status_id'];




    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function status()
    {
        return $this->belongsTo(Statuses::class);
    }

    public function priority()
    {
        return $this->belongsTo(Priority::class);
    }


    public function attachments()
    {
        return $this->hasMany(Attachment::class);
    }


}
