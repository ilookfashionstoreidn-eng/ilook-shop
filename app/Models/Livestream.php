<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Livestream extends Model
{
    protected $fillable = [
        'title',
        'tiktok_url',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['embed_url'];

    /**
     * Get the embeddable TikTok URL.
     */
    public function getEmbedUrlAttribute(): string
    {
        $url = $this->tiktok_url;

        // 1. YouTube: e.g. https://www.youtube.com/watch?v=abc or https://youtu.be/abc
        if (preg_match('/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i', $url, $matches)) {
            return "https://www.youtube.com/embed/" . $matches[1];
        }
        // YouTube channel live stream format: e.g. youtube.com/embed/live_stream?channel=UC...
        if (preg_match('/youtube\.com\/embed\/live_stream\?channel=([a-zA-Z0-9_-]+)/i', $url, $matches)) {
            return $url;
        }

        // 2. Twitch: e.g. https://www.twitch.tv/username
        if (preg_match('/twitch\.tv\/([a-zA-Z0-9_]+)/i', $url, $matches)) {
            $host = request()->getHost();
            return "https://player.twitch.tv/?channel=" . $matches[1] . "&parent=" . $host . "&autoplay=true";
        }

        // 3. TikTok Live: e.g. https://www.tiktok.com/@username/live
        if (preg_match('/tiktok\.com\/@([a-zA-Z0-9_\.]+)\/live/i', $url, $matches)) {
            return "https://www.tiktok.com/embed/v2/live?author=@" . $matches[1];
        }

        // TikTok Live embed format: e.g. https://www.tiktok.com/embed/v2/live?author=@username
        if (preg_match('/tiktok\.com\/embed\/v2\/live\?author=@?([a-zA-Z0-9_\.]+)/i', $url, $matches)) {
            return "https://www.tiktok.com/embed/v2/live?author=@" . $matches[1];
        }

        // 4. TikTok Video: e.g. https://www.tiktok.com/@username/video/1234567890
        if (preg_match('/tiktok\.com\/@([a-zA-Z0-9_\.]+)\/video\/(\d+)/i', $url, $matches)) {
            return "https://www.tiktok.com/embed/" . $matches[2];
        }

        // TikTok Video embed format: e.g. https://www.tiktok.com/embed/1234567890
        if (preg_match('/tiktok\.com\/embed\/(\d+)/i', $url, $matches)) {
            return "https://www.tiktok.com/embed/" . $matches[1];
        }

        return $url;
    }
}
