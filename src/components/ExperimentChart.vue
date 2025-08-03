<script setup>
import { ref, onMounted, watch } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
    data: {
        type: Array,
        required: true
    },
    selectedExperiments: {
        type: Array,
        default: () => []
    }
});

const chart = ref(null);
let chartInstance = null;

const initChart = () => {
    if (chartInstance) {
        chartInstance.dispose();
    }
    chartInstance = echarts.init(chart.value);
    updateChart();
};

const updateChart = () => {
    if (!chartInstance) return;

    const series = [];
    const legendData = [];


    const filteredData = props.data.filter(item =>
        props.selectedExperiments.includes(item.experiment_id)
    );


    const experimentsData = {};
    filteredData.forEach(item => {
        if (!experimentsData[item.experiment_id]) {
            experimentsData[item.experiment_id] = [];
        }
        experimentsData[item.experiment_id].push(item);
    });


    Object.keys(experimentsData).forEach(expId => {
        const expData = experimentsData[expId];


        expData.sort((a, b) => a.step - b.step);

        series.push({
            name: `Experiment ${expId}`,
            type: 'line',
            data: expData.map(item => [item.step, item.value]),
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                width: 2
            }
        });

        legendData.push(`Experiment ${expId}`);
    });

    const option = {
        tooltip: {
            trigger: 'axis',
            formatter: params => {
                return params.map(p =>
                    `${p.seriesName}<br/>Step: ${p.value[0]}<br/>Value: ${p.value[1]}`
                ).join('<br/>');
            }
        },
        legend: {
            data: legendData,
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            top: '5%',
            containLabel: true
        },
        xAxis: {
            type: 'value',
            name: 'Step',
            nameLocation: 'middle',
            nameGap: 25
        },
        yAxis: {
            type: 'value',
            name: 'Value',
            nameLocation: 'middle',
            nameGap: 30
        },
        series: series
    };

    chartInstance.setOption(option);
    chartInstance.resize();
};

onMounted(() => {
    initChart();
});

watch(() => props.selectedExperiments, () => {
    updateChart();
}, { deep: true });

watch(() => props.data, () => {
    updateChart();
}, { deep: true });
</script>

<template>
    <div class="chart-container">
        <div ref="chart" style="height: 400px; width: 100%;"></div>
    </div>
</template>

<style scoped>
.chart-container {
    width: 100%;
    margin-top: 2rem;
    border: 1px solid #eee;
    border-radius: 4px;
    padding: 1rem;
}
</style>