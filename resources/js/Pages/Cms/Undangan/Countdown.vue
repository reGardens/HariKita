<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import CountdownContent from "@/Pages/Cms/views/undangan/Countdown.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, slug: String });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Countdown" />
    <CountdownContent />
</template>
