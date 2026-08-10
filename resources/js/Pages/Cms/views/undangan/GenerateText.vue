<template>
    <div class="section-layout">
        <div class="section-form">
            <div class="section-header">
                <span class="section-icon">✍️</span>
                <div>
                    <h2 class="section-title">Generate Text</h2>
                    <p class="section-desc">
                        Paste template teks undangan lalu bagikan
                    </p>
                </div>
            </div>

            <!-- Text Area -->
            <div class="field-group">
                <textarea
                    v-model="generatedText"
                    rows="14"
                    class="field-input field-textarea"
                    placeholder="Paste teks undangan Anda di sini..."
                ></textarea>
            </div>

            <!-- Action Buttons -->
            <div class="action-bar">
                <button type="button" class="btn-save" @click="copyText">
                    📋 Salin Template Text
                </button>
                <button
                    type="button"
                    class="btn-save btn-share"
                    @click="showShareModal = true"
                >
                    🔗 Bagikan
                </button>
                <span v-if="copied" class="save-ok">✅ Tersalin!</span>
            </div>
        </div>

        <!-- Share Modal -->
        <div
            v-if="showShareModal"
            class="modal-overlay"
            @click.self="showShareModal = false"
        >
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Bagikan Via</h3>
                    <button @click="showShareModal = false" class="modal-close">
                        ✕
                    </button>
                </div>
                <div class="modal-body">
                    <button class="share-item" @click="share('whatsapp')">
                        <span class="share-icon share-icon--wa">💬</span>
                        <span>WhatsApp</span>
                    </button>
                    <button class="share-item" @click="share('telegram')">
                        <span class="share-icon share-icon--tele">✈️</span>
                        <span>Telegram</span>
                    </button>
                    <button class="share-item" @click="share('email')">
                        <span class="share-icon share-icon--email">📧</span>
                        <span>Email</span>
                    </button>
                    <button class="share-item" @click="share('x')">
                        <span class="share-icon share-icon--x">𝕏</span>
                        <span>Twitter / X</span>
                    </button>
                    <button class="share-item" @click="share('facebook')">
                        <span class="share-icon share-icon--fb">📘</span>
                        <span>Facebook</span>
                    </button>
                    <button class="share-item" @click="share('line')">
                        <span class="share-icon share-icon--line">💚</span>
                        <span>LINE</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useStore } from "vuex";
import "./section.css";

const store = useStore();
const copied = ref(false);
const showShareModal = ref(false);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);
const invitationLink = computed(
    () => `${window.location.origin}/wedding/${activeSlug.value || "undangan"}`,
);

const generatedText = ref("");

function copyText() {
    if (!generatedText.value) {
        alert("Paste teks undangan terlebih dahulu");
        return;
    }
    const el = document.createElement("textarea");
    el.value = generatedText.value;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    el.setSelectionRange(0, 99999);
    document.execCommand("copy");
    document.body.removeChild(el);
    copied.value = true;
    setTimeout(() => {
        copied.value = false;
    }, 2500);
}

function share(platform) {
    if (!generatedText.value) {
        alert("Paste teks undangan terlebih dahulu");
        return;
    }
    const text = encodeURIComponent(generatedText.value);
    const url = encodeURIComponent(invitationLink.value);
    const title = encodeURIComponent("Undangan Pernikahan");
    let shareUrl = "";

    switch (platform) {
        case "whatsapp":
            shareUrl = `https://api.whatsapp.com/send?text=${text}`;
            break;
        case "telegram":
            shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
            break;
        case "email":
            shareUrl = `mailto:?subject=${title}&body=${text}`;
            break;
        case "x":
            shareUrl = `https://twitter.com/intent/tweet?text=${text}`;
            break;
        case "facebook":
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case "line":
            shareUrl = `https://social-plugins.line.me/lineit/share?url=${url}&text=${text}`;
            break;
    }

    if (shareUrl) window.open(shareUrl, "_blank");
    showShareModal.value = false;
}
</script>

<style scoped>
.action-bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.btn-share {
    background: #6366f1;
}
.btn-share:hover {
    background: #4f46e5;
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 50;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.modal-content {
    background: var(--card, white);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: 1rem;
    width: 100%;
    max-width: 360px;
    overflow: hidden;
    box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.3);
}

.dark .modal-content {
    background: hsl(240 10% 12%);
    border-color: hsl(240 5% 20%);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--border, #e5e7eb);
}

.dark .modal-header {
    border-color: hsl(240 5% 20%);
}

.modal-header h3 {
    font-size: 1rem;
    font-weight: 700;
    color: var(--foreground, #111827);
}

.dark .modal-header h3 {
    color: #f9fafb;
}

.modal-close {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: none;
    background: var(--card, #f3f4f6);
    cursor: pointer;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--foreground, #6b7280);
}

.dark .modal-close {
    background: hsl(240 10% 18%);
    color: #9ca3af;
}

.modal-body {
    padding: 1rem 1.25rem;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
}

.share-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1rem 0.5rem;
    border-radius: 0.75rem;
    border: 1px solid var(--border, #e5e7eb);
    background: var(--card, #f9fafb);
    cursor: pointer;
    transition: all 0.15s;
    font-size: 0.75rem;
    font-weight: 500;
    color: var(--foreground, #374151);
}

.dark .share-item {
    background: hsl(240 10% 14%);
    border-color: hsl(240 5% 22%);
    color: #e5e7eb;
}

.share-item:hover {
    border-color: #10b981;
    transform: translateY(-1px);
}

.share-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.share-icon--wa {
    background: #dcfce7;
}
.share-icon--tele {
    background: #dbeafe;
}
.share-icon--email {
    background: #ffedd5;
}
.share-icon--x {
    background: #f3f4f6;
}
.share-icon--fb {
    background: #dbeafe;
}
.share-icon--line {
    background: #dcfce7;
}

.dark .share-icon--wa {
    background: hsl(140 30% 15%);
}
.dark .share-icon--tele {
    background: hsl(210 30% 15%);
}
.dark .share-icon--email {
    background: hsl(30 30% 15%);
}
.dark .share-icon--x {
    background: hsl(240 10% 18%);
}
.dark .share-icon--fb {
    background: hsl(210 30% 15%);
}
.dark .share-icon--line {
    background: hsl(140 30% 15%);
}
</style>
