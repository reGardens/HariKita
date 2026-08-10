<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import InfoAcaraContent from "@/Pages/Cms/views/undangan/InfoAcara.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, slug: String, events: Array });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Informasi Acara" />
    <InfoAcaraContent />
</template>
