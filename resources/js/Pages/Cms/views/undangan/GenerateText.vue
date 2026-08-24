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
import { ref, computed } from "vue";
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
const clientResponse = ref("");
const parsedData = ref(null);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

const templateText = `Mohon isi data berikut untuk undangan pernikahan Anda:

═══ DATA MEMPELAI ═══
Nama Lengkap Mempelai Pria:
Nama Panggilan Pria:
Nama Lengkap Mempelai Wanita:
Nama Panggilan Wanita:

═══ INFORMASI ACARA ═══
Nama Acara:
Tanggal Acara:
Waktu Acara:
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

Silakan isi dan kirim kembali. Terima kasih! 🙏`;

const labelMap = {
    groomFullName: "Nama Lengkap Pria",
    groomNickname: "Nama Panggilan Pria",
    brideFullName: "Nama Lengkap Wanita",
    brideNickname: "Nama Panggilan Wanita",
    eventName: "Nama Acara",
    eventDate: "Tanggal Acara",
    eventTime: "Waktu Acara",
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
        else if (label.includes("tanggal acara")) data.eventDate = value;
        else if (label.includes("waktu acara")) data.eventTime = value;
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
                    timeStart: data.eventTime || "",
                    timeEnd: "",
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
            router.reload({ only: ["weddingData"] });
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
