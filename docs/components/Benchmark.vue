<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const reqSec = ref(0)
const latency = ref("0.00")
const transfer = ref(0)
let animationId

onMounted(() => {
  const targetReq = 100321
  const targetLat = 1.19
  const targetTrans = 292
  const duration = 2000
  let startTime = null

  const animate = (timestamp) => {
    if (!startTime) startTime = timestamp
    const elapsed = timestamp - Math.max(startTime, 0)
    
    if (elapsed < duration) {
      // Phase 1: Count up
      const progress = elapsed / duration
      const easeProgress = 1 - Math.pow(1 - progress, 4) // easeOutQuart
      
      reqSec.value = Math.floor(easeProgress * targetReq)
      latency.value = (easeProgress * targetLat).toFixed(2)
      transfer.value = Math.floor(easeProgress * targetTrans)
    } else {
      // Phase 2: Continuous fluctuation (Live Dashboard Feel)
      const timeInSec = timestamp / 1000
      
      // Use sine/cosine waves for smooth, "random" looking noise
      const reqNoise = Math.sin(timeInSec * 2) * 800 + Math.cos(timeInSec * 3.5) * 500
      reqSec.value = Math.floor(targetReq + reqNoise)
      
      const latNoise = Math.sin(timeInSec * 3) * 0.08 + Math.cos(timeInSec * 1.8) * 0.05
      latency.value = Math.max(0.8, targetLat + latNoise).toFixed(2)
      
      const transNoise = Math.sin(timeInSec * 2.5) * 6 + Math.cos(timeInSec * 4) * 4
      transfer.value = Math.floor(targetTrans + transNoise)
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
  <div class="benchmark-container fade-in-up">
    <div class="glow-bg pulse"></div>
    <div class="benchmark-content">
      <div class="badge bounce-in">🚀 PERFORMANCE BENCHMARK</div>
      <h2 class="title slide-in-bottom">Blazing Fast on Edge</h2>
      <p class="subtitle slide-in-bottom delay-1">
        Tested with <code>oha</code> (120 concurrent connections) on an <br/>
        <strong>Apple M1 Pro (10-core CPU, 16GB RAM)</strong> serving a default <br/>
        <code class="nextjs-badge">Next.js 16</code> app (<code>bun create next-app@latest my-app --yes</code>).
      </p>

      <div class="stats-grid slide-in-bottom delay-2">
        <div class="stat-card prime shimmer">
          <span class="stat-label">Requests / Second</span>
          <span class="stat-value highlight">{{ reqSec.toLocaleString() }}</span>
        </div>
        
        <div class="stat-group">
          <div class="stat-card hover-glow">
            <span class="stat-label">Average Latency</span>
            <span class="stat-value">{{ latency }} <small>ms</small></span>
          </div>
          <div class="stat-card hover-glow">
            <span class="stat-label">Success Rate</span>
            <span class="stat-value">100<small>%</small></span>
          </div>
          <div class="stat-card hover-glow">
            <span class="stat-label">Transfer Speed</span>
            <span class="stat-value">{{ transfer }}<small>MB/s</small></span>
          </div>
          <div class="stat-card hover-glow">
            <span class="stat-label">Total Data</span>
            <span class="stat-value">2.84 <small>GB</small></span>
          </div>
        </div>
      </div>

      <div class="terminal slide-in-bottom delay-3">
        <div class="terminal-header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="term-title">oha -c 120 -z 10s http://localhost:3000</span>
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
</template>

<style scoped>
.benchmark-container {
  position: relative;
  margin: 4rem 0;
  padding: 3rem 1.5rem;
  text-align: center;
  border-radius: 24px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

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

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 3.5rem;
}

.stat-card {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease, border-color 0.3s ease;
}

.hover-glow:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 35px rgba(16, 185, 129, 0.15);
  border-color: var(--vp-c-brand-1);
}

.stat-card.prime {
  padding: 3.5rem;
  background: linear-gradient(145deg, var(--vp-c-bg-mute), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
  position: relative;
  overflow: hidden;
}

.stat-label {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  z-index: 2;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
  z-index: 2;
}

.stat-value small {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-left: 0.2rem;
}

.stat-value.highlight {
  font-size: 5.5rem;
  background: -webkit-linear-gradient(120deg, var(--vp-c-brand-1), #3fb950);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1;
  text-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
}

.stat-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

@media (min-width: 640px) {
  .stat-group {
    grid-template-columns: repeat(4, 1fr);
  }
}

.terminal {
  text-align: left;
  background: #0d1117;
  border-radius: 16px;
  border: 1px solid #30363d;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(0,0,0,0.4);
}

.terminal-header {
  background: #161b22;
  padding: 0.85rem 1.2rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #30363d;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}
.dot.red { background: #ff5f56; }
.dot.yellow { background: #ffbd2e; }
.dot.green { background: #27c93f; }

.term-title {
  margin-left: auto;
  margin-right: auto;
  color: #8b949e;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: monospace;
}

.terminal-body {
  margin: 0;
  padding: 2rem;
  font-family: 'Fira Code', 'Monaco', monospace;
  font-size: 0.95rem;
  color: #c9d1d9;
  line-height: 1.6;
  overflow-x: auto;
}

.glow-text {
  color: #3fb950;
  font-weight: bold;
  text-shadow: 0 0 10px rgba(63, 185, 80, 0.5);
}

/* Animations */
.fade-in-up {
  opacity: 0;
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
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
