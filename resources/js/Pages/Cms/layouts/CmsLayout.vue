<template>
    <div class="cms-layout flex h-screen overflow-hidden bg-gray-100">
        <!-- Sidebar (hidden on mobile, shown on md+) -->
        <aside class="hidden md:flex flex-shrink-0">
            <SidebarNav />
        </aside>

        <!-- Mobile sidebar overlay -->
        <div v-if="mobileMenuOpen" class="fixed inset-0 z-40 flex md:hidden">
            <div
                class="fixed inset-0 bg-black/50"
                @click="mobileMenuOpen = false"
            ></div>
            <div class="relative z-50">
                <SidebarNav />
            </div>
        </div>

        <!-- Main content area -->
        <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
            <!-- Mobile top bar -->
            <header
                class="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 md:hidden"
            >
                <button
                    type="button"
                    class="p-1.5 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    aria-label="Open menu"
                    @click="mobileMenuOpen = true"
                >
                    <svg
                        class="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>
                <div class="flex-1 min-w-0">
                    <span
                        v-if="activeWedding"
                        class="text-lg font-semibold text-gray-800 truncate block"
                    >
                        {{ activeWedding.label }}
                    </span>
                    <span v-else class="text-lg font-semibold text-gray-800"
                        >Wedding CMS</span
                    >
                </div>
                <!-- Mobile preview toggle -->
                <button
                    type="button"
                    class="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50"
                    @click="previewOpen = !previewOpen"
                >
                    <svg
                        class="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                    </svg>
                </button>
            </header>

            <!-- Page content with optional live preview -->
            <main class="flex-1 overflow-y-auto">
                <div class="flex h-full">
                    <!-- Form area -->
                    <div
                        class="flex-1 overflow-y-auto p-6"
                        :class="{ 'xl:w-[60%]': showPreview }"
                    >
                        <div v-if="viewError" class="space-y-4">
                            <ErrorMessage
                                :message="viewError"
                                :retryable="true"
                                @retry="handleRetry"
                            />
                        </div>
                        <router-view v-else />
                    </div>

                    <!-- Live Preview (desktop) -->
                    <div
                        v-if="showPreview"
                        class="hidden xl:block w-[40%] border-l border-gray-200 bg-gray-50 overflow-y-auto p-4"
                    >
                        <LivePreview />
                    </div>
                </div>
            </main>
        </div>

        <!-- Mobile preview overlay -->
        <div
            v-if="previewOpen"
            class="fixed inset-0 z-50 xl:hidden flex items-center justify-center bg-black/60 p-4"
        >
            <div
                class="relative bg-white rounded-2xl p-4 max-h-[90vh] overflow-y-auto"
            >
                <button
                    type="button"
                    class="absolute top-2 right-2 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
                    @click="previewOpen = false"
                >
                    <svg
                        class="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
                <LivePreview />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onErrorCaptured } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import SidebarNav from "../components/shared/SidebarNav.vue";
import ErrorMessage from "../components/shared/ErrorMessage.vue";
import LivePreview from "../components/shared/LivePreview.vue";

const store = useStore();
const mobileMenuOpen = ref(false);
const previewOpen = ref(false);
const viewError = ref("");
const showPreview = ref(true);

const activeWedding = computed(() => store.getters["wedding/activeWedding"]);

onErrorCaptured((error) => {
    viewError.value =
        error?.message ||
        "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.";
    return false;
});

function handleRetry() {
    viewError.value = "";
}

const router = useRouter();
router.afterEach(() => {
    mobileMenuOpen.value = false;
    viewError.value = "";
});
</script>
