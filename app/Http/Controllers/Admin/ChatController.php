<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    /**
     * Show the admin chat dashboard.
     * GET /admin/chats
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Chats');
    }
}
