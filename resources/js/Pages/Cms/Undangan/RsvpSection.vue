<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import { useWeddingSlug } from "@/Composables/useWeddingSlug";
import RsvpSectionContent from "@/Pages/Cms/views/undangan/RsvpSection.vue";

defineOptions({ layout: CmsLayout });

const props = defineProps({ wedding: Object, rsvps: Array, slug: String });

useWeddingSlug(props.slug);
</script>

<template>
    <Head title="RSVP Online" />
    <RsvpSectionContent />
</template>
