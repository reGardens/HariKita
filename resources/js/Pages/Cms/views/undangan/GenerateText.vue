<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">✍️</span>
                <div>
                    <h2 class="section-title">Generate Text</h2>
                    <p class="section-desc">
                        Salin template, kirim ke klien, lalu paste hasil isian
                        untuk auto-fill form
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
                    rows="12"
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
                    :disabled="!clientResponse.trim()"
                >
                    ⚡ Fill Semua Form
                </button>
                <span v-if="filled" class="save-ok"
                    >✅ Data berhasil di-fill ke form terkait!</span
                >
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
import { ref, computed, onMounted } from "vue";
import { useStore } from "vuex";
import "./section.css";

const store = useStore();
const copiedTemplate = ref(false);
const filled = ref(false);
const clientResponse = ref("");
const parsedData = ref(null);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);

// Template yang dikirim ke klien untuk diisi
const templateText = `Mohon isi data berikut untuk undangan pernikahan Anda:

Nama Lengkap Mempelai Pria:
Nama Panggilan Pria:
Nama Lengkap Mempelai Wanita:
Nama Panggilan Wanita:
Tanggal Acara (contoh: 15 Agustus 2026):
Waktu Acara (contoh: 08:00 - 11:00 WIB):
Nama Tempat/Gedung:
Alamat Lengkap:
Link Google Maps (opsional):

Silakan isi dan kirim kembali ke kami. Terima kasih! 🙏`;

const labelMap = {
    groomFullName: "Nama Lengkap Pria",
    groomNickname: "Nama Panggilan Pria",
    brideFullName: "Nama Lengkap Wanita",
    brideNickname: "Nama Panggilan Wanita",
    eventDate: "Tanggal Acara",
    eventTime: "Waktu Acara",
    venueName: "Nama Tempat",
    venueAddress: "Alamat Lengkap",
    mapsLink: "Link Google Maps",
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
        const nextLine = i + 1 < lines.length ? lines[i + 1]?.trim() : "";

        // Match "Label: Value" or "Label:\nValue"
        if (line.match(/nama lengkap.*pria/i)) {
            const val = extractValue(line) || nextLine;
            if (val) data.groomFullName = val;
        } else if (
            line.match(/nama panggilan.*pria/i) ||
            line.match(/panggilan pria/i)
        ) {
            const val = extractValue(line) || nextLine;
            if (val) data.groomNickname = val;
        } else if (line.match(/nama lengkap.*wanita/i)) {
            const val = extractValue(line) || nextLine;
            if (val) data.brideFullName = val;
        } else if (
            line.match(/nama panggilan.*wanita/i) ||
            line.match(/panggilan wanita/i)
        ) {
            const val = extractValue(line) || nextLine;
            if (val) data.brideNickname = val;
        } else if (line.match(/tanggal/i)) {
            const val = extractValue(line) || nextLine;
            if (val) data.eventDate = val;
        } else if (line.match(/waktu/i)) {
            const val = extractValue(line) || nextLine;
            if (val) data.eventTime = val;
        } else if (line.match(/nama tempat|gedung/i)) {
            const val = extractValue(line) || nextLine;
            if (val) data.venueName = val;
        } else if (line.match(/alamat lengkap/i)) {
            const val = extractValue(line) || nextLine;
            if (val) data.venueAddress = val;
        } else if (line.match(/google maps|maps/i)) {
            const val = extractValue(line) || nextLine;
            if (val && val.startsWith("http")) data.mapsLink = val;
        }
    }

    return data;
}

function extractValue(line) {
    const parts = line.split(":");
    if (parts.length >= 2) {
        const val = parts.slice(1).join(":").trim();
        if (val && !val.match(/^(contoh|opsional|\()/i)) return val;
    }
    return "";
}

function parseAndFill() {
    if (!clientResponse.value.trim()) return;

    const data = parseClientResponse(clientResponse.value);
    parsedData.value = data;

    // Fill couple data via API
    if (data.groomFullName || data.brideFullName) {
        const couplePayload = {
            groom: {
                fullName: data.groomFullName || "",
                nickname: data.groomNickname || "",
            },
            bride: {
                fullName: data.brideFullName || "",
                nickname: data.brideNickname || "",
            },
        };
        store.dispatch("couple/saveCouple", couplePayload);
    }

    // Fill event data via API
    if (data.eventDate || data.venueName || data.venueAddress) {
        const eventPayload = {
            name: "Akad Nikah",
            date: data.eventDate || "",
            start_time: data.eventTime || "",
            location_name: data.venueName || "",
            address: data.venueAddress || "",
            maps_url: data.mapsLink || "",
        };
        store.dispatch("events/saveEvent", eventPayload);
    }

    filled.value = true;
    setTimeout(() => {
        filled.value = false;
    }, 3000);
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
    font-size: 0.8rem;
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
    min-width: 140px;
    flex-shrink: 0;
}

.parsed-value {
    color: var(--foreground, #111827);
    font-weight: 500;
}

.dark .parsed-value {
    color: #f9fafb;
}
</style>
