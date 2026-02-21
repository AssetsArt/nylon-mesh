<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const vanillaReqSec = ref(0)
const vanillaLatency = ref("0.00")
const vanillaTransfer = ref(0)

const meshReqSec = ref(0)
const meshLatency = ref("0.00")
const meshTransfer = ref(0)

let animationId

onMounted(() => {
  const vTargetReq = 5181
  const vTargetLat = 23.20
  const vTargetTrans = 15
  
  const mTargetReq = 100321
  const mTargetLat = 1.19
  const mTargetTrans = 292
  
  const duration = 2000
  let startTime = null

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - Math.max(startTime, 0)
    
    if (elapsed < duration) {
      // Phase 1: Count up
      const progress = elapsed / duration
      const easeProgress = 1 - Math.pow(1 - progress, 4) // easeOutQuart
      
      vanillaReqSec.value = Math.floor(easeProgress * vTargetReq)
      vanillaLatency.value = (easeProgress * vTargetLat).toFixed(2)
      vanillaTransfer.value = Math.floor(easeProgress * vTargetTrans)

      meshReqSec.value = Math.floor(easeProgress * mTargetReq)
      meshLatency.value = (easeProgress * mTargetLat).toFixed(2)
      meshTransfer.value = Math.floor(easeProgress * mTargetTrans)
    } else {
      // Phase 2: Continuous fluctuation (Live Dashboard Feel)
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
  <div style="text-align: center;">
    <div class="glow-bg pulse"></div>
    <div class="benchmark-content">
      <h2 class="title slide-in-bottom">Blazing Fast on Edge</h2>
      <p class="subtitle slide-in-bottom delay-1">
        Tested with <code>oha</code> (120 concurrent connections) on an <br/>
        <strong>Apple M1 Pro (10-core CPU, 16GB RAM)</strong> serving a default <br/>
        <code class="nextjs-badge">Next.js 16</code> app (<code>bun create next-app@latest my-app --yes</code>).
      </p>

      <div class="comparison-grid slide-in-bottom delay-2">
        <!-- Nylon Mesh -->
        <div class="stat-card prime mesh-card shimmer">
          <div class="card-header">
            <h3>With Nylon Mesh</h3>
            <span class="badge-sub prime-badge">~19x Faster</span>
          </div>

          <div class="stat-metrics">
            <div class="stat-row highlight-row">
              <span class="stat-label">Requests / Sec</span>
              <span class="stat-value highlight">{{ meshReqSec.toLocaleString() }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Average Latency</span>
              <span class="stat-value highlight-sm">{{ meshLatency }} <small>ms</small></span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Transfer Speed</span>
              <span class="stat-value highlight-sm">{{ meshTransfer }} <small>MB/s</small></span>
            </div>
          </div>
        </div>

        <div class="vs-wrapper">
          <div class="vs-badge">VS</div>
        </div>

        <!-- Vanilla Next.js -->
        <div class="stat-card vanilla-card hover-glow">
          <div class="card-header">
            <h3>Vanilla Next.js</h3>
            <span class="badge-sub">Without Mesh</span>
          </div>
          
          <div class="stat-metrics">
            <div class="stat-row">
              <span class="stat-label">Requests / Sec</span>
              <span class="stat-value">{{ vanillaReqSec.toLocaleString() }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Average Latency</span>
              <span class="stat-value">{{ vanillaLatency }} <small>ms</small></span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Transfer Speed</span>
              <span class="stat-value">{{ vanillaTransfer }} <small>MB/s</small></span>
            </div>
          </div>
        </div>
      </div>

      <div class="terminals-wrapper slide-in-bottom delay-3">
        <div class="terminal">
          <div class="terminal-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="term-title">Vanilla Next.js</span>
          </div>
          <pre class="terminal-body type-window">
Summary:
  Success rate:	100.00%
  Total:	10002.3488 ms
  Slowest:	130.5956 ms
  Fastest:	5.5982 ms
  Average:	23.1958 ms
  Requests/sec:	5181.1830

  Total data:	150.34 MiB
  Size/request:	2.98 KiB
  Size/sec:	15.03 MiB
          </pre>
        </div>

        <div class="terminal prime-terminal">
          <div class="terminal-header">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
            <span class="term-title">Next.js + Nylon Mesh</span>
          </div>
          <pre class="terminal-body type-window">
Summary:
  Success rate:	100.00%
  Total:	10001.9643 ms
  Slowest:	11.1559 ms
  Fastest:	0.0368 ms
  Average:	1.1938 ms
  Requests/sec:	<span class="glow-text">100321.1940</span>

  Total data:	2.85 GiB
  Size/request:	2.98 KiB
  Size/sec:	291.69 MiB
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.glow-bg {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(0,0,0,0) 70%);
  pointer-events: none;
  z-index: 0;
}

.benchmark-content {
  position: relative;
  z-index: 1;
}

.badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 0.35rem 1rem;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.15);
  color: var(--vp-c-brand-1);
  margin-bottom: 1.5rem;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: -webkit-linear-gradient(45deg, var(--vp-c-brand-1), #10b981);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.2;
  border: none;
}

.nextjs-badge {
  background: rgba(255, 255, 255, 0.1);
  color: var(--vp-c-text-1);
  padding: 0.1rem 0.4rem;
  border-radius: 6px;
  font-family: inherit;
  font-weight: bold;
}

.subtitle {
  font-size: 1.2rem;
  color: var(--vp-c-text-2);
  margin-bottom: 3.5rem;
}

/* Comparison Grid */
.comparison-grid {
  display: flex;
  flex-direction: column;
  margin-bottom: 3.5rem;
  align-items: center;
}

.stat-card {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
}

@media (min-width: 768px) {
  .stat-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 2.5rem 3rem;
  }
}

.vanilla-card {
  opacity: 0.9;
}

.mesh-card {
  transform: scale(1.02);
  z-index: 2;
  box-shadow: 0 15px 40px rgba(16, 185, 129, 0.15);
}

.card-header {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .card-header {
    margin-bottom: 0;
    align-items: flex-start;
  }
}

.card-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--vp-c-text-1);
}

.badge-sub {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  background: rgba(128, 128, 128, 0.15);
  color: var(--vp-c-text-2);
}

.prime-badge {
  background: rgba(16, 185, 129, 0.2);
  color: var(--vp-c-brand-1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  font-weight: 700;
  box-shadow: 0 0 10px rgba(16,185,129,0.2);
}

.stat-metrics {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .stat-metrics {
    flex-direction: row;
    align-items: center;
    gap: 3rem;
  }
}

.stat-row {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.highlight-row {
  margin-bottom: 0.5rem;
}

@media (min-width: 768px) {
  .highlight-row {
    margin-bottom: 0;
  }
}

/* VS Badge Spacer */
.vs-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 0;
  z-index: 3;
}

.vs-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  border: 2px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-style: italic;
  color: var(--vp-c-text-2);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.hover-glow:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.05);
  border-color: var(--vp-c-text-2);
}

.stat-card.prime {
  background: linear-gradient(145deg, var(--vp-c-bg-mute), rgba(16, 185, 129, 0.08));
  border: 1px solid rgba(16, 185, 129, 0.3);
  position: relative;
  overflow: hidden;
}

.stat-card.prime:hover {
  transform: scale(1.04) translateY(-5px);
}

.stat-label {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
  z-index: 2;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1;
  z-index: 2;
}

.stat-value small {
  font-size: 1rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-left: 0.2rem;
}

.stat-value.highlight {
  font-size: 4rem;
  background: -webkit-linear-gradient(120deg, var(--vp-c-brand-1), #3fb950);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  text-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.stat-value.highlight-sm {
  font-size: 2.2rem;
  color: #3fb950;
}

/* Terminals */
.terminals-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

@media (min-width: 900px) {
  .terminals-wrapper {
    flex-direction: row;
  }
}

.terminal {
  flex: 1;
  background: #0d1117;
  border-radius: 16px;
  border: 1px solid #30363d;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0,0,0,0.3);
}

.prime-terminal {
  border-color: rgba(16, 185, 129, 0.3);
  box-shadow: 0 12px 30px rgba(16, 185, 129, 0.1);
}

.terminal-header {
  background: #161b22;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #30363d;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}
.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.term-title {
  margin-left: auto;
  margin-right: auto;
  color: #8b949e;
  font-weight: 600;
  font-size: 0.75rem;
  font-family: monospace;
}

.terminal-body {
  margin: 0;
  padding: 1.5rem;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.85rem;
  color: #c9d1d9;
  line-height: 1.5;
  overflow-x: auto;
}

.glow-text {
  color: #3fb950;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(63, 185, 80, 0.5);
}

.pulse {
  animation: pulseGlow 4s infinite alternate;
}

@keyframes pulseGlow {
  from { opacity: 0.6; transform: translateX(-50%) scale(0.95); }
  to { opacity: 1; transform: translateX(-50%) scale(1.05); }
}

.bounce-in {
  opacity: 0;
  animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
  animation-delay: 0.3s;
}

@keyframes bounceIn {
  0% { opacity: 0; transform: scale(0.3); }
  50% { opacity: 1; transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

.slide-in-bottom {
  opacity: 0;
  animation: slideInBottom 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

@keyframes slideInBottom {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.delay-1 { animation-delay: 0.2s; }
.delay-2 { animation-delay: 0.4s; }
.delay-3 { animation-delay: 0.6s; }

.shimmer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 50%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  transform: skewX(-20deg);
  animation: shimmer 3s infinite 2s;
  z-index: 1;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 200%; }
}
</style>
