<script setup>
import { ref, onMounted } from 'vue'

const visible = ref(false)
onMounted(() => {
  setTimeout(() => visible.value = true, 200)
})
</script>

<template>
  <div :class="['arch-container', { visible }]">
    <h2 class="arch-title">How It Works</h2>
    <p class="arch-subtitle">
      Nylon Mesh intercepts every HTTP request, checks its 2-tier cache, and only hits your backend when absolutely necessary.
    </p>

    <div class="flow-diagram">
      <!-- Client -->
      <div class="flow-node client-node">
        <div class="node-icon">🌐</div>
        <div class="node-label">Client</div>
        <div class="node-desc">Browser / CDN</div>
      </div>

      <div class="flow-arrow">
        <div class="arrow-row">
          <div class="arrow-line"></div>
          <svg class="arrow-head" viewBox="0 0 12 12" width="10" height="10"><path d="M0 0 L12 6 L0 12 Z" fill="#10b981"/></svg>
        </div>
        <div class="arrow-label">HTTP Request</div>
      </div>

      <!-- Nylon Mesh -->
      <div class="flow-node mesh-node">
        <div class="node-icon">⚡</div>
        <div class="node-label">Nylon Mesh</div>
        <div class="node-desc">Pingora Core</div>

        <div class="cache-tiers">
          <div class="tier tier-1">
            <span class="tier-badge">T1</span>
            <span class="tier-name">RAM Cache</span>
            <span class="tier-speed">~0.01ms</span>
          </div>
          <div class="tier-divider">↓ miss</div>
          <div class="tier tier-2">
            <span class="tier-badge t2">T2</span>
            <span class="tier-name">Redis</span>
            <span class="tier-speed">~0.5ms</span>
          </div>
        </div>
      </div>

      <div class="flow-arrow">
        <div class="arrow-row">
          <div class="arrow-line dashed"></div>
          <svg class="arrow-head dashed-head" viewBox="0 0 12 12" width="10" height="10"><path d="M0 0 L12 6 L0 12 Z" fill="#6e7681"/></svg>
        </div>
        <div class="arrow-label">Only on cache miss</div>
      </div>

      <!-- Backend -->
      <div class="flow-node backend-node">
        <div class="node-icon">🖥️</div>
        <div class="node-label">Backend</div>
        <div class="node-desc">Next.js / Nuxt / etc.</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.arch-container {
  padding: 4rem 1.5rem;
  text-align: center;
  opacity: 0;
  transform: translateY(24px);
  transition: all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: visible;
}

.arch-container.visible {
  opacity: 1;
  transform: translateY(0);
}

.arch-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #e6edf3, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  border-top: none;
  border-bottom: none;
  letter-spacing: -0.03em;
}

.arch-subtitle {
  font-size: 1.15rem;
  color: #8b949e;
  max-width: 600px;
  margin: 0 auto 3.5rem;
  line-height: 1.7;
}

.flow-diagram {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  flex-wrap: nowrap;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 1rem;
}

.flow-node {
  background: rgba(20, 26, 34, 0.8);
  border: 1px solid rgba(48, 54, 61, 0.65);
  border-radius: 16px;
  padding: 1.2rem 1.5rem;
  min-width: 120px;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  transition: all 0.35s ease;
}

.flow-node:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.mesh-node {
  border-color: rgba(16, 185, 129, 0.3);
  background: linear-gradient(145deg, rgba(20, 26, 34, 0.9), rgba(16, 185, 129, 0.06));
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.1);
  min-width: 180px;
  padding: 1.2rem 1.5rem 1rem;
}

.mesh-node:hover {
  box-shadow: 0 16px 48px rgba(16, 185, 129, 0.18);
  border-color: rgba(16, 185, 129, 0.5);
}

.node-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.node-label {
  font-weight: 700;
  font-size: 1.1rem;
  color: #e6edf3;
  margin-bottom: 0.2rem;
}

.node-desc {
  font-size: 0.8rem;
  color: #6e7681;
  font-weight: 500;
}

.cache-tiers {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.tier {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 8px;
  padding: 0.35rem 0.7rem;
  font-size: 0.75rem;
}

.tier-badge {
  background: #10b981;
  color: #fff;
  font-weight: 700;
  font-size: 0.6rem;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
}

.tier-badge.t2 {
  background: #3b82f6;
}

.tier-name {
  color: #e6edf3;
  font-weight: 600;
}

.tier-speed {
  margin-left: auto;
  color: #3fb950;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
}

.tier-divider {
  font-size: 0.65rem;
  color: #6e7681;
  text-align: center;
  font-weight: 500;
}

.flow-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  padding: 0 0.5rem;
  flex-shrink: 1;
}

.arrow-row {
  display: flex;
  align-items: center;
  gap: 0px;
}

.arrow-line {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, rgba(16, 185, 129, 0.3), #10b981);
}

.arrow-head {
  display: block;
  flex-shrink: 0;
}

.arrow-line.dashed {
  background: repeating-linear-gradient(
    90deg,
    #6e7681 0px,
    #6e7681 4px,
    transparent 4px,
    transparent 8px
  );
}

.arrow-label {
  font-size: 0.65rem;
  color: #6e7681;
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .flow-diagram {
    flex-direction: column;
    gap: 0.5rem;
  }

  .flow-arrow {
    transform: rotate(90deg);
    padding: 0.5rem 0;
  }

  .arch-title {
    font-size: 2rem;
  }
}

@media (min-width: 641px) and (max-width: 900px) {
  .flow-node {
    padding: 1rem 1.2rem;
    min-width: 100px;
  }

  .mesh-node {
    min-width: 150px;
  }

  .arrow-line {
    width: 28px;
  }

  .flow-arrow {
    padding: 0 0.3rem;
  }

  .node-icon {
    font-size: 1.5rem;
  }

  .node-label {
    font-size: 0.95rem;
  }
}
</style>
