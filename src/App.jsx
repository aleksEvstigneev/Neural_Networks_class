import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { Slider, Paper, Typography, Box, Button, TextField } from '@mui/material';
import { Line } from 'react-chartjs-2';
import NeuralNetworkViz from './components/NeuralNetworkViz';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const inputToHidden = [
  [2.0, 1.8, 1.6, 1.4, 1.2, 1.0],    // Temperature: highest weight as it's crucial
  [-2.0, -1.8, -1.6, -1.4, -1.2, -1.0], // Precipitation: strong negative impact
  [1.6, 1.4, 1.2, 1.0, 0.8, 0.6],    // Wind speed: significant positive impact
  [-1.2, -1.0, -0.8, -0.6, -0.4, -0.2]  // Humidity: moderate negative impact
];

const hiddenToOutput = [[1.2], [1.0], [0.8], [0.6], [0.4], [0.2]];

const presetScenarios = {
  currentTrend: {
    temperature: 2,
    precipitation: -10,
    windspeed: 2,
    humidity: -10
  },
  mitigation: {
    temperature: 1,
    precipitation: 10,
    windspeed: 0,
    humidity: 5
  },
  worstCase: {
    temperature: 4,
    precipitation: -30,
    windspeed: 5,
    humidity: -30
  }
};

function App() {
  const [model, setModel] = useState(null);
  const [inputs, setInputs] = useState({
    temperature: 25,
    precipitation: 50,
    windspeed: 10,
    humidity: 60
  });
  const [simulationInputs, setSimulationInputs] = useState({
    temperature: 0,
    precipitation: 0,
    windspeed: 0,
    humidity: 0
  });
  const [risk, setRisk] = useState(0);
  const [history, setHistory] = useState([]);
  const [layerActivations, setLayerActivations] = useState([]);

  useEffect(() => {
    const createModel = async () => {
      const model = tf.sequential();
      
      model.add(tf.layers.dense({
        inputShape: [4],
        units: 6,
        activation: 'relu',
        weights: [
          tf.tensor2d(inputToHidden),
          tf.zeros([6])
        ]
      }));
      
      model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid',
        weights: [
          tf.tensor2d(hiddenToOutput),
          tf.zeros([1])
        ]
      }));

      setModel(model);
    };

    createModel();
  }, []);

  useEffect(() => {
    if (model) {
      const normalizedInputs = [
        inputs.temperature / 50,
        inputs.precipitation / 100,
        inputs.windspeed / 20,
        inputs.humidity / 100
      ];

      const inputTensor = tf.tensor2d([normalizedInputs]);
      
      const getActivations = async () => {
        const intermediateModel = tf.model({
          inputs: model.input,
          outputs: model.layers.map(layer => layer.output)
        });
        
        const activations = await intermediateModel.predict(inputTensor);
        const activationValues = Array.isArray(activations) 
          ? activations.map(t => t.dataSync())
          : [activations.dataSync()];
        
        setLayerActivations([normalizedInputs, ...activationValues]);
      };
      
      getActivations();

      const prediction = model.predict(inputTensor);
      let riskValue = prediction.dataSync()[0] * 100;

      if (inputs.precipitation > 70) {
        riskValue *= 0.3;
      }
      if (inputs.temperature > 35) {
        riskValue *= 1.2;
      }
      if (inputs.windspeed > 15) {
        riskValue *= 1 + ((inputs.windspeed - 15) / 10);
      }
      if (inputs.humidity < 20) {
        riskValue *= 1.3;
      }

      riskValue = Math.max(0, Math.min(100, riskValue));
      
      setRisk(Math.round(riskValue));
      setHistory(prev => [...prev, { ...inputs, risk: Math.round(riskValue) }].slice(-20));
    }
  }, [model, inputs]);

  const handleSimulation = () => {
    setInputs(prev => ({
      temperature: Math.max(0, Math.min(50, prev.temperature + simulationInputs.temperature)),
      precipitation: Math.max(0, Math.min(100, prev.precipitation + simulationInputs.precipitation)),
      windspeed: Math.max(0, Math.min(20, prev.windspeed + simulationInputs.windspeed)),
      humidity: Math.max(0, Math.min(100, prev.humidity + simulationInputs.humidity))
    }));
  };

  const applyPreset = (preset) => {
    setSimulationInputs(presetScenarios[preset]);
  };

  const chartData = {
    labels: history.map((_, index) => `${index + 1}`),
    datasets: [
      {
        label: 'Fire Risk %',
        data: history.map(h => h.risk),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Fire Risk History'
      }
    },
    scales: {
      y: {
        min: 0,
        max: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Paper elevation={3} className="p-6">
          <Typography variant="h4" gutterBottom>
            Simulation Panel
          </Typography>
          
          <Box className="mb-6">
            <Typography variant="h6" gutterBottom>Preset Scenarios</Typography>
            <div className="flex gap-2 mb-4">
              <Button variant="outlined" onClick={() => applyPreset('currentTrend')}>
                Current Trend
              </Button>
              <Button variant="outlined" onClick={() => applyPreset('mitigation')}>
                Mitigation Scenario
              </Button>
              <Button variant="outlined" onClick={() => applyPreset('worstCase')}>
                Worst Case
              </Button>
            </div>

            <Typography variant="h6" gutterBottom>Custom Changes</Typography>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <TextField
                label="Temperature Change (°C)"
                type="number"
                value={simulationInputs.temperature}
                onChange={(e) => setSimulationInputs(prev => ({
                  ...prev,
                  temperature: Math.max(-4, Math.min(4, Number(e.target.value)))
                }))}
                inputProps={{ min: -4, max: 4 }}
              />
              <TextField
                label="Precipitation Change (%)"
                type="number"
                value={simulationInputs.precipitation}
                onChange={(e) => setSimulationInputs(prev => ({
                  ...prev,
                  precipitation: Math.max(-30, Math.min(30, Number(e.target.value)))
                }))}
                inputProps={{ min: -30, max: 30 }}
              />
              <TextField
                label="Wind Speed Change (m/s)"
                type="number"
                value={simulationInputs.windspeed}
                onChange={(e) => setSimulationInputs(prev => ({
                  ...prev,
                  windspeed: Math.max(-5, Math.min(5, Number(e.target.value)))
                }))}
                inputProps={{ min: -5, max: 5 }}
              />
              <TextField
                label="Humidity Change (%)"
                type="number"
                value={simulationInputs.humidity}
                onChange={(e) => setSimulationInputs(prev => ({
                  ...prev,
                  humidity: Math.max(-30, Math.min(30, Number(e.target.value)))
                }))}
                inputProps={{ min: -30, max: 30 }}
              />
            </div>
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleSimulation}
              fullWidth
            >
              Run Simulation
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} className="p-6">
          <Typography variant="h4" gutterBottom>
            Forest Fire Risk Assessment
          </Typography>
          
          <Box className="mb-6">
            <Typography gutterBottom>Temperature (°C)</Typography>
            <Slider
              value={inputs.temperature}
              onChange={(e, value) => setInputs(prev => ({ ...prev, temperature: value }))}
              min={0}
              max={50}
              valueLabelDisplay="auto"
            />

            <Typography gutterBottom>Precipitation (%)</Typography>
            <Slider
              value={inputs.precipitation}
              onChange={(e, value) => setInputs(prev => ({ ...prev, precipitation: value }))}
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />

            <Typography gutterBottom>Wind Speed (m/s)</Typography>
            <Slider
              value={inputs.windspeed}
              onChange={(e, value) => setInputs(prev => ({ ...prev, windspeed: value }))}
              min={0}
              max={20}
              valueLabelDisplay="auto"
            />

            <Typography gutterBottom>Humidity (%)</Typography>
            <Slider
              value={inputs.humidity}
              onChange={(e, value) => setInputs(prev => ({ ...prev, humidity: value }))}
              min={0}
              max={100}
              valueLabelDisplay="auto"
            />
          </Box>

          <Paper elevation={6} className="p-4 mb-6 bg-gradient-to-r from-green-100 to-red-100">
            <Typography variant="h5" align="center">
              Current Fire Risk: {risk}%
            </Typography>
          </Paper>
        </Paper>

        <Paper elevation={3} className="p-6">
          <Typography variant="h4" gutterBottom>
            Neural Network Visualization
          </Typography>
          <NeuralNetworkViz
            inputs={[
              inputs.temperature / 50,
              inputs.precipitation / 100,
              inputs.windspeed / 20,
              inputs.humidity / 100
            ]}
            weights={[inputToHidden, hiddenToOutput]}
            activations={layerActivations}
          />
          <Box className="mt-4">
            <Typography variant="h6" gutterBottom>
              Calculation Steps
            </Typography>
            <Typography variant="body2">
              1. Input Layer Normalization:
              - Temperature: {(inputs.temperature / 50).toFixed(2)}
              - Precipitation: {(inputs.precipitation / 100).toFixed(2)}
              - Wind Speed: {(inputs.windspeed / 20).toFixed(2)}
              - Humidity: {(inputs.humidity / 100).toFixed(2)}
            </Typography>
            <Typography variant="body2" className="mt-2">
              2. Hidden Layer Activation Values:
              {layerActivations[1]?.map((val, i) => (
                <div key={i}>Node {i + 1}: {val.toFixed(3)}</div>
              ))}
            </Typography>
            <Typography variant="body2" className="mt-2">
              3. Output Layer (Before Adjustments):
              {layerActivations[2]?.map((val, i) => (
                <div key={i}>Risk: {(val * 100).toFixed(1)}%</div>
              ))}
            </Typography>
          </Box>
        </Paper>

        <Paper elevation={3} className="p-6">
          <div className="h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </Paper>

        <Paper elevation={3} className="p-6">
          <Typography variant="h4" gutterBottom>
            Understanding the Fire Risk Assessment
          </Typography>
          
          <Box className="space-y-4">
            <div>
              <Typography variant="h6" gutterBottom>Input Variables and Their Impact</Typography>
              <Typography variant="body1">
                • Temperature (Weight: 2.0): The most critical factor. Higher temperatures increase fire risk by:
                - Drying out vegetation
                - Increasing evaporation rates
                - Creating conditions favorable for fire spread
                {inputs.temperature > 35 && 
                  " Currently at critical levels, significantly increasing risk!"}
              </Typography>
              
              <Typography variant="body1" className="mt-2">
                • Precipitation (Weight: -2.0): Strong negative correlation with fire risk:
                - Higher precipitation reduces risk by increasing moisture content
                - Extended dry periods increase vulnerability
                {inputs.precipitation > 70 && 
                  " Current precipitation levels are helping to suppress fire risk."}
              </Typography>
              
              <Typography variant="body1" className="mt-2">
                • Wind Speed (Weight: 1.6): Significant positive correlation:
                - Accelerates fire spread
                - Affects oxygen availability
                - Influences fire direction
                {inputs.windspeed > 15 && 
                  " High wind speeds are creating dangerous conditions!"}
              </Typography>
              
              <Typography variant="body1" className="mt-2">
                • Humidity (Weight: -1.2): Moderate negative impact:
                - Higher humidity reduces fire risk
                - Low humidity makes vegetation more flammable
                {inputs.humidity < 20 && 
                  " Dangerously low humidity levels detected!"}
              </Typography>
            </div>

            <div>
              <Typography variant="h6" gutterBottom>Neural Network Analysis</Typography>
              <Typography variant="body1">
                The network processes these inputs through:
                1. Normalization: Scaling inputs to comparable ranges
                2. Hidden Layer: Combining factors to identify complex patterns
                3. Output Layer: Converting patterns into a final risk score
                4. Post-processing: Adjusting for extreme conditions
              </Typography>
            </div>

            <div>
              <Typography variant="h6" gutterBottom>Current Risk Assessment</Typography>
              <Typography variant="body1">
                The current fire risk of {risk}% is {
                  risk < 30 ? "low, suggesting safe conditions" :
                  risk < 60 ? "moderate, requiring regular monitoring" :
                  "high, indicating dangerous conditions"
                }. This assessment is based on the combination of all environmental factors and their interactions.
              </Typography>
            </div>
          </Box>
        </Paper>
      </div>
    </div>
  );
}

export default App;
