<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const vanillaReqSec = ref(0)
const vanillaLatency = ref("0.00")
const vanillaTransfer = ref(0)

const meshReqSec = ref(0)
const meshLatency = ref("0.00")
const meshTransfer = ref(0)

const multiplier = ref("0.0")

let animationId

onMounted(() => {
  const vTargetReq = 5181
  const vTargetLat = 23.20
  const vTargetTrans = 15
  
  const mTargetReq = 100321
  const mTargetLat = 1.19
  const mTargetTrans = 292

  const targetMultiplier = (mTargetReq / vTargetReq)
  
  const duration = 2000
  let startTime = null

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - Math.max(startTime, 0)
    
    if (elapsed < duration) {
      const progress = elapsed / duration
      const easeProgress = 1 - Math.pow(1 - progress, 4)
      
      vanillaReqSec.value = Math.floor(easeProgress * vTargetReq)
      vanillaLatency.value = (easeProgress * vTargetLat).toFixed(2)
      vanillaTransfer.value = Math.floor(easeProgress * vTargetTrans)

      meshReqSec.value = Math.floor(easeProgress * mTargetReq)
      meshLatency.value = (easeProgress * mTargetLat).toFixed(2)
      meshTransfer.value = Math.floor(easeProgress * mTargetTrans)

      multiplier.value = (easeProgress * targetMultiplier).toFixed(1)
    } else {
      const timeInSec = timestamp / 1000
      
      const vReqNoise = Math.sin(timeInSec * 2) * 150 + Math.cos(timeInSec * 3.5) * 80
      vanillaReqSec.value = Math.floor(vTargetReq + vReqNoise)
      
      const vLatNoise = Math.sin(timeInSec * 3) * 0.8 + Math.cos(timeInSec * 1.8) * 0.5
      vanillaLatency.value = Math.max(10, vTargetLat + vLatNoise).toFixed(2)
      
      const vTransNoise = Math.sin(timeInSec * 2.5) * 1 + Math.cos(timeInSec * 4) * 0.5
      vanillaTransfer.value = Math.floor(vTargetTrans + vTransNoise)

      const mReqNoise = Math.sin(timeInSec * 2) * 800 + Math.cos(timeInSec * 3.5) * 500
      meshReqSec.value = Math.floor(mTargetReq + mReqNoise)
      
      const mLatNoise = Math.sin(timeInSec * 3) * 0.08 + Math.cos(timeInSec * 1.8) * 0.05
      meshLatency.value = Math.max(0.8, mTargetLat + mLatNoise).toFixed(2)
      
      const mTransNoise = Math.sin(timeInSec * 2.5) * 6 + Math.cos(timeInSec * 4) * 4
      meshTransfer.value = Math.floor(mTargetTrans + mTransNoise)

      const currentMultiplier = meshReqSec.value / Math.max(vanillaReqSec.value, 1)
      multiplier.value = currentMultiplier.toFixed(1)
    }

    animationId = requestAnimationFrame(animate)
  }

  animationId = requestAnimationFrame(animate)
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>

<template>
  <div class="benchmark-section">
    <div class="benchmark-content">
      <h2 class="bench-title">Blazing Fast on Edge</h2>
      <p class="bench-subtitle">
        Tested with <code>oha</code> — 120 concurrent connections on <strong>Apple M1 Pro</strong> serving a default
        <code>Next.js 16</code> app.
      </p>

      <!-- Multiplier Hero -->
      <div class="multiplier-hero">
        <span class="mult-value">{{ multiplier }}×</span>
        <span class="mult-label">faster</span>
      </div>

      <!-- Cards -->
      <div class="bench-grid">
        <!-- Mesh Card -->
        <div class="bench-card mesh-card">
          <div class="card-glow"></div>
          <div class="card-top">
            <h3 class="card-title">With Nylon Mesh</h3>
            <span class="card-badge">⚡ Cached</span>
          </div>
          <div class="metrics">
            <div class="metric primary-metric">
              <span class="metric-value glow-value">{{ meshReqSec.toLocaleString() }}</span>
              <span class="metric-label">req/s</span>
            </div>
            <div class="metric">
              <span class="metric-value accent-value">{{ meshLatency }}<small>ms</small></span>
              <span class="metric-label">avg latency</span>
            </div>
            <div class="metric">
              <span class="metric-value accent-value">{{ meshTransfer }}<small>MB/s</small></span>
              <span class="metric-label">throughput</span>
            </div>
          </div>
        </div>

        <!-- VS -->
        <div class="vs-divider">
          <div class="vs-pill">VS</div>
        </div>

        <!-- Vanilla Card -->
        <div class="bench-card vanilla-card">
          <div class="card-top">
            <h3 class="card-title">Vanilla Next.js</h3>
            <span class="card-badge dim-badge">No Cache</span>
          </div>
          <div class="metrics">
            <div class="metric primary-metric">
              <span class="metric-value dim-value">{{ vanillaReqSec.toLocaleString() }}</span>
              <span class="metric-label">req/s</span>
            </div>
            <div class="metric">
              <span class="metric-value dim-value">{{ vanillaLatency }}<small>ms</small></span>
              <span class="metric-label">avg latency</span>
            </div>
            <div class="metric">
              <span class="metric-value dim-value">{{ vanillaTransfer }}<small>MB/s</small></span>
              <span class="metric-label">throughput</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Terminal Outputs -->
      <div class="terminals">
        <div class="terminal">
          <div class="term-bar">
            <span class="dot r"></span>
            <span class="dot y"></span>
            <span class="dot g"></span>
            <span class="term-name">Vanilla Next.js</span>
          </div>
          <pre class="term-body">
Summary:
  Success rate:	100.00%
  Total:	10002.3488 ms
  Slowest:	130.5956 ms
  Fastest:	5.5982 ms
  Average:	23.1958 ms
  Requests/sec:	5181.1830

  Total data:	150.34 MiB
  Size/request:	2.98 KiB
  Size/sec:	15.03 MiB</pre>
        </div>

        <div class="terminal mesh-terminal">
          <div class="term-bar">
            <span class="dot r"></span>
            <span class="dot y"></span>
            <span class="dot g"></span>
            <span class="term-name">Next.js + Nylon Mesh</span>
          </div>
          <pre class="term-body">
Summary:
  Success rate:	100.00%
  Total:	10001.9643 ms
  Slowest:	11.1559 ms
  Fastest:	0.0368 ms
  Average:	1.1938 ms
  Requests/sec:	<span class="term-highlight">100321.1940</span>

  Total data:	2.85 GiB
  Size/request:	2.98 KiB
  Size/sec:	291.69 MiB</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.benchmark-section {
  position: relative;
  text-align: center;
  padding: 2rem 1.5rem 4rem;
  overflow: hidden;
}

@keyframes orbPulse {
  from { opacity: 0.5; transform: translateX(-50%) scale(0.9); }
  to { opacity: 1; transform: translateX(-50%) scale(1.1); }
}

.benchmark-content {
  position: relative;
  z-index: 1;
}

.bench-title {
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #e6edf3, #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.03em;
  border: none;
  animation: slideUp 0.6s ease-out;
}

.bench-subtitle {
  font-size: 1.1rem;
  color: #8b949e;
  margin-bottom: 2.5rem;
  line-height: 1.7;
  animation: slideUp 0.6s ease-out 0.1s both;
}

.bench-subtitle code {
  background: rgba(16, 185, 129, 0.1);
  color: #3fb950;
  padding: 0.1rem 0.4rem;
  border-radius: 5px;
  font-weight: 600;
  font-size: 0.95rem;
}

/* Multiplier */
.multiplier-hero {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.4rem;
  margin-bottom: 2.5rem;
  animation: slideUp 0.6s ease-out 0.2s both;
}

.mult-value {
  font-size: 5rem;
  font-weight: 900;
  background: linear-gradient(135deg, #10b981, #3fb950, #22d3ee);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  letter-spacing: -0.04em;
  filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.3));
}

.mult-label {
  font-size: 1.3rem;
  font-weight: 600;
  color: #6e7681;
  letter-spacing: 0.02em;
}

/* Cards */
.bench-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 3rem;
  animation: slideUp 0.6s ease-out 0.3s both;
}

.bench-card {
  width: 100%;
  max-width: 680px;
  border-radius: 16px;
  padding: 2rem 2.5rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.mesh-card {
  background: linear-gradient(145deg, rgba(20, 26, 34, 0.95), rgba(16, 185, 129, 0.06));
  border: 1px solid rgba(16, 185, 129, 0.25);
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.12);
}

.mesh-card:hover {
  transform: scale(1.02);
  box-shadow: 0 20px 60px rgba(16, 185, 129, 0.2);
}

.card-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.04), transparent);
  transform: skewX(-20deg);
  animation: shimmerSlide 4s infinite 2s;
}

@keyframes shimmerSlide {
  0% { left: -100%; }
  100% { left: 250%; }
}

.vanilla-card {
  background: rgba(20, 26, 34, 0.6);
  border: 1px solid rgba(48, 54, 61, 0.5);
  opacity: 0.85;
}

.vanilla-card:hover {
  transform: scale(1.01);
  opacity: 1;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.8rem;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #e6edf3;
  margin: 0;
}

.card-badge {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  padding: 0.25rem 0.65rem;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.15);
  color: #3fb950;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.dim-badge {
  background: rgba(139, 148, 158, 0.1);
  color: #6e7681;
  border-color: rgba(139, 148, 158, 0.2);
}

.metrics {
  display: flex;
  align-items: flex-end;
  gap: 2rem;
  flex-wrap: wrap;
}

@media (min-width: 640px) {
  .metrics {
    gap: 3rem;
  }
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.primary-metric {
  flex: 1;
}

.metric-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: #6e7681;
  margin-top: 0.4rem;
}

.metric-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #e6edf3;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.metric-value small {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6e7681;
  margin-left: 0.15rem;
}

.glow-value {
  font-size: 3.2rem;
  background: linear-gradient(120deg, #10b981, #3fb950);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 12px rgba(16, 185, 129, 0.3));
}

.accent-value {
  color: #3fb950;
  font-size: 1.6rem;
}

.accent-value small {
  color: rgba(63, 185, 80, 0.5);
}

.dim-value {
  color: #8b949e;
}

.dim-value small {
  color: #6e7681;
}

/* VS Divider */
.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  z-index: 2;
}

.vs-pill {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(20, 26, 34, 0.9);
  border: 2px solid rgba(48, 54, 61, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-style: italic;
  color: #6e7681;
  font-size: 0.85rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

/* Terminals */
.terminals {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
  animation: slideUp 0.6s ease-out 0.4s both;
}

@media (min-width: 900px) {
  .terminals {
    flex-direction: row;
  }
}

.terminal {
  flex: 1;
  background: #0d1117;
  border-radius: 14px;
  border: 1px solid #21262d;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.mesh-terminal {
  border-color: rgba(16, 185, 129, 0.2);
  box-shadow: 0 8px 28px rgba(16, 185, 129, 0.08);
}

.term-bar {
  background: #161b22;
  padding: 0.65rem 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #21262d;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.dot.r { background: #ff5f56; }
.dot.y { background: #ffbd2e; }
.dot.g { background: #27c93f; }

.term-name {
  margin-left: auto;
  margin-right: auto;
  color: #6e7681;
  font-weight: 600;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.02em;
}

.term-body {
  margin: 0;
  padding: 1.2rem 1.5rem;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: #8b949e;
  line-height: 1.6;
  overflow-x: auto;
}

.term-highlight {
  color: #3fb950;
  font-weight: 700;
  text-shadow: 0 0 8px rgba(63, 185, 80, 0.4);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .bench-title { font-size: 2rem; }
  .mult-value { font-size: 3.5rem; }
  .glow-value { font-size: 2.4rem; }
  .metrics { gap: 1.5rem; }
}
</style>
