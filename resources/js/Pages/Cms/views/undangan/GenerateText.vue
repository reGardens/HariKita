<template>
    <div class="section-form">
        <div class="section-header">
            <span class="section-icon">✍️</span>
            <div>
                <h2 class="section-title">Generate Text</h2>
                <p class="section-desc">
                    Salin template, kirim ke klien, lalu paste hasil isian untuk
                    auto-fill semua form
                </p>
            </div>
        </div>

        <!-- Step 1 -->
        <div class="field-group">
            <Label>1. Salin Template untuk Klien</Label>
            <div
                class="rounded-lg border border-border bg-card p-4 overflow-x-auto"
            >
                <pre
                    class="text-xs whitespace-pre-wrap break-words text-foreground font-sans leading-relaxed m-0"
                    >{{ templateText }}</pre
                >
            </div>
            <Button variant="outline" @click="copyTemplate">
                📋 Salin Template
            </Button>
        </div>

        <!-- Step 2 -->
        <div class="field-group">
            <Label>2. Paste Hasil Isian Klien</Label>
            <Textarea
                v-model="clientResponse"
                rows="16"
                placeholder="Paste jawaban klien di sini..."
            />
        </div>

        <!-- Step 3 -->
        <div class="flex items-center gap-3 flex-wrap">
            <Button
                @click="parseAndFill"
                :disabled="!clientResponse.trim() || filling"
            >
                <span v-if="filling">⏳ Memproses...</span>
                <span v-else>⚡ Fill Semua Form</span>
            </Button>
        </div>

        <!-- Parsed Preview -->
        <div
            v-if="parsedData && Object.keys(parsedData).length > 0"
            class="field-group"
        >
            <Label>Data yang Terdeteksi</Label>
            <div
                class="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex flex-col gap-2"
            >
                <div
                    v-for="(value, key) in parsedData"
                    :key="key"
                    class="flex gap-3 text-xs items-baseline"
                >
                    <span
                        class="font-semibold text-muted-foreground min-w-[140px] flex-shrink-0"
                        >{{ labelMap[key] || key }}</span
                    >
                    <span class="text-foreground font-medium break-words">{{
                        value
                    }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import Swal from "sweetalert2";
import { Label } from "@/Components/ui";
import { Button } from "@/Components/ui";
import { Textarea } from "@/Components/ui";
import "./section.css";

// Setup axios
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;
const csrfMeta = document.querySelector('meta[name="csrf-token"]');
if (csrfMeta)
    axios.defaults.headers.common["X-CSRF-TOKEN"] =
        csrfMeta.getAttribute("content");

const store = useStore();
const filling = ref(false);
const parsedData = ref(null);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

// Persist client response to localStorage
const STORAGE_KEY = "cms-generate-text-response";
const clientResponse = ref(localStorage.getItem(STORAGE_KEY) || "");
watch(clientResponse, (val) => {
    localStorage.setItem(STORAGE_KEY, val);
});

const templateText = `Mohon isi data berikut untuk undangan pernikahan Anda:

═══ DATA MEMPELAI ═══
Nama Lengkap Mempelai Pria:
Nama Panggilan Pria:
Nama Lengkap Mempelai Wanita:
Nama Panggilan Wanita:

═══ INFORMASI ACARA ═══
Nama Acara:
Tanggal Acara: 2026-12-25
Waktu Mulai: 08:00
Waktu Selesai: 12:00
Nama Tempat:
Alamat Lengkap:
Link Google Maps:

═══ AMPLOP DIGITAL ═══
Nama Bank Mempelai Pria:
Nomor Rekening Mempelai Pria:
Atas Nama Rekening Mempelai Pria:
Nama Bank Mempelai Wanita:
Nomor Rekening Mempelai Wanita:
Atas Nama Rekening Mempelai Wanita:
Alamat Rumah Pengantin Pria:
Alamat Rumah Pengantin Wanita:

═══ LIVE STREAMING ═══
Link Live Streaming:

═══ LOVE STORY ═══
(Isi beberapa momen perjalanan cinta, tambahkan momen baru dengan format yang sama)

Momen 1:
Tanggal/Tahun: 2020
Judul: Pertama Bertemu
Cerita: Kami bertemu di acara kampus

Momen 2:
Tanggal/Tahun: 2021
Judul: Jadian
Cerita: Resmi menjadi sepasang kekasih

Momen 3:
Tanggal/Tahun: 2023
Judul: Lamaran
Cerita: Di sebuah restoran favorit kami

Momen 4:
Tanggal/Tahun: 2026
Judul: Hari Bahagia
Cerita: Akhirnya kami menikah

Silakan isi dan kirim kembali. Terima kasih! 🙏`;

const labelMap = {
    groomFullName: "Nama Lengkap Pria",
    groomNickname: "Nama Panggilan Pria",
    brideFullName: "Nama Lengkap Wanita",
    brideNickname: "Nama Panggilan Wanita",
    eventName: "Nama Acara",
    eventDate: "Tanggal Acara",
    eventTimeStart: "Waktu Mulai",
    eventTimeEnd: "Waktu Selesai",
    venueName: "Nama Tempat",
    venueAddress: "Alamat Lengkap",
    mapsLink: "Google Maps",
    groomBankName: "Nama Bank Mempelai Pria",
    groomBankNumber: "Nomor Rekening Mempelai Pria",
    groomBankHolder: "Atas Nama Rekening Mempelai Pria",
    brideBankName: "Nama Bank Mempelai Wanita",
    brideBankNumber: "Nomor Rekening Mempelai Wanita",
    brideBankHolder: "Atas Nama Rekening Mempelai Wanita",
    groomAddress: "Alamat Pengantin Pria",
    brideAddress: "Alamat Pengantin Wanita",
    streamingLink: "Link Streaming",
};

function copyTemplate() {
    const el = document.createElement("textarea");
    el.value = templateText;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(el);
    Swal.fire({
        icon: "success",
        title: "Template tersalin!",
        text: "Kirim ke klien via WA/chat",
        timer: 2000,
        showConfirmButton: false,
    });
}

/**
 * Normalize tanggal ke format YYYY-MM-DD agar kompatibel dengan input type="date"
 * Mendukung: "2026-12-25", "25-12-2026", "25/12/2026", "25 Desember 2026", "25 Des 2026"
 */
function normalizeDate(value) {
    if (!value) return "";
    const v = value.trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;

    // DD-MM-YYYY or DD/MM/YYYY
    const dmy = v.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`;

    // Try Indonesian month names: "25 Desember 2026"
    const months = { januari: "01", februari: "02", maret: "03", april: "04", mei: "05", juni: "06", juli: "07", agustus: "08", september: "09", oktober: "10", november: "11", desember: "12", jan: "01", feb: "02", mar: "03", apr: "04", jun: "06", jul: "07", agu: "08", ags: "08", sep: "09", okt: "10", nov: "11", des: "12" };
    const idMatch = v.match(/^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})$/);
    if (idMatch) {
        const m = months[idMatch[2].toLowerCase()];
        if (m) return `${idMatch[3]}-${m}-${idMatch[1].padStart(2, "0")}`;
    }

    // Fallback: try Date.parse
    const parsed = Date.parse(v);
    if (!isNaN(parsed)) {
        const d = new Date(parsed);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }

    return v; // Return as-is if nothing matches
}

/**
 * Normalize waktu ke format HH:mm agar kompatibel dengan input type="time"
 * Mendukung: "08:00", "8:00", "08.00", "08:00 WIB", "8 pagi"
 */
function normalizeTime(value) {
    if (!value) return "";
    const v = value.trim();

    // Already HH:mm or H:mm
    const hm = v.match(/^(\d{1,2})[:.](\d{2})/);
    if (hm) return `${hm[1].padStart(2, "0")}:${hm[2]}`;

    // Just hour number: "8" → "08:00"
    if (/^\d{1,2}$/.test(v)) return `${v.padStart(2, "0")}:00`;

    return v;
}

function parseClientResponse(text) {
    const data = {};
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (
            !line ||
            line.startsWith("═") ||
            line.startsWith("Mohon") ||
            line.startsWith("Silakan")
        )
            continue;

        const colonIdx = line.indexOf(":");
        if (colonIdx === -1) continue;

        const label = line.slice(0, colonIdx).trim().toLowerCase();
        const value = line.slice(colonIdx + 1).trim();
        if (!value) continue;

        if (label.includes("nama lengkap") && label.includes("pria"))
            data.groomFullName = value;
        else if (label.includes("panggilan") && label.includes("pria"))
            data.groomNickname = value;
        else if (label.includes("nama lengkap") && label.includes("wanita"))
            data.brideFullName = value;
        else if (label.includes("panggilan") && label.includes("wanita"))
            data.brideNickname = value;
        else if (label.includes("nama acara")) data.eventName = value;
        else if (label.includes("tanggal acara")) data.eventDate = normalizeDate(value);
        else if (label.includes("waktu mulai")) data.eventTimeStart = normalizeTime(value);
        else if (label.includes("waktu selesai")) data.eventTimeEnd = normalizeTime(value);
        else if (label.includes("waktu acara")) data.eventTimeStart = normalizeTime(value);
        else if (label.includes("nama tempat")) data.venueName = value;
        else if (label.includes("alamat lengkap")) data.venueAddress = value;
        else if (label.includes("google maps") || label.includes("link google"))
            data.mapsLink = value;
        else if (label.includes("nama bank") && label.includes("pria"))
            data.groomBankName = value;
        else if (label.includes("nomor rekening") && label.includes("pria"))
            data.groomBankNumber = value;
        else if (label.includes("atas nama") && label.includes("pria"))
            data.groomBankHolder = value;
        else if (label.includes("nama bank") && label.includes("wanita"))
            data.brideBankName = value;
        else if (label.includes("nomor rekening") && label.includes("wanita"))
            data.brideBankNumber = value;
        else if (label.includes("atas nama") && label.includes("wanita"))
            data.brideBankHolder = value;
        else if (label.includes("alamat") && label.includes("pria"))
            data.groomAddress = value;
        else if (label.includes("alamat") && label.includes("wanita"))
            data.brideAddress = value;
        else if (
            label.includes("live streaming") ||
            label.includes("link live")
        )
            data.streamingLink = value;
    }

    // Parse Love Story moments
    const loveStoryMatch = text.match(/═══ LOVE STORY ═══([\s\S]*?)(?=═══|Silakan isi|$)/i);
    if (loveStoryMatch) {
        const loveSection = loveStoryMatch[1];
        const moments = [];
        const momentBlocks = loveSection.split(/Momen\s*\d+\s*:/i).filter(b => b.trim());

        for (const block of momentBlocks) {
            const moment = { date: "", title: "", story: "" };
            const blockLines = block.split("\n");
            for (const bl of blockLines) {
                const ci = bl.indexOf(":");
                if (ci === -1) continue;
                const k = bl.slice(0, ci).trim().toLowerCase();
                const v = bl.slice(ci + 1).trim();
                if (!v) continue;
                if (k.includes("tanggal") || k.includes("tahun")) moment.date = v;
                else if (k.includes("judul")) moment.title = v;
                else if (k.includes("cerita")) moment.story = v;
            }
            if (moment.title || moment.story || moment.date) {
                moments.push(moment);
            }
        }
        if (moments.length > 0) data.loveStory = moments;
    }

    return data;
}

async function parseAndFill() {
    if (!clientResponse.value.trim()) return;
    const slug = activeSlug.value;
    if (!slug) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Slug undangan tidak ditemukan",
        });
        return;
    }

    const data = parseClientResponse(clientResponse.value);
    parsedData.value = data;

    if (Object.keys(data).length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Tidak ada data terdeteksi",
            text: "Pastikan format isian sesuai template",
        });
        return;
    }

    Swal.fire({
        title: "Menyimpan data...",
        text: "Mengisi semua form secara otomatis",
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        },
    });

    filling.value = true;
    const errors = [];
    let eventSaved = false;

    try {
        // 1. Save Couple
        if (data.groomFullName || data.brideFullName) {
            try {
                await axios.post(`/api/wedding/${slug}/couple`, {
                    groom: {
                        fullName: data.groomFullName || "",
                        nickname: data.groomNickname || "",
                    },
                    bride: {
                        fullName: data.brideFullName || "",
                        nickname: data.brideNickname || "",
                    },
                });
            } catch (e) {
                errors.push(
                    "Pasangan: " + (e.response?.data?.message || e.message),
                );
            }
        }

        // 2. Save Event — replace existing events with the parsed one
        if (data.eventName || data.eventDate || data.venueName) {
            try {
                const existing = await axios.get(`/api/wedding/${slug}/events`);
                if (Array.isArray(existing.data)) {
                    for (const ev of existing.data) {
                        try {
                            await axios.delete(
                                `/api/wedding/${slug}/events/${ev.id}`,
                            );
                        } catch {
                            /* ignore */
                        }
                    }
                }
                await axios.post(`/api/wedding/${slug}/events`, {
                    name: data.eventName || "Akad Nikah",
                    date: data.eventDate || "",
                    timeStart: data.eventTimeStart || "",
                    timeEnd: data.eventTimeEnd || "",
                    timezone: "WIB",
                    locationName: data.venueName || "",
                    locationAddress: data.venueAddress || "",
                    locationMapUrl: data.mapsLink || "",
                });
                eventSaved = true;
            } catch (e) {
                errors.push(
                    "Acara: " + (e.response?.data?.message || e.message),
                );
            }
        }

        // 3. Save Settings (event-derived countdown, streaming, amplop)
        try {
            const settingsPayload = {};
            if (eventSaved)
                settingsPayload.countdownDatetime = data.eventDate || "";
            if (data.streamingLink)
                settingsPayload.liveStreamUrl = data.streamingLink;
            if (
                data.groomBankName ||
                data.groomBankNumber ||
                data.groomBankHolder ||
                data.brideBankName ||
                data.brideBankNumber ||
                data.brideBankHolder
            ) {
                settingsPayload.amplopAccounts = [
                    {
                        type: "bank",
                        bankName: data.groomBankName || "",
                        number: data.groomBankNumber || "",
                        name: data.groomBankHolder || "",
                    },
                    {
                        type: "bank",
                        bankName: data.brideBankName || "",
                        number: data.brideBankNumber || "",
                        name: data.brideBankHolder || "",
                    },
                ];
            }
            if (data.groomAddress || data.brideAddress) {
                settingsPayload.amplopAddresses = {
                    groom: { fullAddress: data.groomAddress || "" },
                    bride: { fullAddress: data.brideAddress || "" },
                };
            }
            if (data.loveStory) {
                settingsPayload.loveStory = data.loveStory;
            }
            if (Object.keys(settingsPayload).length > 0) {
                await axios.post(
                    `/api/wedding/${slug}/settings`,
                    settingsPayload,
                );
            }
        } catch (e) {
            errors.push(
                "Settings: " + (e.response?.data?.message || e.message),
            );
        }

        if (errors.length === 0) {
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Semua data telah tersimpan. Buka menu terkait untuk melihat data yang terisi.",
                timer: 3500,
                showConfirmButton: true,
            });
        } else {
            Swal.fire({
                icon: "warning",
                title: "Sebagian tersimpan",
                html: `<p>Beberapa gagal:</p><ul style="text-align:left;font-size:0.8rem">${errors.map((e) => `<li>${e}</li>`).join("")}</ul>`,
            });
        }

        try {
            const { router } = await import("@inertiajs/vue3");
            router.reload({ only: ["weddingData", "wedding"] });
        } catch {
            /* ignore if inertia reload fails */
        }
    } catch (e) {
        Swal.fire({ icon: "error", title: "Gagal", text: e.message });
    } finally {
        filling.value = false;
    }
}
</script>
