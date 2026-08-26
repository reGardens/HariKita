<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">🎨</span>
            <div>
                <h2 class="section-title">Tema Undangan</h2>
                <p class="section-desc">
                    Pilih tema dan preview akan berubah secara realtime
                </p>
            </div>
        </div>

        <div class="field-group">
            <Label>Pilih Tema</Label>
            <div class="space-y-3">
                <section class="border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden">
                    <button
                        type="button"
                        class="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold text-sm hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                        :aria-expanded="showReadyTemplates"
                        @click="showReadyTemplates = !showReadyTemplates"
                    >
                        <span class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs">Tema Siap Pakai</span>
                            <span class="text-xs font-normal text-emerald-700 dark:text-emerald-400">{{ readyTemplates.length }} tema</span>
                        </span>
                        <span>{{ showReadyTemplates ? '⌃' : '⌄' }}</span>
                    </button>
                    <div v-show="showReadyTemplates" class="p-3">
                        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            <button
                                v-for="tmpl in readyTemplates"
                                :key="tmpl.id"
                                type="button"
                                class="flex flex-col items-center gap-1.5 border-2 rounded-xl p-2 bg-card cursor-pointer transition-all hover:border-emerald-300 hover:-translate-y-0.5 group relative"
                                :class="form.templateId === tmpl.id ? 'border-emerald-500 ring-2 ring-emerald-500/25' : 'border-border'"
                                @click="selectTemplate(tmpl.id)"
                            >
                                <div class="w-full aspect-[3/4] rounded-lg relative overflow-hidden flex items-center justify-center" :style="{ background: getGradient(tmpl.id) }">
                                    <img v-if="tmpl.thumbnail_url" :src="tmpl.thumbnail_url" :alt="tmpl.name" class="absolute inset-0 w-full h-full object-cover rounded-lg" loading="lazy" @error="$event.target.style.display = 'none'" />
                                    <span class="text-2xl select-none relative">{{ getIcon(tmpl.id) }}</span>
                                    <a :href="`/wedding/demo-${tmpl.id}`" target="_blank" class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/80 whitespace-nowrap" @click.stop>👁 Lihat Demo</a>
                                </div>
                                <span class="text-[10px] text-center text-foreground font-medium leading-tight truncate w-full">{{ tmpl.name }}</span>
                            </button>
                        </div>
                    </div>
                </section>

                <section class="border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
                    <button
                        type="button"
                        class="w-full flex items-center justify-between gap-3 px-3 py-2.5 bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 font-semibold text-sm hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                        :aria-expanded="showOngoingTemplates"
                        @click="showOngoingTemplates = !showOngoingTemplates"
                    >
                        <span class="flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs">Tema Dalam Pengembangan</span>
                            <span class="text-xs font-normal text-amber-700 dark:text-amber-400">{{ ongoingTemplates.length }} tema</span>
                        </span>
                        <span>{{ showOngoingTemplates ? '⌃' : '⌄' }}</span>
                    </button>
                    <div v-show="showOngoingTemplates" class="p-3">
                        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                            <button
                                v-for="tmpl in ongoingTemplates"
                                :key="tmpl.id"
                                type="button"
                                class="flex flex-col items-center gap-1.5 border-2 rounded-xl p-2 bg-card cursor-pointer transition-all hover:border-emerald-300 hover:-translate-y-0.5 group relative"
                                :class="form.templateId === tmpl.id ? 'border-emerald-500 ring-2 ring-emerald-500/25' : 'border-border'"
                                @click="selectTemplate(tmpl.id)"
                            >
                                <div class="w-full aspect-[3/4] rounded-lg relative overflow-hidden flex items-center justify-center" :style="{ background: getGradient(tmpl.id) }">
                                    <img v-if="tmpl.thumbnail_url" :src="tmpl.thumbnail_url" :alt="tmpl.name" class="absolute inset-0 w-full h-full object-cover rounded-lg" loading="lazy" @error="$event.target.style.display = 'none'" />
                                    <span class="text-2xl select-none relative">{{ getIcon(tmpl.id) }}</span>
                                    <a :href="`/wedding/demo-${tmpl.id}`" target="_blank" class="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-black/80 whitespace-nowrap" @click.stop>👁 Lihat Demo</a>
                                    <button type="button" class="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-white bg-emerald-600/80 backdrop-blur-sm px-2.5 py-1 rounded-full border border-emerald-400/30 opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-emerald-500 whitespace-nowrap" @click.stop="moveToReady(tmpl)">✅ Siap Pakai</button>
                                </div>
                                <span class="text-[10px] text-center text-foreground font-medium leading-tight truncate w-full">{{ tmpl.name }}</span>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>

        <div class="field-group">
            <Label for="fontFamily">Font Huruf</Label>
            <Select
                :model-value="form.fontFamily"
                @update:model-value="(v) => (form.fontFamily = v)"
            >
                <SelectTrigger>
                    <SelectValue placeholder="Pilih font" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem v-for="f in fonts" :key="f" :value="f">
                        {{ f }}
                    </SelectItem>
                </SelectContent>
            </Select>
        </div>

        <div class="save-bar">
            <Button :disabled="saving" @click="handleSave">
                <span v-if="saving">Menyimpan…</span>
                <span v-else>💾 Simpan Tema</span>
            </Button>
            <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import Swal from "sweetalert2";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/Components/ui";
import { Button, Label } from "@/Components/ui";
import { useAutoSavePreview } from "@/Composables/useAutoSavePreview";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);

const templates = computed(() => store.getters["template/templates"]);
const readyTemplates = computed(() => templates.value.filter((t) => !t.is_custom));
const ongoingTemplates = computed(() => templates.value.filter((t) => t.is_custom));
const showReadyTemplates = ref(true);
const showOngoingTemplates = ref(true);

const fonts = [
    "Playfair Display",
    "Cormorant Garamond",
    "Great Vibes",
    "Cinzel",
    "EB Garamond",
    "Dancing Script",
    "Lora",
    "Merriweather",
    "Poppins",
    "Montserrat",
    "Raleway",
    "Open Sans",
    "Roboto Slab",
    "Josefin Sans",
    "Libre Baskerville",
    "Cormorant SC",
    "Alex Brush",
    "Satisfy",
    "Parisienne",
    "Sacramento",
    "Tangerine",
    "Allura",
    "DM Serif Display",
    "Italiana",
    "Bodoni Moda",
];

const form = ref({
    templateId: "batik-elegance",
    fontFamily: "Playfair Display",
});

const gradients = {
    "jawa-klasik": "linear-gradient(135deg,#FFF8F0,#FFE0BB)",
    "sunda-pasundan": "linear-gradient(135deg,#F0F7E8,#D8F0C0)",
    "bali-dewata": "linear-gradient(135deg,#FFF5F5,#FFD0D0)",
    "betawi-jakarta": "linear-gradient(135deg,#FFFBF0,#FFE8C0)",
    "minang-rantau": "linear-gradient(135deg,#FDF6F0,#F5DCC0)",
    "bugis-makassar": "linear-gradient(135deg,#F0F5FA,#C8E0F5)",
    "dayak-borneo": "linear-gradient(135deg,#FAF5F0,#E8D8C8)",
    "toraja-sulawesi": "linear-gradient(135deg,#F8F0EA,#EFD8C8)",
    "melayu-riau": "linear-gradient(135deg,#FFFDE8,#FFF3A0)",
    "papua-cendrawasih": "linear-gradient(135deg,#F8F0E8,#F0D8C8)",
    "batik-elegance": "linear-gradient(135deg,#FFF0E0,#FFD0A0)",
};

const icons = {
    "jawa-klasik": "🪷",
    "sunda-pasundan": "🌿",
    "bali-dewata": "🏵️",
    "betawi-jakarta": "🎪",
    "minang-rantau": "👑",
    "bugis-makassar": "⚓",
    "dayak-borneo": "🛡️",
    "toraja-sulawesi": "🏛️",
    "melayu-riau": "✨",
    "papua-cendrawasih": "🦅",
    "batik-elegance": "🌺",
};

function getGradient(id) {
    return gradients[id] || "linear-gradient(135deg,#f3f4f6,#e5e7eb)";
}

function getIcon(id) {
    return icons[id] || "💒";
}

async function moveToReady(tmpl) {
    const result = await Swal.fire({
        title: `Pindahkan "${tmpl.name}"?`,
        text: "Template akan dipindahkan ke Tema Siap Pakai",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Ya, Pindahkan",
        cancelButtonText: "Batal",
        confirmButtonColor: "#10b981",
    });
    if (!result.isConfirmed) return;
    try {
        await axios.put(`/cms/templates/${tmpl.id}/release`);
        await store.dispatch("template/fetchTemplates");
        Swal.fire({ icon: "success", title: "Berhasil!", text: `${tmpl.name} sekarang Siap Pakai`, timer: 2000, showConfirmButton: false });
    } catch (e) {
        Swal.fire({ icon: "error", title: "Gagal", text: e.response?.data?.message || "Terjadi kesalahan" });
    }
}

function populateFromStore() {
    const s = store.getters["settings/settings"];
    if (s) {
        if (s.templateId) form.value.templateId = s.templateId;
        if (s.fontFamily) form.value.fontFamily = s.fontFamily;
    }
}

function selectTemplate(id) {
    form.value.templateId = id;
    store.dispatch("template/selectTemplate", id);
}

async function handleSave() {
    saving.value = true;
    try {
        await store.dispatch("settings/saveSettings", {
            templateId: form.value.templateId,
            fontFamily: form.value.fontFamily,
        });
        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch {
        alert("Gagal menyimpan tema. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}

const { skipNextWatch } = useAutoSavePreview(form, handleSave);

onMounted(async () => {
    await Promise.all([
        store.dispatch("settings/fetchSettings"),
        store.dispatch("template/fetchTemplates"),
    ]);
    populateFromStore();
    skipNextWatch();
});
</script>
