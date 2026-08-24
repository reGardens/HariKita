<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">📖</span>
            <div>
                <h2 class="section-title">Love Story & Timeline</h2>
                <p class="section-desc">Ceritakan perjalanan cinta kalian</p>
            </div>
        </div>

        <div
            v-for="(item, idx) in form.timeline"
            :key="idx"
            class="story-block"
        >
            <div class="story-block-header">
                <Label class="text-foreground font-semibold"
                    >Momen {{ idx + 1 }}</Label
                >
                <Button
                    v-if="form.timeline.length > 1"
                    variant="ghost"
                    size="sm"
                    class="text-destructive hover:text-destructive/80 h-7 px-2"
                    @click="remove(idx)"
                >
                    ✕ Hapus
                </Button>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="field-group">
                    <Label>Tanggal / Tahun</Label>
                    <Input
                        v-model="item.date"
                        placeholder="Contoh: 14 Februari 2022"
                    />
                </div>
                <div class="field-group">
                    <Label>Emoji Momen</Label>
                    <Input
                        v-model="item.emoji"
                        maxlength="4"
                        placeholder="💕"
                        class="text-xl"
                    />
                </div>
            </div>

            <div class="field-group">
                <Label>Judul Momen</Label>
                <Input
                    v-model="item.title"
                    placeholder="Judul momen, misal: Pertama Bertemu"
                />
            </div>

            <div class="field-group">
                <Label>Cerita</Label>
                <Textarea
                    v-model="item.story"
                    rows="2"
                    placeholder="Ceritakan momen ini secara singkat..."
                />
            </div>
        </div>

        <Button
            variant="outline"
            class="w-full border-dashed border-2 hover:border-pink-500 hover:text-pink-600"
            @click="add"
        >
            + Tambah Momen
        </Button>

        <div class="save-bar">
            <Button :disabled="saving" @click="handleSave">
                <span v-if="saving">Menyimpan…</span>
                <span v-else>💾 Simpan Love Story</span>
            </Button>
            <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Input } from "@/Components/ui";
import { Label } from "@/Components/ui";
import { Button } from "@/Components/ui";
import { Textarea } from "@/Components/ui";
import { useAutoSavePreview } from "@/Composables/useAutoSavePreview";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

const emptyMoment = () => ({ date: "", emoji: "💕", title: "", story: "" });

const form = ref({
    timeline: [emptyMoment(), { ...emptyMoment(), emoji: "💍" }],
});

async function loadLoveStory() {
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.get(`/api/wedding/${slug}/settings`);
        if (Array.isArray(data.loveStory) && data.loveStory.length > 0) {
            form.value.timeline = data.loveStory.map((item) => ({
                date: item.date || "",
                emoji: item.emoji || "💕",
                title: item.title || "",
                story: item.story || "",
            }));
            skipNextWatch();
        }
    } catch (err) {
        console.error("Failed to load love story", err);
    }
}

onMounted(loadLoveStory);

function add() {
    form.value.timeline.push(emptyMoment());
}

function remove(idx) {
    form.value.timeline.splice(idx, 1);
}

async function handleSave() {
    const slug = activeSlug.value;
    if (!slug) return;
    saving.value = true;
    try {
        await axios.post(`/api/wedding/${slug}/settings`, {
            loveStory: form.value.timeline,
        });
        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch (err) {
        console.error("Failed to save love story", err);
        alert("Gagal menyimpan love story. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}

const { skipNextWatch } = useAutoSavePreview(form, handleSave);
</script>

<style scoped>
.story-block {
    @apply border border-border rounded-xl p-4 flex flex-col gap-3 bg-card;
}
.story-block-header {
    @apply flex items-center justify-between;
}
</style>
