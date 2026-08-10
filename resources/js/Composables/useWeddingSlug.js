import { onMounted } from 'vue';
import { useStore } from 'vuex';

/**
 * Sets the active wedding slug in Vuex store on mount.
 * Used by Inertia wrapper pages for undangan features.
 */
export function useWeddingSlug(slug) {
    const store = useStore();
    onMounted(() => {
        if (slug) {
            store.commit('wedding/SET_ACTIVE_SLUG', slug);
        }
    });
}
