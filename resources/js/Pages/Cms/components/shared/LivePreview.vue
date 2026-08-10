<template>
    <div class="live-preview-wrapper">
        <!-- iPhone Frame -->
        <div class="iphone-frame">
            <div class="iphone-island"></div>
            <div class="iphone-screen">
                <div class="iphone-viewport" ref="viewportRef">
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
                    <div v-else class="iphone-placeholder">
                        <span class="text-3xl">💒</span>
                        <p>Pilih template untuk melihat preview</p>
                    </div>
                </div>
            </div>
            <div class="iphone-home-indicator"></div>
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

// Scroll to relevant section when prop changes
watch(
    () => props.section,
    async (section) => {
        await nextTick();
        if (!viewportRef.value) return;
        // Try to find section element by data attribute or tag
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

.iphone-frame {
    width: 100%;
    max-width: 260px;
    aspect-ratio: 9 / 19.5;
    background: #1c1c1e;
    border-radius: 2.5rem;
    padding: 0.4rem;
    box-shadow:
        0 20px 50px -10px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.06) inset,
        0 0 0 2.5px #2c2c2e inset;
    display: flex;
    flex-direction: column;
    position: relative;
}

.iphone-island {
    width: 70px;
    height: 18px;
    background: #000;
    border-radius: 16px;
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

.iphone-screen {
    flex: 1;
    background: #fff;
    border-radius: 2.1rem;
    overflow: hidden;
    position: relative;
}

.iphone-viewport {
    width: 390px;
    height: 844px;
    transform-origin: top left;
    transform: scale(var(--viewport-scale, 0.6));
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
}

.iphone-viewport::-webkit-scrollbar {
    display: none;
}

.iphone-home-indicator {
    width: 90px;
    height: 3px;
    background: #636366;
    border-radius: 2px;
    margin: 5px auto 3px;
}

.iphone-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.75rem;
    color: #9ca3af;
    font-size: 0.8rem;
    text-align: center;
    padding: 1.5rem;
}

/* Responsive scaling */
@media (min-width: 1280px) {
    .iphone-frame {
        max-width: 240px;
    }
    .iphone-viewport {
        --viewport-scale: 0.56;
    }
}

@media (max-width: 1279px) {
    .iphone-frame {
        max-width: 220px;
    }
    .iphone-viewport {
        --viewport-scale: 0.52;
    }
}

@media (max-width: 768px) {
    .iphone-frame {
        max-width: 200px;
    }
    .iphone-viewport {
        --viewport-scale: 0.47;
    }
}
</style>
