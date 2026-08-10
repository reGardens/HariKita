<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $wedding = null;

        if ($user && !$user->hasRole('super-admin')) {
            $wedding = \App\Models\Wedding::where('user_id', $user->id)->first(['id', 'slug', 'label']);
            if ($wedding) {
                $weddingData = [
                    'couple' => $wedding->couple()->exists(),
                    'events' => $wedding->events()->count() > 0,
                    'guests' => $wedding->guests()->count() > 0,
                    'media' => $wedding->media()->count() > 0,
                    'settings' => \App\Models\Setting::where('wedding_id', $wedding->id)->exists(),
                ];
            }
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->getRoleNames(),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                ] : null,
            ],
            'wedding' => $wedding ? [
                'slug' => $wedding->slug,
                'label' => $wedding->label,
            ] : null,
            'weddingData' => $weddingData ?? null,
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
