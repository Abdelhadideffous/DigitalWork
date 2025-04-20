<?php

// app/Models/Attachment.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
    protected $fillable = [
        'edb_id',
        'file_path',
        'file_name',
    ];


    public function edb()
    {
        return $this->belongsTo(EDB::class);
    }
}
