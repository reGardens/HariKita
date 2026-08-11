<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">🖼️</span>
                <div>
                    <h2 class="section-title">Galeri Foto & Video</h2>
                    <p class="section-desc">
                        Upload foto prewedding dan dokumentasi pernikahan
                    </p>
                </div>
            </div>

            <div class="field-group">
                <Label>Upload Foto</Label>
                <div
                    class="upload-area"
                    @dragover.prevent
                    @drop.prevent="handleDrop"
                >
                    <input
                        ref="fileInput"
                        type="file"
                        multiple
                        accept="image/*"
                        class="hidden-input"
                        @change="handleFileChange"
                    />
                    <Button variant="outline" @click="$refs.fileInput.click()">
                        📸 Pilih Foto
                    </Button>
                    <p
                        class="text-xs text-muted-foreground"
                        style="margin-top: 0.5rem"
                    >
                        Atau seret dan lepas file di sini · JPG, PNG, WEBP ·
                        Maks 5MB
                    </p>
                </div>
            </div>

            <div v-if="form.photos.length" class="photo-grid">
                <div
                    v-for="(photo, i) in form.photos"
                    :key="i"
                    class="photo-thumb"
                >
                    <img :src="photo.url" :alt="photo.name" class="photo-img" />
                    <Button
                        variant="ghost"
                        size="icon"
                        class="photo-remove text-white"
                        @click="removePhoto(i)"
                    >
                        ✕
                    </Button>
                </div>
            </div>

            <div class="field-group">
                <Label>Link Video (YouTube / Google Drive)</Label>
                <Input
                    v-model="form.videoUrl"
                    placeholder="https://youtube.com/embed/..."
                />
                <p class="text-xs text-muted-foreground">
                    Gunakan link embed YouTube untuk video prewedding
                </p>
            </div>

            <div class="field-group">
                <div class="toggle-row">
                    <div>
                        <Label>Izinkan Tamu Upload Foto</Label>
                        <p class="text-xs text-muted-foreground">
                            Tamu bisa mengirimkan foto saat acara
                        </p>
                    </div>
                    <button
                        type="button"
                        class="toggle-btn"
                        :class="{ 'toggle-btn--on': form.allowGuestUpload }"
                        @click="form.allowGuestUpload = !form.allowGuestUpload"
                    >
                        <span
                            class="toggle-thumb"
                            :class="{
                                'toggle-thumb--on': form.allowGuestUpload,
                            }"
                        ></span>
                    </button>
                </div>
            </div>

            <div class="save-bar">
                <Button :disabled="saving" @click="handleSave">
                    <span v-if="saving">Menyimpan…</span>
                    <span v-else>💾 Simpan Galeri</span>
                </Button>
                <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
            </div>
        </div>

        <!-- Preview -->
        <div class="section-preview">
            <div class="preview-header">
                <span class="preview-badge">Live Preview</span>
                <span class="preview-tmpl-name">Galeri</span>
            </div>
            <div
                class="preview-body"
                style="background: linear-gradient(135deg, #f0f9ff, #e0f2fe)"
            >
                <div
                    class="preview-content"
                    style="font-family: &quot;Playfair Display&quot;, serif"
                >
                    <div class="preview-couple" style="color: #0c4a6e">
                        Galeri Foto
                    </div>
                    <div
                        class="preview-divider"
                        style="background: #0284c7"
                    ></div>
                    <div class="preview-gallery-grid">
                        <template v-if="form.photos.length">
                            <div
                                v-for="(photo, i) in form.photos.slice(0, 6)"
                                :key="i"
                                class="preview-gallery-thumb"
                            >
                                <img
                                    :src="photo.url"
                                    class="preview-gallery-img"
                                />
                            </div>
                        </template>
                        <template v-else>
                            <div
                                v-for="n in 6"
                                :key="n"
                                class="preview-gallery-thumb"
                            >
                                <span style="font-size: 1.5rem">{{
                                    ["📷", "🌸", "💒", "💕", "🌹", "✨"][n - 1]
                                }}</span>
                            </div>
                        </template>
                    </div>
                    <div
                        v-if="form.videoUrl"
                        class="preview-stream-box"
                        style="
                            margin-top: 0.75rem;
                            aspect-ratio: 16/9;
                            width: 100%;
                        "
                    >
                        🎬
                    </div>
                    <div
                        v-if="form.allowGuestUpload"
                        style="
                            font-size: 0.75rem;
                            color: #0284c7;
                            font-weight: 500;
                            margin-top: 0.5rem;
                        "
                    >
                        📤 Tamu dapat upload foto
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "vuex";
import { Button, Input, Label } from "@/Components/ui";
import "./section.css";

const store = useStore();

const saving = ref(false);
const saved = ref(false);
const fileInput = ref(null);

const form = ref({
    photos: [],
    videoUrl: "",
    allowGuestUpload: false,
});

function handleFileChange(e) {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) return;
        form.value.photos.push({
            url: URL.createObjectURL(file),
            name: file.name,
            file,
        });
    });
}

function handleDrop(e) {
    const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/"),
    );
    files.forEach((file) => {
        form.value.photos.push({
            url: URL.createObjectURL(file),
            name: file.name,
            file,
        });
    });
}

function removePhoto(i) {
    URL.revokeObjectURL(form.value.photos[i].url);
    form.value.photos.splice(i, 1);
}

async function handleSave() {
    saving.value = true;
    await new Promise((r) => setTimeout(r, 800));
    saving.value = false;
    saved.value = true;
    store.commit("wedding/BUMP_PREVIEW");
    setTimeout(() => {
        saved.value = false;
    }, 2500);
}
</script>

<style scoped>
.upload-area {
    border: 2px dashed var(--border, #d1d5db);
    border-radius: 0.75rem;
    padding: 1.5rem;
    text-align: center;
    background: var(--card, #f9fafb);
}
.dark .upload-area {
    background: hsl(240 10% 12%);
    border-color: hsl(240 5% 25%);
}
.upload-btn {
    background: #10b981;
    color: white;
    border: none;
    border-radius: 0.5rem;
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
}
.upload-btn:hover {
    background: #059669;
}
.hidden-input {
    display: none;
}
.photo-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
}
.photo-thumb {
    position: relative;
    aspect-ratio: 1;
    border-radius: 0.5rem;
    overflow: hidden;
}
.photo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.photo-remove {
    position: absolute;
    top: 0.25rem;
    right: 0.25rem;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.6);
    color: white;
    border: none;
    cursor: pointer;
    font-size: 0.65rem;
    display: flex;
    align-items: center;
    justify-content: center;
}
.toggle-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}
.toggle-btn {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: #d1d5db;
    border: none;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background 0.2s;
}
.dark .toggle-btn {
    background: hsl(240 5% 30%);
}
.toggle-btn--on {
    background: #10b981;
}
.dark .toggle-btn--on {
    background: #10b981;
}
.toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
}
.toggle-thumb--on {
    transform: translateX(20px);
}
</style>
