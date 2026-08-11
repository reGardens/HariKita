import { useStore } from 'vuex';

/**
 * Sets the active wedding slug in Vuex store synchronously during setup.
 * Used by Inertia wrapper pages for undangan features.
 *
 * IMPORTANT: This must commit synchronously (not in onMounted) so that
 * child content components can access the slug in their own onMounted hooks.
 * Child onMounted fires before parent onMounted in Vue lifecycle.
 */
export function useWeddingSlug(slug) {
    const store = useStore();
    if (slug) {
        store.commit('wedding/SET_ACTIVE_SLUG', slug);
    }
}
