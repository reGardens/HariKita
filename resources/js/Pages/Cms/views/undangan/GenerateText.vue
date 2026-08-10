<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">✍️</span>
                <div>
                    <h2 class="section-title">Generate Text</h2>
                    <p class="section-desc">
                        Buat teks undangan untuk dibagikan ke berbagai platform
                    </p>
                </div>
            </div>

            <!-- Template Options -->
            <div class="field-group">
                <label class="field-label">Pilih Template</label>
                <div class="tmpl-options">
                    <button
                        v-for="(tmpl, idx) in templates"
                        :key="idx"
                        type="button"
                        class="tmpl-btn"
                        :class="{ 'tmpl-btn--active': selected === idx }"
                        @click="selected = idx"
                    >
                        {{ tmpl.name }}
                    </button>
                </div>
            </div>

            <!-- Generated Text -->
            <div class="field-group">
                <label class="field-label">Hasil Teks</label>
                <textarea
                    v-model="generatedText"
                    rows="12"
                    class="field-input field-textarea"
                    readonly
                ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="action-bar">
                <button
                    type="button"
                    class="action-btn action-btn--copy"
                    @click="copyText"
                >
                    📋 Salin
                </button>
                <button
                    type="button"
                    class="action-btn action-btn--wa"
                    @click="share('whatsapp')"
                >
                    💬 WhatsApp
                </button>
                <button
                    type="button"
                    class="action-btn action-btn--tele"
                    @click="share('telegram')"
                >
                    ✈️ Telegram
                </button>
                <button
                    type="button"
                    class="action-btn action-btn--email"
                    @click="share('email')"
                >
                    📧 Email
                </button>
                <button
                    type="button"
                    class="action-btn action-btn--x"
                    @click="share('x')"
                >
                    𝕏 Twitter
                </button>
            </div>

            <span v-if="copied" class="save-ok">✅ Tersalin ke clipboard!</span>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useStore } from "vuex";
import "./section.css";

const store = useStore();
const selected = ref(0);
const copied = ref(false);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);
const coupleData = computed(() => store.getters["couple/couple"]);
const eventsData = computed(() => store.state.events?.items || []);
const invitationLink = computed(
    () => `${window.location.origin}/wedding/${activeSlug.value || "undangan"}`,
);

const groomName = computed(
    () =>
        coupleData.value?.groom?.nickname ||
        coupleData.value?.groom?.fullName ||
        "Mempelai Pria",
);
const brideName = computed(
    () =>
        coupleData.value?.bride?.nickname ||
        coupleData.value?.bride?.fullName ||
        "Mempelai Wanita",
);
const eventDate = computed(() => {
    const ev = eventsData.value[0];
    if (!ev?.date) return "(tanggal belum diisi)";
    return new Date(ev.date + "T00:00:00").toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
});
const eventTime = computed(
    () => eventsData.value[0]?.start_time || "(waktu belum diisi)",
);
const venue = computed(
    () => eventsData.value[0]?.location_name || "(lokasi belum diisi)",
);

const templates = [
    {
        name: "🕌 Formal",
        body: `Assalamualaikum Wr. Wb.

Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud mengundang Bapak/Ibu/Saudara/i untuk menghadiri pernikahan kami:

🤵 {groom} & 👰 {bride}

📅 {date}
⏰ {time}
📍 {venue}

Undangan digital: {link}

Atas kehadiran dan doanya, kami ucapkan terima kasih.
Wassalamualaikum Wr. Wb.`,
    },
    {
        name: "🌸 Casual",
        body: `Hai! 👋

Kami mengundangmu ke pernikahan:
💕 {groom} & {bride} 💕

📅 {date}
⏰ {time}
📍 {venue}

Buka undangan: {link}

Ditunggu ya! 🎉`,
    },
    {
        name: "✨ Modern",
        body: `*Undangan Pernikahan* 💍

{groom} & {bride}

━━━━━━━━━━━
📅 {date}
⏰ {time}
📍 {venue}
━━━━━━━━━━━

📨 {link}

Terima kasih 🙏`,
    },
    {
        name: "🎊 Singkat",
        body: `Undangan pernikahan {groom} & {bride} 💒
📅 {date} ⏰ {time}
📍 {venue}
🔗 {link}`,
    },
];

const generatedText = computed(() => {
    return templates[selected.value].body
        .replace(/\{groom\}/g, groomName.value)
        .replace(/\{bride\}/g, brideName.value)
        .replace(/\{date\}/g, eventDate.value)
        .replace(/\{time\}/g, eventTime.value)
        .replace(/\{venue\}/g, venue.value)
        .replace(/\{link\}/g, invitationLink.value);
});

function copyText() {
    navigator.clipboard.writeText(generatedText.value);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 2500);
}

function share(platform) {
    const text = encodeURIComponent(generatedText.value);
    const url = encodeURIComponent(invitationLink.value);
    let shareUrl = "";

    switch (platform) {
        case "whatsapp":
            shareUrl = `https://wa.me/?text=${text}`;
            break;
        case "telegram":
            shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
            break;
        case "email":
            shareUrl = `mailto:?subject=${encodeURIComponent(`Undangan Pernikahan ${groomName.value} & ${brideName.value}`)}&body=${text}`;
            break;
        case "x":
            shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
            break;
    }

    if (shareUrl) window.open(shareUrl, "_blank");
}

onMounted(() => {
    if (activeSlug.value) {
        store.dispatch("couple/fetchCouple");
        store.dispatch("events/fetchEvents");
    }
});
</script>

<style scoped>
.tmpl-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.tmpl-btn {
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

.dark .tmpl-btn {
    background: hsl(240 10% 12%);
    border-color: hsl(240 5% 25%);
    color: #e5e7eb;
}

.tmpl-btn:hover {
    border-color: #10b981;
}

.tmpl-btn--active {
    border-color: #10b981;
    background: #d1fae5;
    color: #065f46;
}

.dark .tmpl-btn--active {
    background: hsl(160 40% 15%);
    border-color: #10b981;
    color: #6ee7b7;
}

.action-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.action-btn {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    border: none;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    color: white;
    transition: opacity 0.15s;
}

.action-btn:hover {
    opacity: 0.85;
}

.action-btn--copy {
    background: #6366f1;
}
.action-btn--wa {
    background: #25d366;
}
.action-btn--tele {
    background: #0088cc;
}
.action-btn--email {
    background: #ea580c;
}
.action-btn--x {
    background: #1d1d1f;
}
</style>
