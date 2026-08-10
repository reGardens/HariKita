<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wedding;
use App\Models\Couple;
use Illuminate\Http\Request;

class CoupleApiController extends Controller
{
    public function show($slug)
    {
        if (str_starts_with($slug, 'demo-')) {
            return response()->json([
                'id' => 9999,
                'weddingSlug' => $slug,
                'groom' => [
                    'fullName' => 'Rita',
                    'nickname' => 'Rita',
                    'photo' => '/templates/assets/bride.webp',
                    'fatherName' => 'Capulet Father',
                    'motherName' => 'Capulet Mother',
                    'instagramUrl' => 'https://instagram.com',
                    'childOrder' => 'Putri Pertama',
                ],
                'bride' => [
                    'fullName' => 'Reza',
                    'nickname' => 'Reza',
                    'photo' => '/templates/assets/groom.webp',
                    'fatherName' => 'Montague Father',
                    'motherName' => 'Montague Mother',
                    'instagramUrl' => 'https://instagram.com',
                    'childOrder' => 'Putra Pertama',
                ],
                'musicUrl' => '',
                'createdAt' => now()->toIso8601String(),
                'updatedAt' => now()->toIso8601String(),
            ]);
        }

        $wedding = Wedding::where('slug', $slug)->firstOrFail();
        $couple = Couple::where('wedding_id', $wedding->id)->firstOrFail();

        return response()->json($this->formatCouple($couple, $wedding->slug));
    }

    public function store(Request $request, $slug)
    {
        $wedding = Wedding::where('slug', $slug)->firstOrFail();
        $couple = Couple::updateOrCreate(
            ['wedding_id' => $wedding->id],
            [
                'groom_full_name' => $request->input('groom.fullName', ''),
                'groom_nickname' => $request->input('groom.nickname', ''),
                'groom_photo' => $request->input('groom.photo', ''),
                'groom_father_name' => $request->input('groom.fatherName', ''),
                'groom_mother_name' => $request->input('groom.motherName', ''),
                'groom_instagram_url' => $request->input('groom.instagramUrl', ''),
                'groom_child_order' => $request->input('groom.childOrder', ''),
                'bride_full_name' => $request->input('bride.fullName', ''),
                'bride_nickname' => $request->input('bride.nickname', ''),
                'bride_photo' => $request->input('bride.photo', ''),
                'bride_father_name' => $request->input('bride.fatherName', ''),
                'bride_mother_name' => $request->input('bride.motherName', ''),
                'bride_instagram_url' => $request->input('bride.instagramUrl', ''),
                'bride_child_order' => $request->input('bride.childOrder', ''),
                'music_url' => $request->input('musicUrl', ''),
            ]
        );

        return response()->json($this->formatCouple($couple, $wedding->slug));
    }

    private function formatCouple(Couple $couple, $slug)
    {
        return [
            'id' => $couple->id,
            'weddingSlug' => $slug,
            'groom' => [
                'fullName' => $couple->groom_full_name,
                'nickname' => $couple->groom_nickname,
                'photo' => $couple->groom_photo,
                'fatherName' => $couple->groom_father_name,
                'motherName' => $couple->groom_mother_name,
                'instagramUrl' => $couple->groom_instagram_url,
                'childOrder' => $couple->groom_child_order,
            ],
            'bride' => [
                'fullName' => $couple->bride_full_name,
                'nickname' => $couple->bride_nickname,
                'photo' => $couple->bride_photo,
                'fatherName' => $couple->bride_father_name,
                'motherName' => $couple->bride_mother_name,
                'instagramUrl' => $couple->bride_instagram_url,
                'childOrder' => $couple->bride_child_order,
            ],
            'musicUrl' => $couple->music_url,
            'createdAt' => $couple->created_at ? $couple->created_at->toIso8601String() : null,
            'updatedAt' => $couple->updated_at ? $couple->updated_at->toIso8601String() : null,
        ];
    }
}
