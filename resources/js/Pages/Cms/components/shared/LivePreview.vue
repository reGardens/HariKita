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
import { computed, watch, shallowRef, ref, nextTick } from "vue";
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
}

.mockup-image {
    width: 100%;
    height: auto;
    display: block;
    pointer-events: none;
    user-select: none;
    position: relative;
    z-index: 2;
}

.mockup-screen {
    position: absolute;
    top: 2.2%;
    left: 4.5%;
    right: 4.5%;
    bottom: 2.2%;
    border-radius: 2rem;
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
    /* Scale = mockup-screen-width / 375. For ~237px screen width: 237/375 = 0.632 */
    /* But we need to calculate based on container. Use a safe small scale */
    transform: scale(0.632);
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
        max-width: 230px;
    }
    .screen-viewport {
        transform: scale(0.56);
    }
    .mockup-placeholder {
        transform: scale(0.56);
        transform-origin: top left;
    }
}

@media (max-width: 768px) {
    .mockup-container {
        max-width: 200px;
    }
    .screen-viewport {
        transform: scale(0.49);
    }
    .mockup-placeholder {
        transform: scale(0.49);
        transform-origin: top left;
    }
}
</style>
