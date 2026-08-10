<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">💬</span>
                <div>
                    <h2 class="section-title">Template Pesan WhatsApp</h2>
                    <p class="section-desc">
                        Buat template pesan undangan untuk dikirim via WhatsApp
                        ke tamu
                    </p>
                </div>
            </div>

            <!-- Quick Fill Form -->
            <div class="field-group">
                <label class="field-label">Nama Mempelai Pria</label>
                <input
                    type="text"
                    v-model="form.groomName"
                    class="field-input"
                    placeholder="Contoh: Budi"
                />
            </div>

            <div class="field-group">
                <label class="field-label">Nama Mempelai Wanita</label>
                <input
                    type="text"
                    v-model="form.brideName"
                    class="field-input"
                    placeholder="Contoh: Ani"
                />
            </div>

            <div class="field-group">
                <label class="field-label">Tanggal Acara</label>
                <input
                    type="date"
                    v-model="form.eventDate"
                    class="field-input"
                />
            </div>

            <div class="field-group">
                <label class="field-label">Waktu Acara</label>
                <input
                    type="text"
                    v-model="form.eventTime"
                    class="field-input"
                    placeholder="Contoh: 08:00 - 11:00 WIB"
                />
            </div>

            <div class="field-group">
                <label class="field-label">Lokasi Acara</label>
                <input
                    type="text"
                    v-model="form.venue"
                    class="field-input"
                    placeholder="Contoh: Gedung Serbaguna Mawar, Jakarta"
                />
            </div>

            <div class="field-group">
                <label class="field-label">Link Undangan</label>
                <input
                    type="text"
                    v-model="form.invitationLink"
                    class="field-input"
                    readonly
                    :placeholder="defaultLink"
                />
                <span class="field-hint"
                    >Otomatis dari slug undangan Anda. Tambahkan ?to=NamaTamu
                    saat kirim.</span
                >
            </div>

            <!-- Template Selection -->
            <div class="field-group">
                <label class="field-label">Pilih Template Pesan</label>
                <div class="template-options">
                    <button
                        v-for="(tmpl, idx) in messageTemplates"
                        :key="idx"
                        type="button"
                        class="tmpl-option"
                        :class="{
                            'tmpl-option--active': selectedTemplate === idx,
                        }"
                        @click="selectedTemplate = idx"
                    >
                        {{ tmpl.name }}
                    </button>
                </div>
            </div>

            <!-- Generated Message Preview -->
            <div class="field-group">
                <label class="field-label">Hasil Pesan</label>
                <textarea
                    ref="messageArea"
                    v-model="generatedMessage"
                    rows="10"
                    class="field-input field-textarea"
                    readonly
                ></textarea>
            </div>

            <div class="save-bar">
                <button type="button" class="btn-save" @click="copyMessage">
                    📋 Salin Pesan
                </button>
                <button
                    type="button"
                    class="btn-save"
                    style="background: #25d366"
                    @click="openWhatsApp"
                >
                    💬 Buka WhatsApp
                </button>
                <span v-if="copied" class="save-ok">✅ Tersalin!</span>
            </div>

            <!-- Save settings -->
            <div class="save-bar" style="border-top: none; padding-top: 0">
                <button
                    type="button"
                    class="btn-save"
                    style="background: #6366f1"
                    :disabled="saving"
                    @click="handleSave"
                >
                    <span v-if="saving">Menyimpan…</span>
                    <span v-else>💾 Simpan Template</span>
                </button>
                <span v-if="saved" class="save-ok">✅ Tersimpan!</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import "./section.css";

const store = useStore();
const saving = ref(false);
const saved = ref(false);
const copied = ref(false);
const selectedTemplate = ref(0);
const messageArea = ref(null);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);
const defaultLink = computed(
    () => `${window.location.origin}/wedding/${activeSlug.value || "slug"}`,
);

const form = ref({
    groomName: "",
    brideName: "",
    eventDate: "",
    eventTime: "",
    venue: "",
    invitationLink: "",
});

// Auto-set invitation link
watch(
    activeSlug,
    (slug) => {
        if (slug) {
            form.value.invitationLink = `${window.location.origin}/wedding/${slug}`;
        }
    },
    { immediate: true },
);

const messageTemplates = [
    {
        name: "🕌 Formal",
        template: `Assalamualaikum Wr. Wb.

Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami:

🤵 {groomName}
👰 {brideName}

📅 Tanggal: {eventDate}
⏰ Waktu: {eventTime}
📍 Tempat: {venue}

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.

Untuk informasi lebih lanjut, silakan buka undangan digital kami:
🔗 {invitationLink}

Atas perhatian dan kehadirannya, kami ucapkan terima kasih.

Wassalamualaikum Wr. Wb.
{groomName} & {brideName} 💒`,
    },
    {
        name: "🌸 Casual",
        template: `Hai! 👋

Kami dengan senang hati mengundang kamu untuk hadir di hari bahagia kami:

💕 {groomName} & {brideName} 💕

📅 {eventDate}
⏰ {eventTime}
📍 {venue}

Yuk buka undangan digitalnya di sini:
🔗 {invitationLink}

Ditunggu kehadirannya ya! 🎉

Salam hangat,
{groomName} & {brideName}`,
    },
    {
        name: "✨ Modern",
        template: `*Undangan Pernikahan* 💍

{groomName} & {brideName}

───────────────
📅 {eventDate}
⏰ {eventTime}
📍 {venue}
───────────────

Kami mengundang Anda untuk berbagi kebahagiaan di hari istimewa kami.

📨 Undangan Digital:
{invitationLink}

Konfirmasi kehadiran melalui link di atas.

Terima kasih 🙏
*{groomName} & {brideName}*`,
    },
    {
        name: "🎊 Singkat",
        template: `Halo! Kami mengundangmu ke pernikahan *{groomName} & {brideName}* 💒

📅 {eventDate} | ⏰ {eventTime}
📍 {venue}

Buka undangan: {invitationLink}

Ditunggu ya! 🤗`,
    },
];

const generatedMessage = computed(() => {
    const tmpl = messageTemplates[selectedTemplate.value];
    if (!tmpl) return "";
    const dateFormatted = form.value.eventDate
        ? new Date(form.value.eventDate + "T00:00:00").toLocaleDateString(
              "id-ID",
              {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
              },
          )
        : "(belum diisi)";

    return tmpl.template
        .replace(/\{groomName\}/g, form.value.groomName || "(Nama Pria)")
        .replace(/\{brideName\}/g, form.value.brideName || "(Nama Wanita)")
        .replace(/\{eventDate\}/g, dateFormatted)
        .replace(/\{eventTime\}/g, form.value.eventTime || "(belum diisi)")
        .replace(/\{venue\}/g, form.value.venue || "(belum diisi)")
        .replace(
            /\{invitationLink\}/g,
            form.value.invitationLink || defaultLink.value,
        );
});

function copyMessage() {
    navigator.clipboard.writeText(generatedMessage.value);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 2500);
}

function openWhatsApp() {
    const encoded = encodeURIComponent(generatedMessage.value);
    window.open(`https://wa.me/?text=${encoded}`, "_blank");
}

async function handleSave() {
    saving.value = true;
    try {
        await store.dispatch("settings/saveSettings", {
            waTemplate: {
                groomName: form.value.groomName,
                brideName: form.value.brideName,
                eventDate: form.value.eventDate,
                eventTime: form.value.eventTime,
                venue: form.value.venue,
                selectedTemplate: selectedTemplate.value,
            },
        });
        saved.value = true;
        setTimeout(() => {
            saved.value = false;
        }, 2500);
    } catch {
        alert("Gagal menyimpan. Silakan coba lagi.");
    } finally {
        saving.value = false;
    }
}

// Load saved data from store
onMounted(async () => {
    await store.dispatch("settings/fetchSettings");
    const s = store.getters["settings/settings"];
    if (s?.waTemplate) {
        form.value.groomName = s.waTemplate.groomName || "";
        form.value.brideName = s.waTemplate.brideName || "";
        form.value.eventDate = s.waTemplate.eventDate || "";
        form.value.eventTime = s.waTemplate.eventTime || "";
        form.value.venue = s.waTemplate.venue || "";
        selectedTemplate.value = s.waTemplate.selectedTemplate || 0;
    }
});
</script>

<style scoped>
.template-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tmpl-option {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--border, #d1d5db);
    background: var(--card, white);
    font-size: 0.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    color: var(--foreground, #374151);
}

.dark .tmpl-option {
    background: hsl(240 10% 12%);
    border-color: hsl(240 5% 25%);
    color: #e5e7eb;
}

.tmpl-option:hover {
    border-color: #10b981;
}

.tmpl-option--active {
    border-color: #10b981;
    background: #d1fae5;
    color: #065f46;
}

.dark .tmpl-option--active {
    background: hsl(160 40% 15%);
    border-color: #10b981;
    color: #6ee7b7;
}
</style>
