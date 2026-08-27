<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\SpaController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Root redirect to Dashboard
Route::get('/', function () {
    return redirect('/cms/dashboard');
});

// Guest Authentication Routes (using the template's Inertia authentication system)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [AuthenticatedSessionController::class, 'store']);
});

// Authenticated Admin Routes (super-admin only)
Route::middleware(['auth', 'role:super-admin'])->group(function () {

    // Templates CRUD (Admin Write Actions)
    Route::prefix('cms/templates')->group(function () {
        Route::get('/create', [\App\Http\Controllers\Admin\TemplateController::class, 'create'])->name('cms.templates.create');
        Route::post('/', [\App\Http\Controllers\Admin\TemplateController::class, 'store'])->name('cms.templates.store');
        Route::post('/quick-create', [\App\Http\Controllers\Admin\TemplateController::class, 'quickCreate'])->name('cms.templates.quick-create');
        Route::get('/{template}/developer', [\App\Http\Controllers\Admin\TemplateController::class, 'developerStatus'])->name('cms.templates.developer-status');
        Route::put('/{template}/release', [\App\Http\Controllers\Admin\TemplateController::class, 'release'])->name('cms.templates.release');
        Route::put('/{template}/deactivate', [\App\Http\Controllers\Admin\TemplateController::class, 'deactivate'])->name('cms.templates.deactivate');
        Route::get('/{template}/edit', [\App\Http\Controllers\Admin\TemplateController::class, 'edit'])->name('cms.templates.edit');
        Route::put('/{template}', [\App\Http\Controllers\Admin\TemplateController::class, 'update'])->name('cms.templates.update');
        Route::delete('/{template}', [\App\Http\Controllers\Admin\TemplateController::class, 'destroy'])->name('cms.templates.destroy');
    });

    // Roles CRUD (super-admin only for write operations)
    Route::prefix('cms/roles')->group(function () {
        Route::get('/create', [\App\Http\Controllers\RoleController::class, 'create'])->name('cms.roles.create');
        Route::post('/', [\App\Http\Controllers\RoleController::class, 'store'])->name('cms.roles.store');
        Route::get('/{role}/edit', [\App\Http\Controllers\RoleController::class, 'edit'])->name('cms.roles.edit');
        Route::put('/{role}', [\App\Http\Controllers\RoleController::class, 'update'])->name('cms.roles.update');
        Route::delete('/{role}', [\App\Http\Controllers\RoleController::class, 'destroy'])->name('cms.roles.destroy');
    });

    // Users CRUD (super-admin only for write operations)
    Route::prefix('cms/users')->group(function () {
        Route::get('/create', [\App\Http\Controllers\UserController::class, 'create'])->name('cms.users.create');
        Route::post('/', [\App\Http\Controllers\UserController::class, 'store'])->name('cms.users.store');
        Route::get('/{user}/edit', [\App\Http\Controllers\UserController::class, 'edit'])->name('cms.users.edit');
        Route::put('/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('cms.users.update');
        Route::delete('/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('cms.users.destroy');
    });
});

// Authenticated Admin Routes (super-admin AND admin)
Route::middleware(['auth', 'role:super-admin|admin'])->group(function () {
    // Roles - read only for admin
    Route::get('/cms/roles', [\App\Http\Controllers\RoleController::class, 'index'])->name('cms.roles.index');

    // Users - read only for admin
    Route::get('/cms/users', [\App\Http\Controllers\UserController::class, 'index'])->name('cms.users.index');

    // ACL (Access Control List) - both can manage
    Route::prefix('cms/acl')->group(function () {
        Route::get('/', [\App\Http\Controllers\AclController::class, 'index'])->name('cms.acl.index');
        Route::post('/{user}/toggle', [\App\Http\Controllers\AclController::class, 'toggle'])->name('cms.acl.toggle');
    });
});

// Authenticated General Routes (Accessible by all roles)
Route::middleware('auth')->group(function () {
    // Dashboard (accessible to all — data is filtered server-side by role)
    Route::get('/cms/dashboard', [\App\Http\Controllers\Admin\AdminDashboardController::class, 'index'])->name('cms.dashboard');
    Route::get('/cms/templates', function () {
        return redirect('/cms/dashboard');
    });

    // /cms root redirects to dashboard
    Route::get('/cms', function () {
        return redirect('/cms/dashboard');
    });

    // Wedding Editor Routes (Undangan Digital)
    Route::prefix('cms/{slug}/undangan')->group(function () {
        Route::get('/pesan-wa', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'pesanWa'])->name('cms.undangan.pesan-wa');
        Route::get('/tema', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'tema'])->name('cms.undangan.tema');
        Route::get('/rsvp', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'rsvp'])->name('cms.undangan.rsvp');
        Route::get('/acara', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'acara'])->name('cms.undangan.acara');
        Route::get('/love-story', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'loveStory'])->name('cms.undangan.love-story');
        Route::get('/tamu', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'tamu'])->name('cms.undangan.tamu');
        Route::get('/amplop', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'amplop'])->name('cms.undangan.amplop');
        Route::get('/galeri', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'galeri'])->name('cms.undangan.galeri');
        Route::get('/countdown', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'countdown'])->name('cms.undangan.countdown');
        Route::get('/qr-checkin', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'qrCheckin'])->name('cms.undangan.qr-checkin');
        Route::get('/streaming', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'streaming'])->name('cms.undangan.streaming');
        Route::get('/ucapan', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'ucapan'])->name('cms.undangan.ucapan');
        Route::get('/wishlist', [\App\Http\Controllers\Cms\WeddingEditorController::class, 'wishlist'])->name('cms.undangan.wishlist');
    });
});

// Logout + Public invitation SPA
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

// Public Invitation (SPA — only for displaying the final invitation)
Route::get('/wedding/{slug}', [SpaController::class, 'index'])->name('wedding.invitation');
