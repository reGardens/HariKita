<template>
    <div class="preview-wrapper">
        <div class="phone-frame">
            <div class="phone-iframe-container">
                <iframe
                    v-if="previewUrl"
                    :key="`${previewUrl}-${iframeKey}`"
                    :src="previewUrl"
                    class="phone-iframe"
                    frameborder="0"
                    scrolling="no"
                ></iframe>
                <div v-else class="phone-placeholder">
                    <span class="text-3xl">💒</span>
                    <p>Belum ada undangan</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useStore } from "vuex";
import { usePage } from "@inertiajs/vue3";

defineProps({
    section: { type: String, default: "cover" },
});

const store = useStore();
const page = usePage();

const activeSlug = computed(() => store.getters["wedding/activeSlug"]);
const selectedTemplateId = computed(() => store.getters["template/selectedId"]);
const previewVersion = computed(() => store.getters["wedding/previewVersion"]);

// On Tema page, show the demo for the selected template.
// On other pages, show the user's actual wedding.
const isOnTemaPage = computed(() => {
    return page.url?.includes("/undangan/tema");
});

// Use a cache-busting key to force iframe reload on save
const iframeKey = ref(0);
watch(previewVersion, () => {
    iframeKey.value++;
});

const previewUrl = computed(() => {
    if (isOnTemaPage.value && selectedTemplateId.value) {
        return `/wedding/demo-${selectedTemplateId.value}`;
    }
    return activeSlug.value ? `/wedding/${activeSlug.value}` : "";
});
</script>

<style scoped>
.preview-wrapper {
    display: flex;
    justify-content: center;
    width: 100%;
    padding: 1rem 0;
}

.phone-frame {
    width: 320px;
    height: 650px;
    border: 8px solid #1c1c1e;
    border-radius: 2.5rem;
    overflow: hidden;
    box-shadow: 0 20px 50px -10px rgba(0, 0, 0, 0.3);
    background: #000;
    position: relative;
}

.phone-frame::before {
    content: "";
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 20px;
    background: #1c1c1e;
    border-radius: 10px;
    z-index: 10;
}

.phone-iframe-container {
    width: 100%;
    height: 100%;
    border-radius: 2rem;
    overflow: hidden;
    background: white;
}

.phone-iframe {
    width: 375px;
    height: 812px;
    border: none;
    transform-origin: top left;
    transform: scale(0.82);
}

.phone-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 0.75rem;
    color: #9ca3af;
    font-size: 0.8rem;
    text-align: center;
    padding: 1rem;
    background: #f9fafb;
}

@media (max-width: 1279px) {
    .phone-frame {
        width: 280px;
        height: 570px;
    }
    .phone-iframe {
        transform: scale(0.72);
    }
}

@media (max-width: 768px) {
    .phone-frame {
        width: 260px;
        height: 530px;
    }
    .phone-iframe {
        transform: scale(0.67);
    }
}
</style>
