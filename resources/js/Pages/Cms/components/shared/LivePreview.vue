<template>
    <div class="live-preview-container">
        <!-- Phone Mockup Frame -->
        <div class="phone-mockup">
            <div class="phone-notch"></div>
            <div class="phone-screen" ref="screenRef">
                <div class="phone-content">
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
                    <div v-else class="phone-placeholder">
                        <span class="text-3xl">💒</span>
                        <p>Pilih template untuk melihat preview</p>
                    </div>
                </div>
            </div>
            <div class="phone-home-bar"></div>
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
const eventsData = computed(() => store.state.events.items || []);
const settingsData = computed(() => store.getters["settings/settings"]);
const mediaData = computed(() => store.state.media.items || []);
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
        // Fallback to universal
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
    top: 1.5rem;
    display: flex;
    justify-content: center;
    padding: 1rem 0;
}

.phone-mockup {
    width: 280px;
    height: 560px;
    background: #1a1a1a;
    border-radius: 2.5rem;
    padding: 0.75rem;
    box-shadow:
        0 25px 50px -12px rgba(0, 0, 0, 0.25),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    position: relative;
}

.phone-notch {
    width: 80px;
    height: 20px;
    background: #1a1a1a;
    border-radius: 0 0 1rem 1rem;
    margin: 0 auto;
    position: absolute;
    top: 0.75rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
}

.phone-screen {
    flex: 1;
    background: white;
    border-radius: 1.75rem;
    overflow: hidden;
    position: relative;
}

.phone-content {
    width: 375px;
    height: 667px;
    transform: scale(0.68);
    transform-origin: top left;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
}

.phone-content::-webkit-scrollbar {
    display: none;
}

.phone-home-bar {
    width: 100px;
    height: 4px;
    background: #666;
    border-radius: 2px;
    margin: 0.5rem auto 0;
}

.phone-placeholder {
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
