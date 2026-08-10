<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import LiveStreamingContent from "@/Pages/Cms/views/undangan/LiveStreaming.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, slug: String });
</script>

<template>
    <Head title="Live Streaming" />
    <LiveStreamingContent />
</template>
