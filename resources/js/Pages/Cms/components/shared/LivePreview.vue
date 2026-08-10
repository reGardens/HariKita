<template>
    <div class="live-preview-wrapper">
        <div class="mockup-container">
            <img
                src="/images/iphone-mockup.png"
                alt="iPhone"
                class="mockup-image"
            />
            <div class="mockup-screen">
                <div class="screen-viewport" ref="viewportRef">
                    <component
                        v-if="resolvedTemplate"
                        :is="resolvedTemplate"
                        :couple="coupleData"
                        :events="eventsData"
                        :settings="settingsData"
                        :media="mediaData"
                        :slug="activeSlug"
                        :template-record="templateRecord"
                    />
                    <div v-else class="mockup-placeholder">
                        <span class="text-3xl">💒</span>
                        <p>Pilih template untuk melihat preview</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, watch, shallowRef, ref, nextTick, onMounted } from "vue";
import { useStore } from "vuex";
import { getTemplate } from "@/Pages/Landing/invitation/templates/index.js";

const props = defineProps({
    section: { type: String, default: "cover" },
});

const store = useStore();
const viewportRef = ref(null);

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);
const templateId = computed(() => store.getters["template/selectedId"]);
const coupleData = computed(() => store.getters["couple/couple"]);
const eventsData = computed(() => store.state.events?.items || []);
const settingsData = computed(() => store.getters["settings/settings"]);
const mediaData = computed(() => store.state.media?.items || []);
const templateRecord = computed(
    () => store.getters["template/selectedTemplate"],
);

const resolvedTemplate = shallowRef(null);

async function loadTemplate(id) {
    if (!id) {
        resolvedTemplate.value = null;
        return;
    }
    const tmpl = getTemplate(id);
    if (tmpl && tmpl.component) {
        try {
            const mod = await tmpl.component();
            resolvedTemplate.value = mod.default || mod;
        } catch {
            resolvedTemplate.value = null;
        }
    } else {
        try {
            const mod =
                await import("@/Pages/Landing/invitation/templates/universal/UniversalTemplate.vue");
            resolvedTemplate.value = mod.default || mod;
        } catch {
            resolvedTemplate.value = null;
        }
    }
}

watch(
    () => props.section,
    async (section) => {
        await nextTick();
        if (!viewportRef.value) return;
        const sectionIndex = {
            cover: 0,
            events: 1,
            story: 2,
            gallery: 3,
            countdown: 4,
            rsvp: 5,
            gift: 6,
            wishes: 7,
            wishlist: 7,
            guests: 1,
        };
        const idx = sectionIndex[section] || 0;
        const sections = viewportRef.value.querySelectorAll("section, footer");
        if (sections[idx]) {
            sections[idx].scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    },
    { immediate: true },
);

watch(templateId, (id) => loadTemplate(id), { immediate: true });
</script>

<style scoped>
.live-preview-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
}

.mockup-container {
    position: relative;
    width: 100%;
    max-width: 260px;
    /* Force aspect ratio 2:3 matching the image */
    aspect-ratio: 2 / 3;
}

.mockup-image {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    pointer-events: none;
    user-select: none;
    z-index: 2;
}

/*
 * Screen area calculation based on 1024x1536 image:
 * Estimated screen inset from image edges:
 *   top: ~115px / 1536 = 7.5%
 *   bottom: ~100px / 1536 = 6.5%
 *   left: ~115px / 1024 = 11.2%
 *   right: ~115px / 1024 = 11.2%
 * Screen width: 1024 - 230 = 794px → 794/1024 = 77.5%
 * Screen height: 1536 - 215 = 1321px → 1321/1536 = 86%
 */
.mockup-screen {
    position: absolute;
    top: 7.5%;
    bottom: 6.5%;
    left: 11.2%;
    right: 11.2%;
    border-radius: 1.2rem;
    overflow: hidden;
    z-index: 1;
}

.screen-viewport {
    position: absolute;
    top: 0;
    left: 0;
    width: 375px;
    height: 812px;
    transform-origin: top left;
    /* Container screen width ≈ 260 * 0.775 = 201px → scale = 201/375 = 0.536 */
    transform: scale(0.536);
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
}

.screen-viewport::-webkit-scrollbar {
    display: none;
}

.mockup-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 375px;
    height: 812px;
    gap: 0.75rem;
    color: #9ca3af;
    font-size: 0.875rem;
    text-align: center;
    padding: 2rem;
    background: #f9fafb;
}

@media (max-width: 1279px) {
    .mockup-container {
        max-width: 220px;
    }
    /* 220 * 0.775 = 170px → 170/375 = 0.453 */
    .screen-viewport {
        transform: scale(0.453);
    }
}

@media (max-width: 768px) {
    .mockup-container {
        max-width: 190px;
    }
    /* 190 * 0.775 = 147px → 147/375 = 0.392 */
    .screen-viewport {
        transform: scale(0.392);
    }
}
</style>
