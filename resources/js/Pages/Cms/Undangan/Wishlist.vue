<script setup>
import { Head } from "@inertiajs/vue3";
import CmsLayout from "@/Layouts/CmsLayout.vue";
import WishlistContent from "@/Pages/Cms/views/undangan/Wishlist.vue";

defineOptions({ layout: CmsLayout });

defineProps({ wedding: Object, slug: String });
</script>

<template>
    <Head title="Wishlist Hadiah" />
    <WishlistContent />
</template>
