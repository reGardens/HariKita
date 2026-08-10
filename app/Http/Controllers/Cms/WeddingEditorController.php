<?php

namespace App\Http\Controllers\Cms;

use App\Http\Controllers\Controller;
use App\Models\Wedding;
use App\Models\CustomTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WeddingEditorController extends Controller
{
    /**
     * Get the wedding for the authenticated user by slug.
     * Ensures user owns the wedding (or is super-admin).
     */
    private function getWedding(string $slug): Wedding
    {
        $user = Auth::user();
        $query = Wedding::with(['couple', 'events', 'guests', 'rsvps', 'media'])
            ->where('slug', $slug);

        if (!$user->hasRole('super-admin')) {
            $query->where('user_id', $user->id);
        }

        return $query->firstOrFail();
    }

    /**
     * Tema & Template page
     */
    public function tema(string $slug): Response
    {
        $wedding = $this->getWedding($slug);
        $templates = CustomTemplate::where('is_custom', true)->get()->map(fn($t) => [
            'id' => $t->slug,
            'name' => $t->name,
            'description' => $t->description,
            'thumbnail_url' => $t->thumbnail_url,
        ]);

        return Inertia::render('Cms/Undangan/TemaPilihan', [
            'wedding' => $wedding,
            'templates' => $templates,
            'slug' => $slug,
        ]);
    }

    /**
     * RSVP Online page
     */
    public function rsvp(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/RsvpSection', [
            'wedding' => $wedding,
            'rsvps' => $wedding->rsvps ?? [],
            'slug' => $slug,
        ]);
    }

    /**
     * Informasi Acara page
     */
    public function acara(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/InfoAcara', [
            'wedding' => $wedding,
            'events' => $wedding->events ?? [],
            'slug' => $slug,
        ]);
    }

    /**
     * Love Story page
     */
    public function loveStory(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/LoveStory', [
            'wedding' => $wedding,
            'slug' => $slug,
        ]);
    }

    /**
     * Manajemen Tamu page
     */
    public function tamu(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/ManajemenTamu', [
            'wedding' => $wedding,
            'guests' => $wedding->guests ?? [],
            'slug' => $slug,
        ]);
    }

    /**
     * Amplop Digital page
     */
    public function amplop(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/AmplopDigital', [
            'wedding' => $wedding,
            'slug' => $slug,
        ]);
    }

    /**
     * Galeri Foto page
     */
    public function galeri(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/Galeri', [
            'wedding' => $wedding,
            'media' => $wedding->media ?? [],
            'slug' => $slug,
        ]);
    }

    /**
     * Countdown page
     */
    public function countdown(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/Countdown', [
            'wedding' => $wedding,
            'slug' => $slug,
        ]);
    }

    /**
     * QR Check-in page
     */
    public function qrCheckin(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/QrCheckin', [
            'wedding' => $wedding,
            'slug' => $slug,
        ]);
    }

    /**
     * Live Streaming page
     */
    public function streaming(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/LiveStreaming', [
            'wedding' => $wedding,
            'slug' => $slug,
        ]);
    }

    /**
     * Ucapan & Doa page
     */
    public function ucapan(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/UcapanDoa', [
            'wedding' => $wedding,
            'wishes' => $wedding->wishes ?? [],
            'slug' => $slug,
        ]);
    }

    /**
     * Wishlist page
     */
    public function wishlist(string $slug): Response
    {
        $wedding = $this->getWedding($slug);

        return Inertia::render('Cms/Undangan/Wishlist', [
            'wedding' => $wedding,
            'slug' => $slug,
        ]);
    }
}
