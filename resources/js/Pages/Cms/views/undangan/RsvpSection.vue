<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">💌</span>
                <div>
                    <h2 class="section-title">RSVP Online</h2>
                    <p class="section-desc">
                        Kelola konfirmasi kehadiran tamu undangan
                    </p>
                </div>
            </div>

            <div class="field-group">
                <label class="field-label">Batas RSVP</label>
                <input
                    type="date"
                    v-model="form.deadline"
                    class="field-input"
                />
                <span class="field-hint"
                    >Tamu tidak bisa konfirmasi setelah tanggal ini</span
                >
            </div>

            <div class="field-group">
                <label class="field-label">Jumlah Maksimal Tamu</label>
                <input
                    type="number"
                    v-model="form.maxGuests"
                    min="0"
                    class="field-input"
                    placeholder="0 = tidak terbatas"
                />
            </div>

            <div class="field-group">
                <label class="field-label">Pesan Konfirmasi Hadir</label>
                <textarea
                    v-model="form.confirmMsg"
                    rows="2"
                    class="field-input field-textarea"
                    placeholder="Terima kasih atas konfirmasinya! Kami menantikan kehadiran Anda."
                />
            </div>

            <div class="field-group">
                <label class="field-label">Pesan Konfirmasi Tidak Hadir</label>
                <textarea
                    v-model="form.declineMsg"
                    rows="2"
                    class="field-input field-textarea"
                    placeholder="Kami memahami. Terima kasih sudah meluangkan waktu untuk mengonfirmasi."
                />
            </div>

            <div class="field-group">
                <div class="toggle-row">
                    <div>
                        <span class="field-label"
                            >Tanya Jumlah Tamu Pendamping</span
                        >
                        <p class="field-hint">
                            Tampilkan kolom jumlah tamu yang dibawa
                        </p>
                    </div>
                    <button
                        type="button"
                        class="toggle-btn"
                        :class="{ 'toggle-btn--on': form.askCompanion }"
                        @click="form.askCompanion = !form.askCompanion"
                    >
                        <span
                            class="toggle-thumb"
                            :class="{ 'toggle-thumb--on': form.askCompanion }"
                        ></span>
                    </button>
                </div>
            </div>

            <div class="field-group">
                <div class="toggle-row">
                    <div>
                        <span class="field-label"
                            >Reminder Otomatis via WhatsApp</span
                        >
                        <p class="field-hint">
                            Kirim pengingat H-3 dan H-1 ke nomor tamu
                        </p>
                    </div>
                    <button
                        type="button"
                        class="toggle-btn"
                        :class="{ 'toggle-btn--on': form.autoReminder }"
                        @click="form.autoReminder = !form.autoReminder"
                    >
                        <span
                            class="toggle-thumb"
                            :class="{ 'toggle-thumb--on': form.autoReminder }"
                        ></span>
                    </button>
                </div>
            </div>

            <div class="save-bar">
                <button
                    type="button"
                    class="btn-save"
                    :disabled="saving"
                    @click="handleSave"
                >
                    <span v-if="saving">Menyimpan…</span>
                    <span v-else>💾 Simpan RSVP</span>
                </button>
                <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
            </div>

            <!-- RSVP Response List -->
            <div v-if="rsvpItems.length > 0" class="field-group" style="margin-top:1.5rem">
                <label class="field-label">Daftar Konfirmasi ({{ rsvpItems.length }})</label>
                <div style="overflow-x:auto;border:1px solid #e5e7eb;border-radius:.5rem">
                    <table style="width:100%;font-size:.8rem;border-collapse:collapse">
                        <thead>
                            <tr style="background:#f9fafb;text-align:left">
                                <th style="padding:.5rem .75rem;font-weight:600">Nama</th>
                                <th style="padding:.5rem .75rem;font-weight:600">Status</th>
                                <th style="padding:.5rem .75rem;font-weight:600">Pendamping</th>
                                <th style="padding:.5rem .75rem;font-weight:600">Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in rsvpItems" :key="item.id" style="border-top:1px solid #f3f4f6">
                                <td style="padding:.5rem .75rem">{{ item.name || '-' }}</td>
                                <td style="padding:.5rem .75rem">
                                    <span v-if="item.status === 'hadir'" style="color:#16a34a;font-weight:600">✅ Hadir</span>
                                    <span v-else-if="item.status === 'tidak_hadir'" style="color:#dc2626;font-weight:600">❌ Tidak</span>
                                    <span v-else style="color:#9ca3af">{{ item.status }}</span>
                                </td>
                                <td style="padding:.5rem .75rem">{{ item.companions || 0 }}</td>
                                <td style="padding:.5rem .75rem;color:#9ca3af">{{ item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
            <div class="preview-header">
                <span class="preview-badge">Live Preview</span>
                <span class="preview-tmpl-name">Form RSVP</span>
            </div>
            <div
                class="preview-body"
                style="background: linear-gradient(135deg, #f0fdf4, #dcfce7)"
            >
                <div
                    class="preview-content"
                    style="font-family: &quot;Playfair Display&quot;, serif"
                >
                    <div class="preview-couple" style="color: #166534">
                        Konfirmasi Kehadiran
                    </div>
                    <div
                        class="preview-divider"
                        style="background: #16a34a"
                    ></div>
                    <div class="preview-rsvp-section">
                        <div class="preview-field-mock">👤 Nama Lengkap</div>
                        <div class="preview-field-mock">📱 Nomor WhatsApp</div>
                        <div style="display: flex; gap: 0.5rem">
                            <div
                                class="preview-field-mock"
                                style="
                                    flex: 1;
                                    background: #dcfce7;
                                    color: #166534;
                                    font-weight: 600;
                                    text-align: center;
                                "
                            >
                                ✅ Hadir
                            </div>
                            <div
                                class="preview-field-mock"
                                style="flex: 1; text-align: center"
                            >
                                ❌ Tidak Hadir
                            </div>
                        </div>
                        <div
                            v-if="form.askCompanion"
                            class="preview-field-mock"
                        >
                            👥 Jumlah tamu pendamping
                        </div>
                        <div
                            v-if="form.deadline"
                            class="preview-field-mock"
                            style="font-size: 0.7rem; color: #9ca3af"
                        >
                            ⏰ Batas: {{ formatDate(form.deadline) }}
                        </div>
                        <button
                            class="preview-rsvp-btn"
                            style="background: #16a34a"
                        >
                            Kirim Konfirmasi
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useStore } from "vuex";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);
let pollInterval = null;

const rsvpItems = computed(() => store.getters["rsvp/rsvps"]);

const form = ref({
    deadline: "",
    maxGuests: "",
    confirmMsg: "",
    declineMsg: "",
    askCompanion: true,
    autoReminder: false,
});

function formatDate(d) {
    if (!d) return "";
    return new Date(d + "T00:00:00").toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

async function handleSave() {
    saving.value = true;
    try {
        await store.dispatch("settings/saveSettings", {
            rsvpDeadline: form.value.deadline,
            rsvpMaxGuests: form.value.maxGuests,
            rsvpConfirmMsg: form.value.confirmMsg,
            rsvpDeclineMsg: form.value.declineMsg,
            rsvpAskCompanion: form.value.askCompanion,
            rsvpAutoReminder: form.value.autoReminder,
        });
        saved.value = true;
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } finally {
        saving.value = false;
    }
}

onMounted(() => {
    store.dispatch("rsvp/fetchRsvps");
    // Poll every 60 seconds
    pollInterval = setInterval(() => {
        store.dispatch("rsvp/silentFetchRsvps");
    }, 60000);

    // Pause polling when tab is hidden
    document.addEventListener("visibilitychange", handleVisibility);
});

onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
    document.removeEventListener("visibilitychange", handleVisibility);
});

function handleVisibility() {
    if (document.hidden) {
        if (pollInterval) clearInterval(pollInterval);
        pollInterval = null;
    } else {
        store.dispatch("rsvp/silentFetchRsvps");
        pollInterval = setInterval(() => {
            store.dispatch("rsvp/silentFetchRsvps");
        }, 60000);
    }
}
</script>

<style>
.toggle-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}
.toggle-btn {
    width: 44px;
    height: 24px;
    border-radius: 12px;
    background: #d1d5db;
    border: none;
    cursor: pointer;
    position: relative;
    flex-shrink: 0;
    transition: background 0.2s;
}
.toggle-btn--on {
    background: #10b981;
}
.toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s;
}
.toggle-thumb--on {
    transform: translateX(20px);
}
</style>
