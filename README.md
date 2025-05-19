📘 Overview 

This project is a React-based web application that visualizes a neural network designed to predict Forest Fire Risk using climate variables. The application demonstrates forward propagation in an interactive and educational way, allowing users to see how climate data inputs affect risk predictions. 

 

🚀 Features 

✅ Neural Network Model 

Built using TensorFlow.js. 

Architecture: 

4 input nodes: 

Temperature change 

Precipitation change 

Wind speed 

Humidity 

1 hidden layer with 6 neurons using ReLU activation 

1 output node producing a Forest Fire Risk Assessment (0% to 100%) 

⚖️ Predefined Weights 

Input → Hidden Layer 

[[2.0, 1.8, 1.6, 1.4, 1.2, 1.0],    // Temperature weights 
  [-2.0, -1.8, -1.6, -1.4, -1.2, -1.0], // Precipitation weights 
  [1.6, 1.4, 1.2, 1.0, 0.8, 0.6],    // Wind speed weights 
  [-1.2, -1.0, -0.8, -0.6, -0.4, -0.2]]  // Humidity weights 
 

 

Hidden → Output Layer 

[ 
  [1.2], 
  [1.0], 
  [0.8], 
  [0.6], 
  [0.4], 
  [0.2]] 
 

 

🎨 Interactive Visualization 

The app features an SVG-based interactive diagram of the neural network that reacts dynamically as users enter input data. 

Visual Behavior: 

Node Activation Intensity: 
 Each node's color intensity reflects its activation value after applying the ReLU function. 

Connection Line Thickness: 
 Lines between nodes vary in thickness based on the weight × input value, helping users see which connections are most influential. 

Sidebar Calculation Display: 
 A real-time sidebar shows all forward propagation calculations step-by-step, including weighted sums and activation outputs for full transparency and learning. 

 

🛠️ Technologies Used 

React (for UI & interactivity) 

TensorFlow.js (for neural network computation) 

SVG (for visualizing the neural network) 

CSS animations (for interactive flow visualization) 

 

🧪 How to Use 

Run the app (npm install and npm start) 

Enter values for temperature change, precipitation change, wind speed, and humidity. 

Watch the neural network light up and animate as it calculates fire risk. 

Review the step-by-step calculations in the sidebar. 
