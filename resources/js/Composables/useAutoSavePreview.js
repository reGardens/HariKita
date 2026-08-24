import { watch } from 'vue';
import { useStore } from 'vuex';

/**
 * Watch form data and debounce auto-save + preview refresh.
 * After user stops changing data for `delay` ms, calls saveFn() then bumps preview.
 *
 * @param {import('vue').Ref} formData - reactive form ref to watch (deep)
 * @param {Function} saveFn - async function that saves form data to API
 * @param {Object} options - { delay: number (default 2000), immediate: boolean }
 */
export function useAutoSavePreview(formData, saveFn, options = {}) {
    const { delay = 2000 } = options;
    const store = useStore();
    let timer = null;
    let skipNext = false;

    // Allow skipping the next watch trigger (e.g. after initial load)
    function skipNextWatch() {
        skipNext = true;
    }

    watch(
        formData,
        () => {
            if (skipNext) {
                skipNext = false;
                return;
            }
            if (timer) clearTimeout(timer);
            timer = setTimeout(async () => {
                try {
                    await saveFn();
                    store.commit('wedding/BUMP_PREVIEW');
                } catch (err) {
                    // Silent fail on auto-save — user can still manually save
                    console.error('Auto-save failed:', err);
                }
            }, delay);
        },
        { deep: true }
    );

    return { skipNextWatch };
}
