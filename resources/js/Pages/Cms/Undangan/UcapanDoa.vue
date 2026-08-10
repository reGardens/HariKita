<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import UcapanDoaContent from "@/Pages/Cms/views/undangan/UcapanDoa.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, slug: String, wishes: Array });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Ucapan & Doa" />
    <UcapanDoaContent />
</template>
