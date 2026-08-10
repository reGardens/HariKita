<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import TemaPilihanContent from "@/Pages/Cms/views/undangan/TemaPilihan.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, templates: Array, slug: String });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Tema & Template" />
    <TemaPilihanContent />
</template>
