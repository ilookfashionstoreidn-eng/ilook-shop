<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\User;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatMessageController extends Controller
{
    /**
     * Get messages between current user and chat partner.
     * GET /api/chats/messages
     */
    public function getMessages(Request $request): JsonResponse
    {
        $user = auth()->user();
        $adminUser = User::where('role', 'admin')->first();

        if (!$adminUser) {
            return response()->json(['success' => false, 'message' => 'Admin user not found.'], 404);
        }

        if ($user->role === 'admin') {
            if ($request->has('user_id')) {
                $request->validate([
                    'user_id' => 'required|exists:users,id'
                ]);
                $partnerId = $request->input('user_id');
            } else {
                $partnerId = $user->id;
            }
        } else {
            $partnerId = $adminUser->id;
        }

        $messages = ChatMessage::with(['product'])
            ->where(function ($query) use ($user, $partnerId) {
                $query->where('sender_id', $user->id)
                      ->where('receiver_id', $partnerId);
            })
            ->orWhere(function ($query) use ($user, $partnerId) {
                $query->where('sender_id', $partnerId)
                      ->where('receiver_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'messages' => $messages
        ]);
    }

    /**
     * Send a new message.
     * POST /api/chats/messages
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $user = auth()->user();
        $adminUser = User::where('role', 'admin')->first();

        if (!$adminUser) {
            return response()->json(['success' => false, 'message' => 'Admin user not found.'], 404);
        }

        $rules = [
            'message' => 'required|string',
            'product_id' => 'nullable|exists:products,id',
        ];

        if ($user->role === 'admin') {
            $rules['receiver_id'] = 'nullable|exists:users,id';
        }

        $validated = $request->validate($rules);

        $senderId = $user->id;
        $receiverId = ($user->role === 'admin' && !empty($validated['receiver_id'])) ? $validated['receiver_id'] : $adminUser->id;

        $chatMessage = ChatMessage::create([
            'sender_id' => $senderId,
            'receiver_id' => $receiverId,
            'product_id' => $validated['product_id'] ?? null,
            'message' => $validated['message'],
            'is_read' => false,
        ]);

        return response()->json([
            'success' => true,
            'message' => $chatMessage->load('product')
        ]);
    }

    /**
     * Get unique users who have chatted with the admin.
     * GET /api/chats/users (Admin only)
     */
    public function getChatUsers(): JsonResponse
    {
        $adminId = auth()->id();

        // Subquery to get all users who exchanged messages with the admin
        $senderIds = ChatMessage::where('receiver_id', $adminId)->select('sender_id as user_id');
        $receiverIds = ChatMessage::where('sender_id', $adminId)->select('receiver_id as user_id');
        
        $userIds = $senderIds->union($receiverIds)->pluck('user_id');

        $users = User::whereIn('id', $userIds)
            ->where('id', '!=', $adminId)
            ->get()
            ->map(function ($user) use ($adminId) {
                // Get last message
                $lastMessage = ChatMessage::where(function ($q) use ($adminId, $user) {
                    $q->where('sender_id', $adminId)->where('receiver_id', $user->id);
                })->orWhere(function ($q) use ($adminId, $user) {
                    $q->where('sender_id', $user->id)->where('receiver_id', $adminId);
                })->latest()->first();

                // Get unread count from this user to admin
                $unreadCount = ChatMessage::where('sender_id', $user->id)
                    ->where('receiver_id', $adminId)
                    ->where('is_read', false)
                    ->count();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'last_message' => $lastMessage ? $lastMessage->message : '',
                    'last_message_time' => $lastMessage ? $lastMessage->created_at->toISOString() : null,
                    'unread_count' => $unreadCount,
                ];
            })
            ->sortByDesc('last_message_time')
            ->values();

        return response()->json([
            'success' => true,
            'users' => $users
        ]);
    }

    /**
     * Mark messages from a specific sender to current user as read.
     * POST /api/chats/read
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $user = auth()->user();
        $adminUser = User::where('role', 'admin')->first();

        if ($user->role === 'admin') {
            $request->validate([
                'sender_id' => 'required|exists:users,id'
            ]);
            $senderId = $request->input('sender_id');
        } else {
            $senderId = $adminUser ? $adminUser->id : null;
        }

        if ($senderId) {
            ChatMessage::where('sender_id', $senderId)
                ->where('receiver_id', $user->id)
                ->where('is_read', false)
                ->update(['is_read' => true]);
        }

        return response()->json([
            'success' => true
        ]);
    }
}
