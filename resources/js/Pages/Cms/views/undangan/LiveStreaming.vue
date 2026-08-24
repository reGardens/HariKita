<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">🎥</span>
            <div>
                <h2 class="section-title">Live Streaming</h2>
                <p class="section-desc">
                    Siarkan acara pernikahanmu secara langsung
                </p>
            </div>
        </div>

        <div class="flex items-start justify-between gap-4">
            <div>
                <Label class="text-foreground font-semibold"
                    >Aktifkan Live Streaming</Label
                >
                <p class="text-xs text-muted-foreground mt-0.5">
                    Tampilkan tombol tonton live di undangan
                </p>
            </div>
            <button
                type="button"
                class="toggle-btn"
                :class="{ 'toggle-btn--on': form.enabled }"
                @click="form.enabled = !form.enabled"
            >
                <span
                    class="toggle-thumb"
                    :class="{ 'toggle-thumb--on': form.enabled }"
                ></span>
            </button>
        </div>

        <div class="field-group">
            <Label for="streamUrl">URL Live Streaming</Label>
            <Input
                id="streamUrl"
                v-model="form.url"
                placeholder="Contoh: https://youtube.com/live/..."
            />
            <span class="text-xs text-muted-foreground"
                >YouTube Live, Zoom, atau platform streaming lainnya</span
            >
        </div>

        <div class="field-group">
            <Label for="streamPlatform">Platform</Label>
            <Select
                v-model="form.platform"
                @update:model-value="(v) => (form.platform = v)"
            >
                <SelectTrigger>
                    <SelectValue placeholder="Pilih platform" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="youtube">▶️ YouTube Live</SelectItem>
                    <SelectItem value="zoom">🔵 Zoom Webinar</SelectItem>
                    <SelectItem value="instagram">📸 Instagram Live</SelectItem>
                    <SelectItem value="tiktok">🎵 TikTok Live</SelectItem>
                    <SelectItem value="other">🌐 Lainnya</SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="field-group">
            <Label for="streamStart">Mulai Siaran</Label>
            <Input
                id="streamStart"
                v-model="form.startAt"
                type="datetime-local"
            />
        </div>

        <div class="field-group">
            <Label for="streamMsg">Pesan Siaran</Label>
            <Textarea
                id="streamMsg"
                v-model="form.message"
                rows="2"
                placeholder="Bergabunglah dengan kami secara virtual dan saksikan momen bahagia kami!"
            />
        </div>

        <div class="save-bar">
            <Button :disabled="saving" @click="handleSave">
                <span v-if="saving">Menyimpan…</span>
                <span v-else>💾 Simpan Streaming</span>
            </Button>
            <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Input } from "@/Components/ui";
import { Label } from "@/Components/ui";
import { Button } from "@/Components/ui";
import { Textarea } from "@/Components/ui";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/Components/ui";
import { useAutoSavePreview } from "@/Composables/useAutoSavePreview";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);

const form = ref({
    enabled: false,
    url: "",
    platform: "youtube",
    startAt: "",
    message: "Bergabunglah dengan kami secara virtual!",
});

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

async function loadStreaming() {
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.get(`/api/wedding/${slug}/settings`);
        if (data.liveStreamUrl) {
            form.value.url = data.liveStreamUrl;
            form.value.enabled = true;
        }
        skipNextWatch();
    } catch (err) {
        console.error("Failed to load streaming", err);
    }
}

onMounted(loadStreaming);

async function handleSave() {
    const slug = activeSlug.value;
    if (!slug) return;
    saving.value = true;
    try {
        await axios.post(`/api/wedding/${slug}/settings`, {
            liveStreamUrl: form.value.enabled ? form.value.url : "",
        });
        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch (err) {
        console.error("Failed to save streaming", err);
        alert("Gagal menyimpan streaming. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}

const { skipNextWatch } = useAutoSavePreview(form, handleSave);
</script>

<style scoped>
.toggle-btn {
    @apply w-11 h-6 rounded-full bg-muted border-none cursor-pointer relative flex-shrink-0 transition-colors;
}
.toggle-btn--on {
    @apply bg-emerald-500;
}
.toggle-thumb {
    @apply absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform;
}
.toggle-thumb--on {
    @apply translate-x-5;
}
</style>
