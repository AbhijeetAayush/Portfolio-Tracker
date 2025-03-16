import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import AnnotationsFactory from 'highcharts/modules/annotations';
import { apikeyPH } from '../../services/apikey.js';
import { useEffect, useState } from 'react';
AnnotationsFactory(Highcharts);

const ChartHoldingPriceHistory = ({ holdingData }) => {
    const [historicalData, setHistoricalData] = useState([]);
    const searchedStockSymbol = holdingData?.symbol;

    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${searchedStockSymbol}?timeseries=65&apikey=${apikeyPH}`;

    useEffect(() => {
        if (searchedStockSymbol) {
            fetch(url)
                .then(res => res.json())
                .then(res => {
                    if (res.historical) {
                        setHistoricalData(res.historical);
                    } else {
                        console.error("No historical data found:", res);
                        setHistoricalData([]);
                    }
                })
                .catch(err => {
                    console.error("Error fetching historical data:", err);
                    setHistoricalData([]);
                });
        }
    }, [searchedStockSymbol, url]);

    // Guard against undefined or empty data
    const datePrice = Array.isArray(historicalData)
        ? historicalData.map((day) => [
              Date.parse(day.date),
              day.adjClose
          ]).reverse()
        : [];

    let minMax = {};

    function getMinMax(chart) {
        const yMin = Math.min.apply(
                null,
                chart.series[0].processedYData.slice(0, -1)
            ),
            yMax = Math.max.apply(
                null,
                chart.series[0].processedYData.slice(0, -1)
            ),
            maxIndex = chart.series[0].processedYData.indexOf(yMax),
            minIndex = chart.series[0].processedYData.indexOf(yMin);

        minMax = {
            xMin: chart.series[0].processedXData[minIndex],
            xMax: chart.series[0].processedXData[maxIndex],
            yMin,
            yMax
        };
    }

    const options = {
        chart: {
            borderWidth: 1
        },
        title: {
            text: "Previous close prices"
        },
        tooltip: {
            pointFormat: 'Close price: <b>$ {point.y: .2f}</b>'
        },
        xAxis: {
            type: 'datetime'
        },
        rangeSelector: {
            enabled: true
        },
        credits: {
            enabled: false
        },
        series: [
            {
                data: datePrice,
                type: 'area',
                threshold: null,
                fillColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [
                            1,
                            Highcharts.color(
                                Highcharts.getOptions().colors[0]
                            )
                                .setOpacity(0)
                                .get('rgba')
                        ]
                    ]
                }
            }
        ],
        annotations: [
            {
                draggable: '',
                shapes: [
                    {
                        type: 'path',
                        points: [
                            (annotation) => {
                                getMinMax(annotation.chart);

                                return {
                                    x: annotation.chart.xAxis[0].min,
                                    xAxis: 0,
                                    y: (minMax.yMin + minMax.yMax) / 2,
                                    yAxis: 0
                                };
                            },
                            (annotation) => ({
                                x: annotation.chart.xAxis[0].max,
                                xAxis: 0,
                                y: (minMax.yMin + minMax.yMax) / 2,
                                yAxis: 0
                            })
                        ]
                    }
                ],
                labels: [
                    {
                        point: () => ({
                            x: minMax.xMax,
                            xAxis: 0,
                            y: minMax.yMax,
                            yAxis: 0
                        }),
                        format: 'max close: ${y:.2f}'
                    },
                    {
                        point: () => ({
                            x: minMax.xMin,
                            xAxis: 0,
                            y: minMax.yMin,
                            yAxis: 0
                        }),
                        format: 'min close: ${y:.2f}'
                    },
                    {
                        point: (annotation) => ({
                            x: annotation.chart.xAxis[0].min + 10e7,
                            xAxis: 0,
                            y: (minMax.yMin + minMax.yMax) / 2,
                            yAxis: 0
                        }),
                        y: 11,
                        x: 30,
                        clip: false,
                        overflow: 'none',
                        format: 'avg close: ${y:.2f}'
                    }
                ]
            }
        ]
    };

    return (
        <HighchartsReact
            highcharts={Highcharts}
            constructorType={'stockChart'}
            options={options}
        />
    );
};

export default ChartHoldingPriceHistory;
