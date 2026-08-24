<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">📅</span>
            <div>
                <h2 class="section-title">Informasi Acara</h2>
                <p class="section-desc">
                    Tambahkan detail rangkaian acara pernikahan
                </p>
            </div>
        </div>

        <div v-for="(event, idx) in form.events" :key="idx" class="event-block">
            <div class="event-block-header">
                <Label class="text-foreground font-semibold"
                    >Acara {{ idx + 1 }}</Label
                >
                <Button
                    v-if="form.events.length > 1"
                    variant="ghost"
                    size="sm"
                    class="text-destructive hover:text-destructive/80 h-7 px-2"
                    @click="removeEvent(idx)"
                >
                    ✕ Hapus
                </Button>
            </div>

            <div class="field-group">
                <Label>Nama Acara</Label>
                <Input
                    v-model="event.name"
                    placeholder="Nama acara, misal: Akad Nikah"
                />
            </div>

            <div class="field-group">
                <Label>Tanggal</Label>
                <Input v-model="event.date" type="date" />
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="field-group">
                    <Label>Mulai</Label>
                    <Input v-model="event.startTime" type="time" />
                </div>
                <div class="field-group">
                    <Label>Selesai</Label>
                    <Input v-model="event.endTime" type="time" />
                </div>
            </div>

            <div class="field-group">
                <Label>Nama Tempat</Label>
                <Input
                    v-model="event.venue"
                    placeholder="Nama tempat, misal: Gedung Serbaguna Mawar"
                />
            </div>

            <div class="field-group">
                <Label>Alamat Lengkap</Label>
                <Textarea
                    v-model="event.address"
                    rows="2"
                    placeholder="Alamat lengkap..."
                />
            </div>

            <div class="field-group">
                <Label>Link Google Maps</Label>
                <Input
                    v-model="event.mapsUrl"
                    placeholder="Link Google Maps (opsional)"
                />
            </div>
        </div>

        <Button
            v-if="isSuperAdmin"
            variant="outline"
            class="w-full border-dashed border-2 hover:border-emerald-500 hover:text-emerald-600"
            @click="addEvent"
        >
            + Tambah Acara
        </Button>

        <div class="save-bar">
            <Button :disabled="saving" @click="handleSave">
                <span v-if="saving">Menyimpan…</span>
                <span v-else>💾 Simpan Acara</span>
            </Button>
            <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useStore } from "vuex";
import { usePage } from "@inertiajs/vue3";
import axios from "axios";
import { Input } from "@/Components/ui";
import { Label } from "@/Components/ui";
import { Button } from "@/Components/ui";
import { Textarea } from "@/Components/ui";
import { useAutoSavePreview } from "@/Composables/useAutoSavePreview";
import "./section.css";

const store = useStore();
const page = usePage();
const saving = ref(false);
const saved = ref(false);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);
const isSuperAdmin = computed(
    () => page.props.auth?.user?.roles?.includes("super-admin") || false,
);

const emptyEvent = () => ({
    id: null,
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    address: "",
    mapsUrl: "",
});

const form = ref({
    events: [emptyEvent()],
});

function mapApiToForm(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return [emptyEvent()];
    }
    return items.map((e) => ({
        id: e.id || null,
        name: e.name || "",
        date: e.date || "",
        startTime: e.timeStart || e.time_start || "",
        endTime: e.timeEnd || e.time_end || "",
        venue: e.locationName || e.location_name || "",
        address: e.locationAddress || e.location_address || "",
        mapsUrl: e.locationMapUrl || e.location_map_url || "",
    }));
}

onMounted(loadEvents);

// Auto-save & refresh preview on form change (debounced 2s)
const { skipNextWatch } = useAutoSavePreview(form, handleSave);

async function loadEvents() {
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.get(`/api/wedding/${slug}/events`);
        form.value.events = mapApiToForm(data);
        skipNextWatch(); // Don't auto-save after initial load
    } catch (err) {
        console.error("Failed to load events", err);
    }
}

function addEvent() {
    form.value.events.push(emptyEvent());
}

function removeEvent(idx) {
    form.value.events.splice(idx, 1);
}

async function handleSave() {
    const slug = activeSlug.value;
    if (!slug) return;
    saving.value = true;
    try {
        const { data: current } = await axios.get(
            `/api/wedding/${slug}/events`,
        );
        const currentIds = new Set(
            (Array.isArray(current) ? current : []).map((e) => e.id),
        );
        const formIds = new Set(
            form.value.events.filter((e) => e.id).map((e) => e.id),
        );

        for (const id of currentIds) {
            if (!formIds.has(id)) {
                await axios
                    .delete(`/api/wedding/${slug}/events/${id}`)
                    .catch(() => {});
            }
        }

        for (const ev of form.value.events) {
            const payload = {
                name: ev.name,
                date: ev.date,
                timeStart: ev.startTime,
                timeEnd: ev.endTime,
                timezone: "WIB",
                locationName: ev.venue,
                locationAddress: ev.address,
                locationMapUrl: ev.mapsUrl,
            };
            if (ev.id) {
                await axios.put(
                    `/api/wedding/${slug}/events/${ev.id}`,
                    payload,
                );
            } else {
                const { data } = await axios.post(
                    `/api/wedding/${slug}/events`,
                    payload,
                );
                ev.id = data.id;
            }
        }

        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch (err) {
        console.error("Failed to save events", err);
        alert("Gagal menyimpan acara. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.event-block {
    @apply border border-border rounded-xl p-4 flex flex-col gap-3 bg-card;
}
.event-block-header {
    @apply flex items-center justify-between;
}
</style>
