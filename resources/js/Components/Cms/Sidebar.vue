<script setup>
import { ref, computed, watch } from "vue";
import { Link, usePage } from "@inertiajs/vue3";
import IconComponent from "@/Components/IconComponent/IconComponent.vue";
import { useI18n } from "@/Composables/useI18n";

const { t, locale } = useI18n();
const page = usePage();

const auth = computed(() => page.props.auth);
const userRoles = computed(() => auth.value?.user?.roles || []);

function hasRole(role) {
    return userRoles.value.includes(role);
}

function isActive(path) {
    if (path === "/cms/templates") {
        return (
            page.url === "/cms/templates" ||
            page.url.startsWith("/cms/templates?")
        );
    }
    return page.url === path || page.url.startsWith(path + "/");
}

// Track which menus the user has already visited (persisted in localStorage)
const SEEN_KEY = "cms-sidebar-seen";
function loadSeen() {
    try {
        return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
    } catch {
        return {};
    }
}
const seenMenus = ref(loadSeen());

function markSeen(path) {
    seenMenus.value[path] = true;
    localStorage.setItem(SEEN_KEY, JSON.stringify(seenMenus.value));
}

// Mark current page as seen whenever URL changes
watch(
    () => page.url,
    (url) => {
        if (url) markSeen(url);
    },
    { immediate: true },
);

function shouldShowDot(item) {
    return item.filled;
}

// Expandable menu state
const expandedMenus = ref({
    homepage: true,
});

function toggleMenu(key) {
    expandedMenus.value[key] = !expandedMenus.value[key];
}

/**
 * Menu structure with labels (groups) and items.
 * Sub-menus are items with 'children' array.
 */
const menuGroups = computed(() => {
    // Get wedding slug for regular user (from page props)
    const wedding = page.props.wedding;
    const slug = wedding?.slug || "";

    // Detect which menus have meaningful data filled (from Inertia shared props).
    // Backend returns booleans; blank auto-created records return false.
    const weddingData = page.props.weddingData || {};
    const hasEvents = !!weddingData.events;
    const hasGuests = !!weddingData.guests;
    const hasMedia = !!weddingData.media;
    const hasCountdown = !!weddingData.countdown;
    const hasAmplop = !!weddingData.amplop;
    const hasStreaming = !!weddingData.streaming;
    const hasLoveStory = !!weddingData.loveStory;
    const hasWishlist = !!weddingData.wishlist;
    const hasTheme = !!weddingData.settings;

    return [
        {
            label: locale.value === "id" ? "Navigasi Utama" : "Main Navigation",
            items: [
                {
                    label: t("nav.dashboard"),
                    href: "/cms/dashboard",
                    icon: "LayoutDashboard",
                    visible: true,
                },
            ],
        },
        {
            label:
                locale.value === "id"
                    ? "Undangan Digital"
                    : "Digital Invitation",
            items: [
                {
                    label:
                        locale.value === "id"
                            ? "Generate Text"
                            : "Generate Text",
                    href: `/cms/${slug}/undangan/pesan-wa`,
                    icon: "FileText",
                    visible: !!slug,
                },
                {
                    label:
                        locale.value === "id"
                            ? "Tema & Template"
                            : "Theme & Template",
                    href: `/cms/${slug}/undangan/tema`,
                    icon: "Palette",
                    visible: !!slug,
                    filled: hasTheme,
                },
                {
                    label: "RSVP Online",
                    href: `/cms/${slug}/undangan/rsvp`,
                    icon: "Mail",
                    visible: !!slug,
                },
                {
                    label:
                        locale.value === "id"
                            ? "Informasi Acara"
                            : "Event Info",
                    href: `/cms/${slug}/undangan/acara`,
                    icon: "Calendar",
                    visible: !!slug,
                    filled: hasEvents,
                },
                {
                    label: "Love Story",
                    href: `/cms/${slug}/undangan/love-story`,
                    icon: "Book",
                    visible: !!slug,
                    filled: hasLoveStory,
                },
                {
                    label:
                        locale.value === "id"
                            ? "Manajemen Tamu"
                            : "Guest Management",
                    href: `/cms/${slug}/undangan/tamu`,
                    icon: "UsersGroup",
                    visible: !!slug,
                    filled: hasGuests,
                },
                {
                    label:
                        locale.value === "id"
                            ? "Amplop Digital"
                            : "Digital Envelope",
                    href: `/cms/${slug}/undangan/amplop`,
                    icon: "CreditCard",
                    visible: !!slug,
                    filled: hasAmplop,
                },
                {
                    label:
                        locale.value === "id" ? "Galeri Foto" : "Photo Gallery",
                    href: `/cms/${slug}/undangan/galeri`,
                    icon: "Photo",
                    visible: !!slug,
                    filled: hasMedia,
                },
                {
                    label: "Countdown",
                    href: `/cms/${slug}/undangan/countdown`,
                    icon: "Clock",
                    visible: !!slug,
                    filled: hasCountdown,
                },
                {
                    label:
                        locale.value === "id"
                            ? "Live Streaming"
                            : "Live Streaming",
                    href: `/cms/${slug}/undangan/streaming`,
                    icon: "Video",
                    visible: !!slug,
                    filled: hasStreaming,
                },
                {
                    label:
                        locale.value === "id" ? "QR Check-in" : "QR Check-in",
                    href: `/cms/${slug}/undangan/qr-checkin`,
                    icon: "Qrcode",
                    visible: !!slug,
                },
                {
                    label:
                        locale.value === "id"
                            ? "Ucapan & Doa"
                            : "Wishes & Prayers",
                    href: `/cms/${slug}/undangan/ucapan`,
                    icon: "Message",
                    visible: !!slug,
                },
                {
                    label:
                        locale.value === "id"
                            ? "Wishlist Hadiah"
                            : "Gift Wishlist",
                    href: `/cms/${slug}/undangan/wishlist`,
                    icon: "Gift",
                    visible: !!slug,
                    filled: hasWishlist,
                },
            ],
        },
        {
            label:
                locale.value === "id" ? "Akses & Pengguna" : "Access & Users",
            items: [
                {
                    label:
                        locale.value === "id" ? "Kelola Peran" : "Manage Roles",
                    href: "/cms/roles",
                    icon: "Shield",
                    visible: hasRole("super-admin"),
                },
                {
                    label:
                        locale.value === "id"
                            ? "Kelola Pengguna"
                            : "Manage Users",
                    href: "/cms/users",
                    icon: "Users",
                    visible: hasRole("super-admin"),
                },
                {
                    label:
                        locale.value === "id"
                            ? "ACL Fitur User"
                            : "User Feature ACL",
                    href: "/cms/acl",
                    icon: "Lock",
                    visible: hasRole("super-admin"),
                },
                {
                    label:
                        locale.value === "id"
                            ? "Template Kustom"
                            : "Custom Templates",
                    href: "/cms/templates",
                    icon: "Template",
                    visible: hasRole("super-admin"),
                },
            ],
        },
    ];
});

const visibleGroups = computed(() =>
    menuGroups.value
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => item.visible !== false),
        }))
        .filter((group) => group.items.length > 0),
);
</script>

<template>
    <nav class="flex flex-col gap-1 p-3 overflow-y-auto">
        <template v-for="group in visibleGroups" :key="group.label">
            <!-- Group Label -->
            <p
                class="px-3 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70"
            >
                {{ group.label }}
            </p>

            <template v-for="item in group.items" :key="item.href || item.key">
                <!-- Item with children (expandable sub-menu) -->
                <template v-if="item.children">
                    <button
                        @click="toggleMenu(item.key)"
                        :class="[
                            'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full text-left',
                            item.children.some((c) => isChildActive(c))
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400',
                        ]"
                    >
                        <IconComponent
                            :name="item.icon"
                            class="h-4 w-4 flex-shrink-0"
                        />
                        <span class="truncate flex-1">{{ item.label }}</span>
                        <IconComponent
                            v-if="expandedMenus[item.key]"
                            name="ChevronDown"
                            class="h-3.5 w-3.5 opacity-50"
                        />
                        <IconComponent
                            v-else
                            name="ChevronRight"
                            class="h-3.5 w-3.5 opacity-50"
                        />
                    </button>

                    <!-- Sub-menu items -->
                    <div
                        v-if="expandedMenus[item.key]"
                        class="ml-4 pl-3 border-l border-border/50 space-y-0.5 mt-0.5"
                    >
                        <Link
                            v-for="child in item.children"
                            :key="child.href"
                            :href="child.href"
                            :class="[
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                isChildActive(child)
                                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 dark:bg-emerald-500'
                                    : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400',
                            ]"
                        >
                            <IconComponent
                                :name="child.icon"
                                class="h-3.5 w-3.5 flex-shrink-0"
                            />
                            <span class="truncate">{{ child.label }}</span>
                        </Link>
                    </div>
                </template>

                <!-- Regular item (no children) -->
                <a
                    v-else-if="item.external"
                    :href="item.href"
                    :class="[
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400',
                    ]"
                >
                    <IconComponent
                        :name="item.icon"
                        class="h-4 w-4 flex-shrink-0"
                    />
                    <span class="truncate">{{ item.label }}</span>
                </a>
                <Link
                    v-else
                    :href="item.href"
                    :method="item.method || 'get'"
                    :as="item.as || 'a'"
                    :class="[
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all w-full text-left',
                        isActive(item.href)
                            ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 dark:bg-emerald-500'
                            : 'text-muted-foreground hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/30 dark:hover:text-emerald-400',
                    ]"
                >
                    <IconComponent
                        :name="item.icon"
                        class="h-4 w-4 flex-shrink-0"
                    />
                    <span class="truncate flex items-center gap-1.5">
                        {{ item.label }}
                        <span
                            v-if="shouldShowDot(item)"
                            class="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0"
                            title="Data terisi"
                        ></span>
                    </span>
                </Link>
            </template>
        </template>
    </nav>
</template>
