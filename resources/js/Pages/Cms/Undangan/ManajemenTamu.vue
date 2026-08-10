<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import ManajemenTamuContent from "@/Pages/Cms/views/undangan/ManajemenTamu.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, slug: String, guests: Array });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Manajemen Tamu" />
    <ManajemenTamuContent />
</template>
