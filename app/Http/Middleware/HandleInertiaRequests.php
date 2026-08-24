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

        if ($user) {
            if ($user->hasRole('super-admin')) {
                // For super-admin, try to get wedding from URL slug
                $slug = $request->route('slug');
                if ($slug) {
                    $wedding = \App\Models\Wedding::where('slug', $slug)->first(['id', 'slug', 'label']);
                }
            } else {
                $wedding = \App\Models\Wedding::where('user_id', $user->id)->first(['id', 'slug', 'label']);
            }

            if ($wedding) {
                $couple = $wedding->couple;
                $setting = \App\Models\Setting::where('wedding_id', $wedding->id)->first();

                $weddingData = [
                    'couple' => (bool) ($couple && (
                        !empty($couple->groom_full_name) || !empty($couple->bride_full_name)
                    )),
                    'events' => $wedding->events()->count() > 0,
                    'guests' => $wedding->guests()->count() > 0,
                    'media' => $wedding->media()->count() > 0,
                    'countdown' => (bool) ($setting && !empty($setting->countdown_datetime)),
                    'amplop' => (bool) ($setting && (
                        !empty($setting->amplop_accounts) || !empty($setting->amplop_addresses)
                    )),
                    'streaming' => (bool) ($setting && !empty($setting->live_stream_url)),
                    'loveStory' => (bool) ($setting && !empty($setting->love_story)),
                    'wishlist' => (bool) ($setting && !empty($setting->wishlist_items)),
                    'settings' => (bool) ($setting && $setting->template_id && $setting->template_id !== 'batik-elegance'),
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
