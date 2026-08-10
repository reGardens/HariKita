<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">✍️</span>
                <div>
                    <h2 class="section-title">Generate Text</h2>
                    <p class="section-desc">
                        Salin template, kirim ke klien, lalu paste hasil isian
                        untuk auto-fill semua form
                    </p>
                </div>
            </div>

            <!-- Step 1 -->
            <div class="field-group">
                <label class="field-label">1. Salin Template untuk Klien</label>
                <div class="template-box">
                    <pre class="template-preview">{{ templateText }}</pre>
                </div>
                <button type="button" class="btn-save" @click="copyTemplate">
                    📋 Salin Template
                </button>
            </div>

            <!-- Step 2 -->
            <div class="field-group">
                <label class="field-label">2. Paste Hasil Isian Klien</label>
                <textarea
                    v-model="clientResponse"
                    rows="16"
                    class="field-input field-textarea"
                    placeholder="Paste jawaban klien di sini..."
                ></textarea>
            </div>

            <!-- Step 3 -->
            <div class="action-bar">
                <button
                    type="button"
                    class="btn-save"
                    @click="parseAndFill"
                    :disabled="!clientResponse.trim() || filling"
                >
                    <span v-if="filling">⏳ Memproses...</span>
                    <span v-else>⚡ Fill Semua Form</span>
                </button>
            </div>

            <!-- Parsed Preview -->
            <div
                v-if="parsedData && Object.keys(parsedData).length > 0"
                class="field-group"
            >
                <label class="field-label">Data yang Terdeteksi</label>
                <div class="parsed-preview">
                    <div
                        v-for="(value, key) in parsedData"
                        :key="key"
                        class="parsed-item"
                    >
                        <span class="parsed-key">{{
                            labelMap[key] || key
                        }}</span>
                        <span class="parsed-value">{{ value }}</span>
                    </div>
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
Dress Code:

═══ COUNTDOWN ═══
Tanggal Pernikahan (YYYY-MM-DD):

═══ AMPLOP DIGITAL ═══
Nama Bank:
Nomor Rekening:
Atas Nama Rekening:
Alamat Rumah Pengantin Pria:
Alamat Rumah Pengantin Wanita:

═══ LIVE STREAMING ═══
Link Live Streaming:

═══ PESAN TAMBAHAN ═══
Pesan untuk tamu:

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
    dressCode: "Dress Code",
    countdownDate: "Tanggal Pernikahan",
    bankName: "Nama Bank",
    bankNumber: "Nomor Rekening",
    bankHolder: "Atas Nama",
    groomAddress: "Alamat Pengantin Pria",
    brideAddress: "Alamat Pengantin Wanita",
    streamingLink: "Link Streaming",
    message: "Pesan Tambahan",
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
        else if (label.includes("dress code")) data.dressCode = value;
        else if (
            label.includes("tanggal pernikahan") ||
            label.includes("countdown")
        )
            data.countdownDate = value;
        else if (label.includes("nama bank")) data.bankName = value;
        else if (label.includes("nomor rekening")) data.bankNumber = value;
        else if (label.includes("atas nama")) data.bankHolder = value;
        else if (label.includes("alamat") && label.includes("pria"))
            data.groomAddress = value;
        else if (label.includes("alamat") && label.includes("wanita"))
            data.brideAddress = value;
        else if (
            label.includes("live streaming") ||
            label.includes("link live")
        )
            data.streamingLink = value;
        else if (label.includes("pesan")) data.message = value;
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

    // Show loading
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

        // 2. Save Event
        if (data.eventName || data.eventDate || data.venueName) {
            try {
                await axios.post(`/api/wedding/${slug}/events`, {
                    name: data.eventName || "Akad Nikah",
                    date: data.eventDate || "",
                    start_time: data.eventTime || "",
                    location_name: data.venueName || "",
                    address: data.venueAddress || "",
                    maps_url: data.mapsLink || "",
                    dress_code: data.dressCode || "",
                });
            } catch (e) {
                errors.push(
                    "Acara: " + (e.response?.data?.message || e.message),
                );
            }
        }

        // 3. Save Settings (countdown, streaming, amplop)
        try {
            const settingsPayload = {};
            if (data.countdownDate)
                settingsPayload.countdownDatetime = data.countdownDate;
            if (data.streamingLink)
                settingsPayload.liveStreamUrl = data.streamingLink;
            if (data.message) settingsPayload.customMessage = data.message;
            if (data.bankName || data.bankNumber) {
                settingsPayload.amplopAccounts = [
                    {
                        type: "bank",
                        bankName: data.bankName || "",
                        number: data.bankNumber || "",
                        name: data.bankHolder || "",
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

        // Show result
        if (errors.length === 0) {
            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Semua data telah tersimpan ke form terkait",
                timer: 3000,
                showConfirmButton: true,
            });
        } else {
            Swal.fire({
                icon: "warning",
                title: "Sebagian tersimpan",
                html: `<p>Beberapa gagal:</p><ul style="text-align:left;font-size:0.8rem">${errors.map((e) => `<li>${e}</li>`).join("")}</ul>`,
            });
        }
    } catch (e) {
        Swal.fire({ icon: "error", title: "Gagal", text: e.message });
    } finally {
        filling.value = false;
    }
}
</script>

<style scoped>
.template-box {
    background: var(--card, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.5rem;
    padding: 1rem;
    overflow-x: auto;
}
.dark .template-box {
    background: hsl(240 10% 12%);
    border-color: hsl(240 5% 20%);
}
.template-preview {
    font-size: 0.75rem;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--foreground, #374151);
    font-family: inherit;
    margin: 0;
    line-height: 1.6;
}
.dark .template-preview {
    color: #e5e7eb;
}
.action-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}
.parsed-preview {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background: var(--card, #f0fdf4);
    border: 1px solid var(--border, #bbf7d0);
    border-radius: 0.5rem;
    padding: 1rem;
}
.dark .parsed-preview {
    background: hsl(150 20% 10%);
    border-color: hsl(150 30% 20%);
}
.parsed-item {
    display: flex;
    gap: 0.75rem;
    font-size: 0.8rem;
    align-items: baseline;
}
.parsed-key {
    font-weight: 600;
    color: var(--muted-foreground, #6b7280);
    min-width: 160px;
    flex-shrink: 0;
}
.parsed-value {
    color: var(--foreground, #111827);
    font-weight: 500;
    word-break: break-word;
}
.dark .parsed-value {
    color: #f9fafb;
}
</style>
