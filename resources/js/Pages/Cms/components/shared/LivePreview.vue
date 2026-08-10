<template>
    <div class="live-preview-wrapper">
        <!-- iPhone Mockup using real image -->
        <div class="mockup-container">
            <img
                src="/images/iphone-mockup.png"
                alt="iPhone"
                class="mockup-image"
            />
            <!-- Screen content overlay -->
            <div class="mockup-screen" ref="viewportRef">
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

/* Screen area positioned inside the mockup image */
.mockup-screen {
    position: absolute;
    /* Adjust these values to match your mockup image's screen area */
    top: 3.8%;
    left: 5.8%;
    width: 88.4%;
    height: 92.5%;
    border-radius: 2rem;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    z-index: 1;
}

.mockup-screen::-webkit-scrollbar {
    display: none;
}

.mockup-placeholder {
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
    background: #f9fafb;
}

/* Responsive sizing */
@media (min-width: 1280px) {
    .mockup-container {
        max-width: 260px;
    }
}

@media (max-width: 1279px) {
    .mockup-container {
        max-width: 240px;
    }
}

@media (max-width: 768px) {
    .mockup-container {
        max-width: 220px;
    }
}
</style>
