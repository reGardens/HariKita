<template>
    <div class="live-preview-wrapper">
        <div class="mockup-container" ref="containerRef">
            <img
                src="/images/iphone-mockup.png"
                alt="iPhone"
                class="mockup-image"
            />
            <div class="mockup-screen">
                <div
                    class="screen-viewport"
                    ref="viewportRef"
                    :style="viewportStyle"
                >
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
import {
    computed,
    watch,
    shallowRef,
    ref,
    nextTick,
    onMounted,
    onUnmounted,
} from "vue";
import { useStore } from "vuex";
import { getTemplate } from "@/Pages/Landing/invitation/templates/index.js";

const props = defineProps({
    section: { type: String, default: "cover" },
});

const store = useStore();
const containerRef = ref(null);
const viewportRef = ref(null);
const scale = ref(0.5);

const BASE_WIDTH = 375;

// Screen area is 78% of container width based on 1024×1536 mockup
function updateScale() {
    if (!containerRef.value) return;
    const containerWidth = containerRef.value.offsetWidth;
    // Screen visible area ≈ 76% of container width (11% bezel each side + 1% safe margin)
    const screenWidth = containerWidth * 0.76;
    scale.value = screenWidth / BASE_WIDTH;
}

const viewportStyle = computed(() => ({
    transform: `scale(${scale.value})`,
    transformOrigin: "top left",
}));

let resizeObserver;
onMounted(() => {
    updateScale();
    if (window.ResizeObserver && containerRef.value) {
        resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(containerRef.value);
    }
    window.addEventListener("resize", updateScale);
});

onUnmounted(() => {
    if (resizeObserver) resizeObserver.disconnect();
    window.removeEventListener("resize", updateScale);
});

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
    max-width: 280px;
    aspect-ratio: 1024 / 1536;
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
 * Screen inset (in %):
 * left/right: 11% (bezels)
 * top: 7.5% (bezel + notch area kept but content shows behind)
 * bottom: 6.5% (home indicator area)
 * → Screen visible area: 78% wide × 86% tall of container
 */
.mockup-screen {
    position: absolute;
    top: 7.5%;
    bottom: 6.5%;
    left: 12%;
    right: 12%;
    border-radius: 1.5rem;
    overflow: hidden;
    z-index: 1;
    background: white;
}

.screen-viewport {
    position: absolute;
    top: 0;
    left: 0;
    width: 375px;
    height: 812px;
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
</style>
