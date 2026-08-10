<template>
    <div class="live-preview-container">
        <!-- iPhone Mockup Frame -->
        <div class="iphone-frame">
            <!-- Dynamic Island -->
            <div class="iphone-island"></div>
            <!-- Screen -->
            <div class="iphone-screen">
                <div class="iphone-viewport">
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
            <!-- Home Indicator -->
            <div class="iphone-home-indicator"></div>
        </div>
    </div>
</template>

<script setup>
import { computed, watch, shallowRef } from "vue";
import { useStore } from "vuex";
import { getTemplate } from "@/Pages/Landing/invitation/templates/index.js";

const store = useStore();

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

watch(templateId, (id) => loadTemplate(id), { immediate: true });
</script>

<style scoped>
.live-preview-container {
    position: sticky;
    top: 1rem;
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
}

/* iPhone 15-style frame */
.iphone-frame {
    width: 280px;
    height: 572px;
    background: #1c1c1e;
    border-radius: 3rem;
    padding: 0.5rem;
    box-shadow:
        0 30px 60px -12px rgba(0, 0, 0, 0.35),
        0 0 0 1px rgba(255, 255, 255, 0.08) inset,
        0 0 0 3px #2c2c2e inset;
    display: flex;
    flex-direction: column;
    position: relative;
}

/* Dynamic Island */
.iphone-island {
    width: 85px;
    height: 22px;
    background: #000;
    border-radius: 20px;
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

.iphone-screen {
    flex: 1;
    background: #fff;
    border-radius: 2.5rem;
    overflow: hidden;
    position: relative;
}

.iphone-viewport {
    width: 390px;
    height: 844px;
    transform: scale(0.645);
    transform-origin: top left;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
}

.iphone-viewport::-webkit-scrollbar {
    display: none;
}

/* Home Indicator */
.iphone-home-indicator {
    width: 120px;
    height: 4px;
    background: #636366;
    border-radius: 2px;
    margin: 6px auto 4px;
}

.iphone-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.75rem;
    color: #9ca3af;
    font-size: 0.875rem;
    text-align: center;
    padding: 2rem;
}
</style>
