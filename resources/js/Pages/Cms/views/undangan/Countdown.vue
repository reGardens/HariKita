<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">⏰</span>
            <div>
                <h2 class="section-title">Countdown Wedding</h2>
                <p class="section-desc">Hitung mundur menuju hari bahagia</p>
            </div>
        </div>

        <div class="field-group">
            <Label for="weddingDate">Tanggal & Waktu Akad</Label>
            <Input
                id="weddingDate"
                v-model="form.weddingDatetime"
                type="datetime-local"
            />
        </div>

        <div class="field-group">
            <Label for="countdownTitle">Judul Countdown</Label>
            <Input
                id="countdownTitle"
                v-model="form.title"
                placeholder="Contoh: Menuju Hari Bahagia Kami"
            />
        </div>

        <div class="field-group">
            <Label>Tampilkan Unit Waktu</Label>
            <div class="flex flex-wrap gap-3">
                <label
                    v-for="unit in units"
                    :key="unit.key"
                    class="flex items-center gap-1.5 text-sm text-foreground cursor-pointer"
                >
                    <input
                        type="checkbox"
                        v-model="form.showUnits"
                        :value="unit.key"
                        class="accent-emerald-500 cursor-pointer"
                    />
                    <span>{{ unit.label }}</span>
                </label>
            </div>
        </div>

        <div class="field-group">
            <Label>Warna Countdown</Label>
            <div class="flex gap-4 flex-wrap">
                <div class="flex flex-col items-center gap-1">
                    <span class="text-xs text-muted-foreground">Angka</span>
                    <input
                        type="color"
                        v-model="form.numColor"
                        class="w-12 h-10 border-2 border-border rounded-lg cursor-pointer p-0.5"
                    />
                </div>
                <div class="flex flex-col items-center gap-1">
                    <span class="text-xs text-muted-foreground">Latar</span>
                    <input
                        type="color"
                        v-model="form.bgColor"
                        class="w-12 h-10 border-2 border-border rounded-lg cursor-pointer p-0.5"
                    />
                </div>
            </div>
        </div>

        <!-- Live Preview -->
        <div
            class="rounded-xl border border-border p-4 bg-card"
            :style="{
                background: `linear-gradient(135deg, ${form.bgColor}22, ${form.bgColor}44)`,
            }"
        >
            <p
                class="text-center text-sm font-semibold mb-3"
                :style="{ color: form.numColor }"
            >
                ⏳ {{ form.title || "Menuju Hari Bahagia" }}
            </p>
            <div class="flex gap-2 justify-center">
                <div
                    v-for="u in activeUnits"
                    :key="u.key"
                    class="flex flex-col items-center rounded-lg px-3 py-2 min-w-[52px]"
                    :style="{
                        background: form.bgColor + '22',
                        border: `1px solid ${form.numColor}30`,
                    }"
                >
                    <span
                        class="text-2xl font-bold leading-none"
                        :style="{ color: form.numColor }"
                    >
                        {{ countdown[u.key] }}
                    </span>
                    <span class="text-[10px] text-muted-foreground mt-0.5">
                        {{ u.label }}
                    </span>
                </div>
            </div>
            <p
                v-if="form.weddingDatetime"
                class="text-center text-xs mt-2"
                :style="{ color: form.numColor + 'aa' }"
            >
                📅 {{ formatDt(form.weddingDatetime) }}
            </p>
        </div>

        <div class="save-bar">
            <Button :disabled="saving" @click="handleSave">
                <span v-if="saving">Menyimpan…</span>
                <span v-else>💾 Simpan Countdown</span>
            </Button>
            <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import { Input } from "@/Components/ui";
import { Label } from "@/Components/ui";
import { Button } from "@/Components/ui";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);
let timer = null;

const units = [
    { key: "days", label: "Hari" },
    { key: "hours", label: "Jam" },
    { key: "minutes", label: "Menit" },
    { key: "seconds", label: "Detik" },
];

const form = ref({
    weddingDatetime: "",
    title: "Menuju Hari Bahagia Kami",
    showUnits: ["days", "hours", "minutes", "seconds"],
    numColor: "#10b981",
    bgColor: "#ffffff",
});

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);
const activeUnits = computed(() =>
    units.filter((u) => form.value.showUnits.includes(u.key)),
);

const countdown = ref({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
});

function tick() {
    if (!form.value.weddingDatetime) {
        countdown.value = {
            days: "12",
            hours: "08",
            minutes: "45",
            seconds: "30",
        };
        return;
    }
    const target = new Date(form.value.weddingDatetime).getTime();
    const diff = target - Date.now();
    if (diff <= 0) {
        countdown.value = {
            days: "00",
            hours: "00",
            minutes: "00",
            seconds: "00",
        };
        return;
    }
    const s = Math.floor(diff / 1000);
    countdown.value = {
        days: String(Math.floor(s / 86400)).padStart(2, "0"),
        hours: String(Math.floor((s % 86400) / 3600)).padStart(2, "0"),
        minutes: String(Math.floor((s % 3600) / 60)).padStart(2, "0"),
        seconds: String(s % 60).padStart(2, "0"),
    };
}

function formatDt(dt) {
    if (!dt) return "";
    return new Date(dt).toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

async function loadCountdown() {
    const slug = activeSlug.value;
    if (!slug) return;
    try {
        const { data } = await axios.get(`/api/wedding/${slug}/settings`);
        if (data.countdownDatetime) {
            const val = String(data.countdownDatetime);
            if (val.length === 10) {
                form.value.weddingDatetime = `${val}T08:00`;
            } else if (val.includes("T")) {
                form.value.weddingDatetime = val.slice(0, 16);
            } else {
                form.value.weddingDatetime = val;
            }
        }
    } catch (err) {
        console.error("Failed to load countdown", err);
    }
}

onMounted(async () => {
    await loadCountdown();
    tick();
    timer = setInterval(tick, 1000);
});
onUnmounted(() => clearInterval(timer));

async function handleSave() {
    const slug = activeSlug.value;
    if (!slug) return;
    saving.value = true;
    try {
        await axios.post(`/api/wedding/${slug}/settings`, {
            countdownDatetime: form.value.weddingDatetime,
        });
        saved.value = true;
        store.commit("wedding/BUMP_PREVIEW");
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch (err) {
        console.error("Failed to save countdown", err);
        alert("Gagal menyimpan countdown. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}
</script>
