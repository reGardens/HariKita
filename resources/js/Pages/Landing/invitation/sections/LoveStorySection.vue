<template>
  <section class="love-story-section px-4 py-16 md:py-24" data-aos="fade-up">
    <div class="mx-auto max-w-3xl">
      <h2
        class="mb-10 text-center text-2xl font-bold md:text-3xl"
        :style="{ color: primaryColor }"
      >
        Kisah Cinta Kami
      </h2>

      <ol class="relative space-y-8 border-l-2 pl-8 md:pl-10" :style="{ borderColor: primaryColor }">
        <li
          v-for="(milestone, index) in loveStory"
          :key="`${milestone.date || ''}-${milestone.title || index}`"
          class="relative rounded-xl bg-white/80 p-5 shadow-md backdrop-blur-sm"
          data-aos="fade-up"
        >
          <span
            class="absolute -left-[2.6rem] top-6 flex h-5 w-5 items-center justify-center rounded-full border-4 border-white md:-left-[3.1rem]"
            :style="{ backgroundColor: primaryColor }"
            aria-hidden="true"
          ></span>
          <time v-if="milestone.date" class="text-sm font-semibold" :style="{ color: primaryColor }">
            {{ milestone.date }}
          </time>
          <h3 v-if="milestone.title" class="mt-1 text-xl font-bold text-gray-800">
            {{ milestone.title }}
          </h3>
          <p v-if="milestone.description" class="mt-2 whitespace-pre-line leading-relaxed text-gray-600">
            {{ milestone.description }}
          </p>
        </li>
      </ol>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  loveStory: {
    type: Array,
    default: () => [],
  },
  themeColors: {
    type: Object,
    default: () => ({}),
  },
});

const primaryColor = computed(() => props.themeColors?.primary || "#8B4513");
</script>
