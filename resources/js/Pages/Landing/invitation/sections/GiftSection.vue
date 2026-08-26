<template>
  <section class="gift-section px-4 py-16 md:py-24" data-aos="fade-up">
    <div class="mx-auto max-w-lg text-center">
      <h2
        class="mb-4 text-2xl font-bold md:text-3xl"
        :style="{ color: primaryColor }"
      >
        Amplop Digital
      </h2>
      <p class="mb-8 text-sm text-gray-600">
        Doa dan restu Anda merupakan hadiah terindah bagi kami
      </p>

      <!-- Bank Accounts — Debit Card Layout -->
      <div v-if="bankAccounts && bankAccounts.length" class="mb-6 space-y-4">
        <div
          v-for="(account, idx) in bankAccounts"
          :key="idx"
          class="debit-card"
          :style="{ background: idx === 0 ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` : 'linear-gradient(135deg, #334155, #1e293b)' }"
          data-aos="fade-up"
        >
          <div class="debit-card-top">
            <span class="debit-card-bank">{{ account.bankName || 'Bank' }}</span>
            <span class="debit-card-chip">💳</span>
          </div>
          <div class="debit-card-number">
            <span>{{ account.number || account.accountNumber || '-' }}</span>
            <button
              class="debit-card-copy"
              :title="copiedAccountId === idx ? 'Tersalin!' : 'Salin nomor'"
              @click="copyNumber(account, idx)"
            >
              <span v-if="copiedAccountId === idx">✓</span>
              <span v-else>📋</span>
            </button>
          </div>
          <div class="debit-card-holder">
            a.n. {{ account.name || account.accountHolder || '-' }}
          </div>
        </div>
      </div>

      <!-- QRIS Image -->
      <div v-if="qrisImageUrl" class="mb-6" data-aos="fade-up">
        <p class="mb-3 text-sm font-medium text-gray-700">Scan QRIS</p>
        <div
          class="mx-auto inline-block overflow-hidden rounded-xl bg-white p-3 shadow-md"
        >
          <img
            v-if="!qrisImageError"
            :src="qrisImageUrl"
            alt="QRIS Payment"
            class="mx-auto max-h-64 w-auto"
            @error="qrisImageError = true"
          />
          <div
            v-else
            class="flex h-48 w-48 items-center justify-center bg-gray-100 text-gray-400"
          >
            <span class="text-sm">Gagal memuat QRIS</span>
          </div>
        </div>
      </div>

      <!-- Gift Confirmation Form -->
      <div
        class="mb-6 rounded-xl bg-white/90 p-5 shadow-md backdrop-blur-sm"
        data-aos="fade-up"
      >
        <h3 class="mb-4 text-sm font-semibold text-gray-800">
          Konfirmasi Hadiah
        </h3>

        <div v-if="giftSent" class="py-4 text-center">
          <p class="text-sm text-green-600">
            Konfirmasi hadiah Anda telah terkirim! 🎁
          </p>
        </div>

        <form
          v-else
          class="space-y-3 text-left"
          @submit.prevent="handleGiftSubmit"
        >
          <div>
            <input
              v-model="giftForm.senderName"
              type="text"
              placeholder="Nama pengirim"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div>
            <input
              v-model.number="giftForm.amount"
              type="number"
              placeholder="Jumlah (Rp)"
              min="0"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <div>
            <select
              v-model="giftForm.method"
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            >
              <option value="">Pilih metode pembayaran</option>
              <option value="transfer_bank">Transfer Bank</option>
              <option value="qris">QRIS</option>
              <option value="e_wallet">E-Wallet</option>
            </select>
          </div>
          <div>
            <textarea
              v-model="giftForm.message"
              placeholder="Pesan (opsional)"
              rows="2"
              class="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
            ></textarea>
          </div>
          <button
            type="submit"
            class="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
            :style="{ backgroundColor: primaryColor }"
            :disabled="giftSubmitting"
          >
            {{ giftSubmitting ? "Mengirim..." : "Konfirmasi Hadiah" }}
          </button>
        </form>
      </div>

      <!-- Shipping Address -->
      <div
        v-if="shippingAddress"
        class="mb-6 rounded-xl bg-white/90 p-5 shadow-md backdrop-blur-sm"
        data-aos="fade-up"
      >
        <h3 class="mb-2 text-sm font-semibold text-gray-800">
          📦 Alamat Pengiriman Hadiah
        </h3>
        <p class="text-sm text-gray-600 whitespace-pre-line">
          {{ shippingAddress }}
        </p>
      </div>

      <!-- Live Streaming Link -->
      <div v-if="liveStreamUrl" class="mb-6" data-aos="fade-up">
        <a
          :href="liveStreamUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
          :style="{ backgroundColor: primaryColor }"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          Tonton Live Streaming
        </a>
      </div>

      <!-- Health Protocol -->
      <div
        v-if="healthProtocol"
        class="rounded-xl bg-blue-50 p-5"
        data-aos="fade-up"
      >
        <h3 class="mb-2 text-sm font-semibold text-blue-800">
          🏥 Protokol Kesehatan
        </h3>
        <p class="text-sm text-blue-700 whitespace-pre-line">
          {{ healthProtocol }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { useClipboard } from "@/Composables/useClipboard.js";
import { paymentService } from "@/api/services/paymentService.js";

const props = defineProps({
  bankAccounts: {
    type: Array,
    default: () => [],
  },
  qrisImageUrl: {
    type: String,
    default: "",
  },
  shippingAddress: {
    type: String,
    default: "",
  },
  liveStreamUrl: {
    type: String,
    default: "",
  },
  healthProtocol: {
    type: String,
    default: "",
  },
  settings: {
    type: Object,
    default: () => ({}),
  },
  themeColors: {
    type: Object,
    default: () => ({}),
  },
});

const primaryColor = computed(() => props.themeColors?.primary || "#8B4513");

// Image error state
const qrisImageError = ref(false);

// Clipboard
const { copy } = useClipboard();
const copiedAccountId = ref(null);
let copiedTimeout = null;

async function copyNumber(account, idx) {
  const num = account.number || account.accountNumber;
  if (!num) return;
  const success = await copy(num);
  if (success) {
    if (copiedTimeout) clearTimeout(copiedTimeout);
    copiedAccountId.value = idx;
    copiedTimeout = setTimeout(() => {
      copiedAccountId.value = null;
    }, 2000);
  }
}

// Gift confirmation form
const giftForm = reactive({
  senderName: "",
  amount: null,
  method: "",
  message: "",
});
const giftSubmitting = ref(false);
const giftSent = ref(false);

async function handleGiftSubmit() {
  if (!giftForm.senderName || !giftForm.senderName.trim()) return;

  giftSubmitting.value = true;
  try {
    await paymentService.addGift({
      senderName: giftForm.senderName.trim(),
      amount: giftForm.amount || 0,
      method: giftForm.method || "transfer_bank",
      message: giftForm.message?.trim() || "",
    });
    giftSent.value = true;
  } catch {
    // Silent error handling for guest-facing app
  } finally {
    giftSubmitting.value = false;
  }
}
</script>

<style scoped>
.debit-card {
  border-radius: 1rem;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  text-align: left;
  position: relative;
  overflow: hidden;
}
.debit-card::after {
  content: '';
  position: absolute;
  top: -30%;
  right: -20%;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}
.debit-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}
.debit-card-bank {
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  opacity: 0.9;
}
.debit-card-chip {
  font-size: 1.5rem;
}
.debit-card-number {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  font-family: 'Courier New', monospace;
  margin-bottom: 0.75rem;
}
.debit-card-copy {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 0.5rem;
  padding: 0.375rem 0.625rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  color: white;
}
.debit-card-copy:hover {
  background: rgba(255, 255, 255, 0.35);
}
.debit-card-holder {
  font-size: 0.8125rem;
  opacity: 0.8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
