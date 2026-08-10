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

            <!-- Step 1: Copy Template -->
            <div class="field-group">
                <label class="field-label">1. Salin Template untuk Klien</label>
                <div class="template-box">
                    <pre class="template-preview">{{ templateText }}</pre>
                </div>
                <button type="button" class="btn-save" @click="copyTemplate">
                    📋 Salin Template
                </button>
                <span v-if="copiedTemplate" class="save-ok"
                    >✅ Template tersalin! Kirim ke klien via WA/chat.</span
                >
            </div>

            <!-- Step 2: Paste client response -->
            <div class="field-group">
                <label class="field-label">2. Paste Hasil Isian Klien</label>
                <textarea
                    v-model="clientResponse"
                    rows="16"
                    class="field-input field-textarea"
                    placeholder="Paste jawaban klien di sini..."
                ></textarea>
            </div>

            <!-- Step 3: Parse & Fill -->
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
                <span v-if="filled" class="save-ok"
                    >✅ Semua form berhasil terisi!</span
                >
            </div>

            <!-- Loading Bar -->
            <div v-if="filling" class="loading-bar">
                <div class="loading-bar-inner"></div>
            </div>

            <!-- Parsed Preview -->
            <div
                v-if="parsedData && Object.keys(parsedData).length > 0"
                class="field-group"
            >
                <label class="field-label">Data yang Terdeteksi & Terisi</label>
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
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";
import "./section.css";

// Ensure CSRF token is sent with requests
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;
const csrfMeta = document.querySelector('meta[name="csrf-token"]');
if (csrfMeta)
    axios.defaults.headers.common["X-CSRF-TOKEN"] =
        csrfMeta.getAttribute("content");

const store = useStore();
const copiedTemplate = ref(false);
const filled = ref(false);
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
Nama Acara (misal: Akad Nikah):
Tanggal Acara (contoh: 15 Agustus 2026):
Waktu Acara (contoh: 08:00 - 11:00 WIB):
Nama Tempat/Gedung:
Alamat Lengkap:
Link Google Maps (opsional):
Dress Code (opsional):

═══ COUNTDOWN ═══
Tanggal & Waktu Pernikahan (contoh: 2026-08-15 08:00):

═══ AMPLOP DIGITAL ═══
Nama Bank:
Nomor Rekening:
Atas Nama Rekening:
Alamat Rumah Pengantin Pria:
Alamat Rumah Pengantin Wanita:

═══ LIVE STREAMING (opsional) ═══
Link Live Streaming:

═══ PESAN TAMBAHAN ═══
Ucapan/Pesan untuk tamu:

Silakan isi dan kirim kembali ke kami. Terima kasih! 🙏`;

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
    mapsLink: "Link Google Maps",
    dressCode: "Dress Code",
    countdownDatetime: "Countdown",
    bankName: "Nama Bank",
    bankNumber: "Nomor Rekening",
    bankHolder: "Atas Nama Rekening",
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
    copiedTemplate.value = true;
    setTimeout(() => {
        copiedTemplate.value = false;
    }, 3000);
}

function parseClientResponse(text) {
    const data = {};
    const lines = text.split("\n");

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith("═")) continue;

        const val = extractValue(line);
        const nextVal = i + 1 < lines.length ? lines[i + 1]?.trim() : "";
        const resolved =
            val ||
            (nextVal && !nextVal.startsWith("═") && !nextVal.includes(":")
                ? nextVal
                : "");

        if (!resolved) continue;

        if (line.match(/nama lengkap.*pria/i)) data.groomFullName = resolved;
        else if (line.match(/panggilan.*pria/i)) data.groomNickname = resolved;
        else if (line.match(/nama lengkap.*wanita/i))
            data.brideFullName = resolved;
        else if (line.match(/panggilan.*wanita/i))
            data.brideNickname = resolved;
        else if (line.match(/nama acara/i)) data.eventName = resolved;
        else if (line.match(/tanggal acara/i)) data.eventDate = resolved;
        else if (line.match(/waktu acara/i)) data.eventTime = resolved;
        else if (line.match(/nama tempat|gedung/i)) data.venueName = resolved;
        else if (line.match(/alamat lengkap/i)) data.venueAddress = resolved;
        else if (line.match(/google maps/i) && resolved.match(/http/i))
            data.mapsLink = resolved;
        else if (line.match(/dress code/i)) data.dressCode = resolved;
        else if (line.match(/tanggal.*waktu.*pernikahan|countdown/i))
            data.countdownDatetime = resolved;
        else if (line.match(/nama bank/i)) data.bankName = resolved;
        else if (line.match(/nomor rekening/i)) data.bankNumber = resolved;
        else if (line.match(/atas nama/i)) data.bankHolder = resolved;
        else if (line.match(/alamat.*pengantin pria|alamat rumah.*pria/i))
            data.groomAddress = resolved;
        else if (line.match(/alamat.*pengantin wanita|alamat rumah.*wanita/i))
            data.brideAddress = resolved;
        else if (
            line.match(/link.*streaming|live streaming/i) &&
            resolved.match(/http/i)
        )
            data.streamingLink = resolved;
        else if (line.match(/ucapan|pesan.*tamu|pesan tambahan/i))
            data.message = resolved;
    }

    return data;
}

function extractValue(line) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) return "";
    const val = line.slice(colonIdx + 1).trim();
    if (!val || val.match(/^(\(contoh|misal|opsional)/i)) return "";
    return val;
}

async function parseAndFill() {
    if (!clientResponse.value.trim()) return;
    filling.value = true;
    parsedData.value = null;

    const data = parseClientResponse(clientResponse.value);
    parsedData.value = data;

    const slug = activeSlug.value;
    if (!slug) {
        filling.value = false;
        return;
    }

    try {
        // 1. Save Couple
        if (data.groomFullName || data.brideFullName) {
            await axios.post(`/api/wedding/${slug}/couple`, {
                groom_full_name: data.groomFullName || "",
                groom_nickname: data.groomNickname || "",
                bride_full_name: data.brideFullName || "",
                bride_nickname: data.brideNickname || "",
            });
        }

        // 2. Save Event
        if (data.eventDate || data.venueName || data.venueAddress) {
            await axios.post(`/api/wedding/${slug}/events`, {
                name: data.eventName || "Akad Nikah",
                date: data.eventDate || "",
                start_time: data.eventTime || "",
                location_name: data.venueName || "",
                address: data.venueAddress || "",
                maps_url: data.mapsLink || "",
                dress_code: data.dressCode || "",
            });
        }

        // 3. Save Settings (countdown, streaming, amplop, message)
        const settingsPayload = {};
        if (data.countdownDatetime)
            settingsPayload.countdownDatetime = data.countdownDatetime;
        if (data.streamingLink)
            settingsPayload.streamingUrl = data.streamingLink;
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
            await axios.post(`/api/wedding/${slug}/settings`, settingsPayload);
        }

        filled.value = true;
        setTimeout(() => {
            filled.value = false;
        }, 4000);
    } catch (e) {
        console.error("Fill error:", e.response?.data || e.message);
        alert(
            "Gagal: " +
                (e.response?.data?.message || e.message || "Cek console"),
        );
    } finally {
        filling.value = false;
    }
}

onMounted(() => {
    if (activeSlug.value) {
        store.dispatch("couple/fetchCouple");
        store.dispatch("events/fetchEvents");
    }
});
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
}
.dark .parsed-value {
    color: #f9fafb;
}
.loading-bar {
    width: 100%;
    height: 4px;
    background: var(--border, #e5e7eb);
    border-radius: 2px;
    overflow: hidden;
}
.loading-bar-inner {
    height: 100%;
    width: 40%;
    background: #10b981;
    border-radius: 2px;
    animation: loading-slide 1s ease-in-out infinite;
}
@keyframes loading-slide {
    0% {
        transform: translateX(-100%);
    }
    100% {
        transform: translateX(350%);
    }
}
</style>
