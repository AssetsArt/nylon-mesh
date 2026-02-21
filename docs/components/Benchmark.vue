<template>
  <div class="benchmark-container">
    <div class="glow-bg"></div>
    <div class="benchmark-content">
      <div class="badge">🚀 PERFORMANCE BENCHMARK</div>
      <h2 class="title">Blazing Fast on Edge</h2>
      <p class="subtitle">
        Tested with <code>oha</code> (120 concurrent connections) on an <br/>
        <strong>Apple M1 Pro (10-core CPU, 16GB RAM)</strong>.
      </p>

      <div class="stats-grid">
        <div class="stat-card prime">
          <span class="stat-label">Requests / Second</span>
          <span class="stat-value highlight">99,130</span>
        </div>
        
        <div class="stat-group">
          <div class="stat-card">
            <span class="stat-label">Average Latency</span>
            <span class="stat-value">1.20 <small>ms</small></span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Success Rate</span>
            <span class="stat-value">100<small>%</small></span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Transfer Speed</span>
            <span class="stat-value">769<small>MB/s</small></span>
          </div>
          <div class="stat-card">
            <span class="stat-label">Total Data</span>
            <span class="stat-value">7.52 <small>GB</small></span>
          </div>
        </div>
      </div>

      <div class="terminal">
        <div class="terminal-header">
          <span class="dot red"></span>
          <span class="dot yellow"></span>
          <span class="dot green"></span>
          <span class="term-title">oha -c 120 -z 10s http://localhost:3000</span>
        </div>
        <pre class="terminal-body">
Summary:
  Success rate:	100.00%
  Total:	10002.2002 ms
  Slowest:	11.1898 ms
  Fastest:	0.0371 ms
  Average:	1.2081 ms
  Requests/sec:	<span class="glow-text">99130.7892</span>

  Total data:	7.52 GiB
  Size/request:	7.95 KiB
  Size/sec:	769.89 MiB
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
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0,0,0,0.15);
  border-color: var(--vp-c-brand-1);
}

.stat-card.prime {
  padding: 3.5rem;
  background: linear-gradient(145deg, var(--vp-c-bg-mute), rgba(16, 185, 129, 0.05));
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.stat-label {
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
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
</style>
