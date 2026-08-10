<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import GenerateTextContent from "@/Pages/Cms/views/undangan/GenerateText.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, slug: String });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="Generate Text" />
    <GenerateTextContent />
</template>
