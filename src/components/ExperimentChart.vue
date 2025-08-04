<template>
    <div class="charts-container">
        <div v-if="!metricCharts.length" class="empty-state">
            Select experiments to display metrics
        </div>

        <div v-for="chart in metricCharts" :key="chart.metric" class="metric-chart">
            <Chart
                type="line"
                :data="chart.chartData"
                :options="chart.options"
                :height="300"
            />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import Chart from 'primevue/chart';

const props = defineProps({
    data: Array,
    selectedExperiments: Array
});

const MAX_POINTS = 500;
const Y_AXIS_PADDING = 0.05;
const COLORS = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#FF7043', '#26C6DA', '#D4E157'];

const metricCharts = computed(() => {
    const chartsMap = {};

    props.data
        .filter(item => props.selectedExperiments.includes(item.experiment_id))
        .forEach(({ experiment_id, metric_name, step, value }) => {
            if (!metric_name || step == null || value == null) return;
            chartsMap[metric_name] ??= {};
            chartsMap[metric_name][experiment_id] ??= [];
            chartsMap[metric_name][experiment_id].push({ x: step, y: value });
        });

    return Object.entries(chartsMap).map(([metric, expData], index) => {
        const datasets = Object.entries(expData).map(([expId, points], i) => {
            const sampled = points.length > MAX_POINTS
                ? points.filter((_, idx) => idx % Math.ceil(points.length / MAX_POINTS) === 0)
                : points;

            return {
                label: `Exp ${expId}`,
                data: sampled.sort((a, b) => a.x - b.x),
                borderColor: COLORS[i % COLORS.length],
                fill: false,
                tension: 0.1,
                pointRadius: 0,
                borderWidth: 2
            };
        });

        const allY = datasets.flatMap(d => d.data.map(p => p.y));
        const [minY, maxY] = [Math.min(...allY), Math.max(...allY)];
        const padding = (maxY - minY) * Y_AXIS_PADDING || 0.01;

        return {
            metric,
            chartData: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#fff' }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(4)} at step ${ctx.parsed.x}`
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        title: {
                            display: true,
                            text: 'Step',
                            color: '#fff'
                        },
                        ticks: { color: '#ccc' }
                    },
                    y: {
                        min: minY - padding,
                        max: maxY + padding,
                        title: {
                            display: true,
                            text: metric,
                            color: '#fff'
                        },
                        ticks: { color: '#ccc' }
                    }
                }
            }
        };
    });
});
</script>

<style scoped>
.charts-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.metric-chart {
    background: #1e1e1e;
    border-radius: 8px;
    padding: 1rem;
}

.empty-state {
    padding: 1rem;
    text-align: center;
    color: #888;
}
</style>
